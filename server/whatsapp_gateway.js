/**
 * FreshPress WhatsApp Automation Gateway
 * 
 * Capabilities:
 * 1. Outbound Bill Dispatch (POST /send-bill) with Dynamic UPI Links
 * 2. Inbound 7-Day Missing Clothes Complaint Engine (client.on('message'))
 * 3. Outbound Shop Owner Payment Notifications (POST /notify-payment)
 * 4. Automatic Chrome / Edge executable detection on Windows
 * 5. Orders & Tickets cache synchronization with React POS app
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Gateway State
let isReady = false;
let qrCodeStr = null;
let client = null;
let clientPhone = null;

// Synchronized in-memory data from React Billing App
let cachedOrders = [];
let cachedTickets = [];
let cachedSettings = {
  shopName: 'FreshPress Laundry',
  phone: '9876543210',
  ownerWhatsAppPhone: '9876543210',
  shopUpiId: 'freshpress@upi'
};

// Newly registered tickets from inbound WhatsApp messages (to be pulled by frontend)
let pendingNewTickets = [];

/**
 * Detect local browser executable on Windows for instant, reliable Puppeteer startup
 */
function getLocalBrowserExecutablePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return undefined; // Fallback to puppeteer's bundled browser
}

// Initialize WhatsApp Web Client
try {
  const { Client, LocalAuth } = require('whatsapp-web.js');
  const qrcode = require('qrcode-terminal');

  console.log('\n======================================================');
  console.log('🧺 FreshPress Free WhatsApp Automation Gateway');
  console.log('======================================================');
  console.log('Starting WhatsApp Web Session...');

  const executablePath = getLocalBrowserExecutablePath();
  if (executablePath) {
    console.log(`🚀 Using local browser executable: ${executablePath}`);
  }

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', (qr) => {
    qrCodeStr = qr;
    isReady = false;
    console.log('\n📲 SCAN THIS QR CODE WITH YOUR WHATSAPP PHONE:');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Tap Menu (⋮) or Settings -> Linked Devices');
    console.log('3. Tap "Link a Device" and scan this QR code:\n');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    isReady = true;
    qrCodeStr = null;
    clientPhone = client.info?.wid?.user || 'Connected';
    console.log(`\n✅ WhatsApp Gateway is CONNECTED and READY! Linked Account: +${clientPhone}`);
  });

  client.on('authenticated', () => {
    console.log('🔑 WhatsApp authentication successful.');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp authentication failed:', msg);
  });

  client.on('disconnected', (reason) => {
    isReady = false;
    console.log('⚠️ WhatsApp client disconnected:', reason);
  });

  // =========================================================================
  // INBOUND MESSAGE LISTENER: 7-DAY MISSING ITEM COMPLAINTS
  // =========================================================================
  client.on('message', async (msg) => {
    try {
      if (!msg.body || msg.from.includes('@g.us')) return; // Ignore empty or group messages

      const text = msg.body.trim();
      const lower = text.toLowerCase();
      const senderPhone = msg.from.replace(/\D/g, ''); // e.g. "919876543210"

      // Check if message is a complaint
      const isComplaint = 
        lower.startsWith('complaint') || 
        lower.includes('missing') || 
        lower.includes('damaged') ||
        lower.includes('not received') ||
        lower.includes('shikayat') ||
        lower.startsWith('#complaint');

      if (!isComplaint) return;

      console.log(`\n📩 Incoming complaint inquiry from +${senderPhone}: "${text}"`);

      // 1. Try to find the order
      // Check if order ID is mentioned in the text (e.g. #LND-260930-001 or LND-001)
      const orderIdMatch = text.match(/(?:#?LND-[\w-]+|#?FP-[\w-]+)/i);
      let matchedOrder = null;

      if (orderIdMatch) {
        const searchedId = orderIdMatch[0].replace(/^#/, '').toLowerCase();
        matchedOrder = cachedOrders.find(o => 
          String(o.orderId).toLowerCase().includes(searchedId) || 
          String(o.id).toLowerCase().includes(searchedId)
        );
      }

      // If no order ID found in text, look up customer's phone number
      if (!matchedOrder) {
        // Strip country code for matching
        const localPhone10 = senderPhone.slice(-10);
        const customerOrders = cachedOrders.filter(o => {
          const ordPhone = String(o.customerPhone || '').replace(/\D/g, '');
          return ordPhone.endsWith(localPhone10);
        });

        // Pick latest order
        if (customerOrders.length > 0) {
          customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          matchedOrder = customerOrders[0];
        }
      }

      if (!matchedOrder) {
        // Could not locate order
        await msg.reply(
          `Hello! We received your message regarding a complaint.\n\n` +
          `⚠️ We could not find a recent order linked to your number.\n` +
          `Please reply with your Order ID in this format:\n` +
          `*COMPLAINT #<Your-Order-ID> <missing items list>*\n\n` +
          `Or call our laundry store directly at: *${cachedSettings.phone || 'our support line'}*.`
        );
        return;
      }

      // 2. Validate 7-Day Window from Return/Delivery Date
      const deliveryOrCreatedAt = matchedOrder.deliveryDate || matchedOrder.createdAt;
      const refDate = new Date(deliveryOrCreatedAt);
      const now = new Date();
      const timeDiff = now.getTime() - refDate.getTime();
      const elapsedDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      console.log(`Order #${matchedOrder.orderId} date: ${refDate.toISOString()} | Elapsed days: ${elapsedDays}`);

      // Policy rule: Max 7 days from return/delivery
      if (elapsedDays > 7) {
        const formattedDate = refDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        await msg.reply(
          `⚠️ *Complaint Window Expired*\n\n` +
          `Order *#${matchedOrder.orderId}* was scheduled/delivered on *${formattedDate}* (${elapsedDays} days ago).\n\n` +
          `As per our laundry store policy, missing or damaged clothes claims must be reported within *7 days* of return/delivery.\n\n` +
          `If you have questions or special circumstances, please contact shop management directly at: *${cachedSettings.phone || 'our store'}*.`
        );
        console.log(`❌ Complaint rejected for Order #${matchedOrder.orderId}: > 7 days (${elapsedDays} days)`);
        return;
      }

      // 3. Register Complaint Ticket (Within 7-day window)
      const cleanIssue = text
        .replace(/^(?:#?complaint|missing|damaged)\s*/i, '')
        .replace(/(?:#?LND-[\w-]+|#?FP-[\w-]+)/gi, '')
        .trim() || 'Missing clothes reported via WhatsApp';

      const newTicketId = `tkt-wa-${Date.now()}`;
      const ticketNumber = `TCK-${Date.now().toString().slice(-6)}`;

      const newTicket = {
        id: newTicketId,
        ticketNumber,
        customerName: matchedOrder.customerName || 'WhatsApp Customer',
        customerPhone: senderPhone.slice(-10),
        orderId: matchedOrder.orderId,
        issue: `[7-DAY VERIFIED] ${cleanIssue}`,
        category: 'Missing Clothes',
        priority: 'Urgent',
        status: 'Open',
        createdAt: new Date().toISOString(),
        source: 'WhatsApp Auto-Bot',
        elapsedDays: Math.max(0, elapsedDays)
      };

      pendingNewTickets.unshift(newTicket);
      cachedTickets.unshift(newTicket);

      // Confirm to customer
      await msg.reply(
        `✅ *Complaint Registered Successfully!*\n────────────────────────\n` +
        `🎫 *Ticket ID:* #${ticketNumber}\n` +
        `📋 *Order ID:* #${matchedOrder.orderId}\n` +
        `👤 *Customer:* ${matchedOrder.customerName}\n` +
        `⚠️ *Reported Issue:* ${cleanIssue}\n` +
        `⏱️ *Validation:* Verified within 7-day window (${elapsedDays} days since delivery)\n` +
        `────────────────────────\n` +
        `Our laundry manager has been notified and is verifying the washing logs and garment count. We will update you here shortly!`
      );
      console.log(`✅ Ticket #${ticketNumber} created for Order #${matchedOrder.orderId}`);

      // 4. Alert Shop Owner on WhatsApp
      const ownerPhone = cachedSettings.ownerWhatsAppPhone || cachedSettings.phone;
      if (ownerPhone && isReady) {
        let cleanOwner = String(ownerPhone).replace(/\D/g, '');
        if (cleanOwner.length === 10) cleanOwner = '91' + cleanOwner;

        const ownerMsg = 
          `🚨 *NEW MISSING ITEM COMPLAINT REGISTERED!*\n────────────────────────\n` +
          `🎫 *Ticket ID:* #${ticketNumber}\n` +
          `📋 *Order ID:* #${matchedOrder.orderId}\n` +
          `👤 *Customer:* ${matchedOrder.customerName} (+${senderPhone})\n` +
          `⚠️ *Missing Items:* ${cleanIssue}\n` +
          `⏱️ *Elapsed Days:* ${elapsedDays} days (Eligible under 7-day policy)\n` +
          `────────────────────────\n` +
          `👉 Check the Tickets section on your POS app to review and take action.`;

        await client.sendMessage(`${cleanOwner}@c.us`, ownerMsg).catch(err => {
          console.warn('Could not forward complaint alert to owner:', err.message);
        });
      }

    } catch (err) {
      console.error('Error handling inbound message:', err);
    }
  });

  client.initialize().catch((err) => {
    console.warn('⚠️ Could not launch browser for WhatsApp Web:', err.message);
    console.log('ℹ️ Running in simulated mode for testing.');
  });

} catch (e) {
  console.warn('⚠️ whatsapp-web.js not yet loaded in /server directory.');
  console.log('ℹ️ Run "npm install" inside /server to activate live WhatsApp mode.');
}

// =========================================================================
// API ENDPOINTS FOR FRONTEND APP
// =========================================================================

/**
 * Health check & status endpoint
 */
app.get('/status', (req, res) => {
  res.json({
    status: isReady ? 'connected' : (qrCodeStr ? 'waiting_for_qr' : 'disconnected'),
    isReady,
    hasQr: Boolean(qrCodeStr),
    qrCode: qrCodeStr,
    clientPhone
  });
});

/**
 * Sync orders, tickets, and shop settings from React app
 */
app.post('/sync-data', (req, res) => {
  const { orders, tickets, settings } = req.body;
  if (Array.isArray(orders)) cachedOrders = orders;
  if (Array.isArray(tickets)) cachedTickets = tickets;
  if (settings && typeof settings === 'object') cachedSettings = { ...cachedSettings, ...settings };

  res.json({
    success: true,
    ordersCount: cachedOrders.length,
    ticketsCount: cachedTickets.length
  });
});

/**
 * Fetch tickets registered via WhatsApp bot that frontend has not yet seen
 */
app.get('/pending-tickets', (req, res) => {
  const ticketsToSend = [...pendingNewTickets];
  pendingNewTickets = []; // Clear queue
  res.json({
    success: true,
    tickets: ticketsToSend
  });
});

/**
 * Outbound Bill Dispatch
 * Body: { phone: "9876543210", message: "string", orderId: "LND-001" }
 */
app.post('/send-bill', async (req, res) => {
  try {
    const { phone, message, orderId } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required.' });
    }

    let clean = String(phone).replace(/\D/g, '');
    if (clean.length === 10) {
      clean = '91' + clean; // Default India (+91)
    }

    const chatId = `${clean}@c.us`;

    if (!client || !isReady) {
      console.log(`[SIMULATION MODE] WhatsApp bill prepared for +${clean} (Order #${orderId || 'N/A'}):`);
      console.log(message);
      return res.json({
        success: true,
        mode: 'simulated',
        message: 'WhatsApp Gateway not linked. Bill recorded in simulation mode.',
        recipient: clean
      });
    }

    await client.sendMessage(chatId, message);
    console.log(`✅ WhatsApp bill successfully delivered to +${clean} for Order #${orderId || ''}`);

    res.json({
      success: true,
      deliveredTo: clean
    });
  } catch (err) {
    console.error('❌ Error sending WhatsApp message:', err);
    res.status(500).json({
      error: 'Failed to send WhatsApp message',
      details: err.message
    });
  }
});

/**
 * Outbound Payment Notification to Shop Owner
 * Body: { order, shopSettings }
 */
app.post('/notify-payment', async (req, res) => {
  try {
    const { order, ownerPhone, message } = req.body;

    const targetPhone = ownerPhone || cachedSettings.ownerWhatsAppPhone || cachedSettings.phone;
    if (!targetPhone) {
      return res.status(400).json({ error: 'Owner phone number not provided.' });
    }

    let clean = String(targetPhone).replace(/\D/g, '');
    if (clean.length === 10) clean = '91' + clean;

    const notificationText = message || (
      `🎉 *PAYMENT RECEIVED!*\n────────────────────────\n` +
      `📋 *Order ID:* #${order.orderId}\n` +
      `👤 *Customer:* ${order.customerName} (${order.customerPhone})\n` +
      `💰 *Amount:* ₹${order.grandTotal}\n` +
      `💳 *Mode:* ${(order.paymentMode || 'UPI').toUpperCase()}\n` +
      `📅 *Time:* ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}\n` +
      `Status marked as *PAID* in billing system.`
    );

    if (!client || !isReady) {
      console.log(`[SIMULATION MODE] Owner payment notification for +${clean}:`);
      console.log(notificationText);
      return res.json({
        success: true,
        mode: 'simulated',
        recipient: clean
      });
    }

    await client.sendMessage(`${clean}@c.us`, notificationText);
    console.log(`✅ Payment alert delivered to owner WhatsApp +${clean}`);

    res.json({
      success: true,
      deliveredTo: clean
    });
  } catch (err) {
    console.error('❌ Error sending payment notification:', err);
    res.status(500).json({
      error: 'Failed to send payment notification',
      details: err.message
    });
  }
});

/**
 * Automated Payment Webhook Endpoint
 * Called by Android Notification Forwarder or Automated Banking Hook
 * Body: { orderId: "LND-260930-001", amount: 350, utr: "482910394821", ref: "Invoice LND-260930-001" }
 */
app.post('/webhook/payment-received', async (req, res) => {
  try {
    let { orderId, amount, utr, ref } = req.body;

    // If orderId is not explicitly passed, extract from ref or note
    if (!orderId && ref) {
      const match = ref.match(/(?:#?LND-[\w-]+|#?FP-[\w-]+)/i);
      if (match) orderId = match[0].replace(/^#/, '');
    }

    console.log(`\n🔔 AUTOMATED PAYMENT WEBHOOK RECEIVED:`, { orderId, amount, utr, ref });

    let matchedOrder = null;
    if (orderId) {
      const searchedId = orderId.toLowerCase();
      matchedOrder = cachedOrders.find(o => 
        String(o.orderId).toLowerCase().includes(searchedId) || 
        String(o.id).toLowerCase().includes(searchedId)
      );
    }

    if (!matchedOrder && amount) {
      // Find pending order matching the exact amount created recently
      matchedOrder = cachedOrders.find(o => 
        (o.paymentStatus === 'pending' || o.paymentStatus === 'pending_verification') && 
        Number(o.grandTotal) === Number(amount)
      );
    }

    if (matchedOrder) {
      matchedOrder.paymentStatus = 'paid';
      matchedOrder.paymentMode = 'UPI';
      matchedOrder.submittedUtr = utr || matchedOrder.submittedUtr || 'Auto-Verified';
      matchedOrder.paidAt = new Date().toISOString();

      console.log(`✅ Order #${matchedOrder.orderId} automatically updated to PAID.`);

      // Send automated WhatsApp confirmation to Customer
      if (client && isReady && matchedOrder.customerPhone) {
        let cleanCustomer = String(matchedOrder.customerPhone).replace(/\D/g, '');
        if (cleanCustomer.length === 10) cleanCustomer = '91' + cleanCustomer;

        const customerConfirmMsg = 
          `🎉 *PAYMENT CONFIRMED — ${(cachedSettings.shopName || 'FRESHPRESS LAUNDRY').toUpperCase()}* 🧺\n` +
          `────────────────────────\n` +
          `📋 *Order ID:* #${matchedOrder.orderId}\n` +
          `👤 *Customer:* ${matchedOrder.customerName}\n` +
          `💰 *Amount Received:* ₹${matchedOrder.grandTotal}\n` +
          `💳 *Status:* VERIFIED & PAID (UPI)\n` +
          `📅 *Date:* ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}\n` +
          `────────────────────────\n` +
          `✨ Your clothes are now being washed & cared for!\n` +
          `🚚 *Ready By:* ${matchedOrder.deliveryDate || 'Within 48 Hours'}\n\n` +
          `🙏 *Thank you for your prompt payment!*`;

        await client.sendMessage(`${cleanCustomer}@c.us`, customerConfirmMsg).catch(err => {
          console.warn('Could not send payment confirmation to customer:', err.message);
        });
      }

      // Send automated alert to Owner
      const ownerPhone = cachedSettings.ownerWhatsAppPhone || cachedSettings.phone;
      if (client && isReady && ownerPhone) {
        let cleanOwner = String(ownerPhone).replace(/\D/g, '');
        if (cleanOwner.length === 10) cleanOwner = '91' + cleanOwner;

        const ownerMsg = 
          `💰 *PAYMENT AUTO-VERIFIED VIA UPI!*\n────────────────────────\n` +
          `📋 *Order ID:* #${matchedOrder.orderId}\n` +
          `👤 *Customer:* ${matchedOrder.customerName}\n` +
          `💵 *Amount:* ₹${matchedOrder.grandTotal}\n` +
          `🔢 *UTR / Ref:* ${utr || 'Direct Push'}\n` +
          `Status flipped to *PAID* in billing system.`;

        await client.sendMessage(`${cleanOwner}@c.us`, ownerMsg).catch(err => {
          console.warn('Could not send payment alert to owner:', err.message);
        });
      }

      return res.json({
        success: true,
        orderId: matchedOrder.orderId,
        status: 'paid',
        amount: matchedOrder.grandTotal
      });
    }

    res.json({
      success: true,
      status: 'received_unmatched',
      message: 'Payment received but could not match with a pending order.',
      receivedPayload: req.body
    });
  } catch (err) {
    console.error('❌ Error processing payment webhook:', err);
    res.status(500).json({ error: 'Webhook processing failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 FreshPress Gateway Server running on http://localhost:${PORT}`);
  console.log(`• Status:               GET  http://localhost:${PORT}/status`);
  console.log(`• Send Bill:            POST http://localhost:${PORT}/send-bill`);
  console.log(`• Owner Payment Alert:  POST http://localhost:${PORT}/notify-payment`);
  console.log(`• Sync Orders & Data:   POST http://localhost:${PORT}/sync-data`);
  console.log(`• Payment Webhook:      POST http://localhost:${PORT}/webhook/payment-received`);
  console.log(`• Pending Tickets:      GET  http://localhost:${PORT}/pending-tickets\n`);
});
