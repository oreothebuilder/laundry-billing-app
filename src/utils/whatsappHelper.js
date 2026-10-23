/**
 * WhatsApp & Payment Helper Utilities
 * Handles formatting, UPI deep-links, and template messages for:
 * 1. Customer Invoices (Multi-service and single service)
 * 2. 7-Day Complaint Policy Instructions
 * 3. Owner Payment Notifications
 * 4. Owner Complaint Alerts
 */

/**
 * Strips India country code prefix (+91, 91, or leading 0) and returns up to 10 pure digits.
 */
export function stripCountryCode(phone) {
  if (!phone) return '';
  let str = String(phone).trim();
  if (str.startsWith('+91')) {
    str = str.slice(3).trim();
  } else if (str.startsWith('+')) {
    str = str.replace(/^\+\d{1,3}/, '').trim();
  }
  let cleaned = str.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  return cleaned.slice(0, 10);
}

/**
 * Formats any Indian phone number to start with +91 by default (e.g. "+91 98765 43210").
 */
export function formatDisplayPhoneNumber(phone) {
  if (!phone) return '';
  const digits = stripCountryCode(phone);
  if (!digits) return '';
  if (digits.length <= 5) {
    return `+91 ${digits}`;
  }
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/**
 * Cleans and formats phone number for WhatsApp international standard.
 * e.g. "9876543210" or "+91 98765 43210" -> "919876543210"
 */
export function formatPhoneNumberForWhatsApp(phone, defaultCountryCode = '91') {
  if (!phone) return '';
  const str = String(phone).trim();
  if (str.startsWith('+')) {
    return str.replace(/\D/g, '');
  }
  const digits = stripCountryCode(phone);
  if (digits.length === 10) {
    return defaultCountryCode + digits;
  }
  let cleaned = str.replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = defaultCountryCode + cleaned;
  }
  return cleaned;
}

/**
 * Generates an Indian NPCI UPI Deep Link for 1-click customer payment.
 * Works with GPay, PhonePe, Paytm, BHIM, Cred, etc.
 */
export function buildUpiPaymentUrl(order, shopSettings = {}) {
  const upiId = (shopSettings.shopUpiId || 'btech@upi').trim();
  const payeeName = (shopSettings.shopName || 'BTech Drycleaners').trim();
  const amount = order.grandTotal || 0;
  const transactionNote = `Invoice ${order.orderId}`;

  // Standard NPCI UPI URI Specification
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
}

/**
 * Builds the masked HTTPS deep link URL for WhatsApp.
 * It hides the raw upi:// scheme behind a clean, professional web link.
 */
export function buildPaymentRedirectUrl(order, shopSettings = {}) {
  let baseUrl = (shopSettings.hostedAppUrl || '').trim();
  if (!baseUrl) {
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      baseUrl = window.location.origin;
    } else {
      baseUrl = 'https://btech-laundry.web.app';
    }
  }
  // Strip trailing slash
  baseUrl = baseUrl.replace(/\/+$/, '');

  const upiId = (shopSettings.shopUpiId || 'btech@okaxis').trim();
  const payeeName = (shopSettings.shopName || 'BTech Drycleaners').trim();
  const amount = order.grandTotal || 0;
  const orderId = order.orderId || '';
  const customerName = order.customerName || '';

  const params = new URLSearchParams({
    id: orderId,
    am: amount.toString(),
    pa: upiId,
    pn: payeeName
  });

  if (customerName) {
    params.set('cn', customerName);
  }

  return `${baseUrl}/pay?${params.toString()}`;
}

/**
 * Safe date parser for Firestore Timestamps, ISO strings, etc.
 */
export function parseOrderDate(val) {
  if (!val) return new Date();
  if (typeof val.toDate === 'function') return val.toDate();
  if (val.seconds) return new Date(val.seconds * 1000);
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Builds a formatted WhatsApp text message receipt.
 * Supports multi-service orders (Regular wash, Premium care, Dry cleaning, Others).
 */
export function buildWhatsAppReceiptMessage(order, shopSettings = {}) {
  if (!order) return '';
  const currency = shopSettings?.currency || '₹';
  const shopName = shopSettings?.shopName || 'BTech Drycleaners';
  const upiId = shopSettings?.shopUpiId || '';
  
  let lines = [];
  
  lines.push(`🧺 *${shopName.toUpperCase()}* 🧺`);
  lines.push(`*🧾 INVOICE / RECEIPT*`);
  lines.push(`────────────────────────`);
  lines.push(`📋 *Order ID:* #${order.orderId || ''}`);
  lines.push(`👤 *Customer:* ${order.customerName || 'Customer'}`);
  lines.push(`📞 *Phone:* ${formatDisplayPhoneNumber(order.customerPhone) || order.customerPhone || ''}`);
  lines.push(`📅 *Date:* ${parseOrderDate(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
  lines.push(`🚚 *Ready By:* ${order.deliveryDate || 'Within 48 Hours'}`);

  // Display services summary
  const servicesList = Array.isArray(order.selectedServices) 
    ? order.selectedServices.map(s => {
        if (s === 'regular') return 'Regular Wash';
        if (s === 'premium') return 'Premium Care';
        if (s === 'dry_cleaning') return 'Dry Cleaning';
        return 'Others';
      }).join(', ')
    : (order.serviceName || 'Laundry Service');

  lines.push(`✨ *Services:* ${servicesList}`);
  lines.push(`────────────────────────`);
  lines.push(`*CLOTHES & SERVICES BREAKDOWN:*`);

  const items = Array.isArray(order.items)
    ? order.items
    : (order.items && typeof order.items === 'object' ? Object.values(order.items) : []);
  const regItems = items.filter(i => i?.serviceCategory === 'regular');
  const premItems = items.filter(i => i?.serviceCategory === 'premium');
  const dcItems = items.filter(i => i?.serviceCategory === 'dry_cleaning');
  const othItems = items.filter(i => i?.serviceCategory === 'others' || (!i?.serviceCategory && order.pricingMode !== 'per_kg'));

  // 1. Regular Wash
  if (regItems.length > 0 || (order.regularWeight && Number(order.regularWeight) > 0)) {
    const regWeight = order.regularWeight || order.totalWeight || 0;
    const regRate = order.regularRatePerKg || shopSettings.regularKgRate || 60;
    const regAmt = order.regularAmount ?? Math.round(Number(regWeight) * Number(regRate));
    lines.push(`\n🧺 *Regular Wash (${regWeight} kg @ ${currency}${regRate}/kg = ${currency}${regAmt}):*`);
    regItems.forEach(i => {
      lines.push(`  • ${i.name} — ${i.quantity} pcs`);
    });
  }

  // 2. Premium Care
  if (premItems.length > 0 || (order.premiumWeight && Number(order.premiumWeight) > 0)) {
    const premWeight = order.premiumWeight || 0;
    const premRate = order.premiumRatePerKg || shopSettings.premiumKgRate || 80;
    const premAmt = order.premiumAmount ?? Math.round(Number(premWeight) * Number(premRate));
    lines.push(`\n✨ *Premium Care (${premWeight} kg @ ${currency}${premRate}/kg = ${currency}${premAmt}):*`);
    premItems.forEach(i => {
      lines.push(`  • ${i.name} — ${i.quantity} pcs`);
    });
  }

  // 3. Dry Cleaning
  if (dcItems.length > 0) {
    const dcAmt = order.dryCleaningAmount ?? dcItems.reduce((sum, i) => sum + ((i.unitPrice || i.price || 0) * (i.quantity || 0)), 0);
    lines.push(`\n🧥 *Dry Cleaning (Piece Rates = ${currency}${dcAmt}):*`);
    dcItems.forEach(i => {
      lines.push(`  • ${i.name} x ${i.quantity} pcs [${currency}${i.unitPrice || i.price} ea = ${currency}${(i.unitPrice || i.price) * i.quantity}]`);
    });
  }

  // 4. Others
  if (othItems.length > 0) {
    const othAmt = order.othersAmount ?? othItems.reduce((sum, i) => sum + ((i.unitPrice || i.price || 0) * (i.quantity || 0)), 0);
    lines.push(`\n👟 *Others (= ${currency}${othAmt}):*`);
    othItems.forEach(i => {
      lines.push(`  • ${i.name} x ${i.quantity} pcs [${currency}${i.unitPrice || i.price} ea = ${currency}${(i.unitPrice || i.price) * i.quantity}]`);
    });
  }

  // Fallback for legacy single-service orders
  if (regItems.length === 0 && premItems.length === 0 && dcItems.length === 0 && othItems.length === 0) {
    items.forEach((item, idx) => {
      lines.push(`${idx + 1}. *${item.name}* — ${item.quantity} pcs`);
    });
  }

  lines.push(`────────────────────────`);
  lines.push(`👕 *Total Clothes Count:* ${order.totalPieces} pcs`);
  
  const totalWashWeight = (parseFloat(order.regularWeight) || 0) + (parseFloat(order.premiumWeight) || 0);
  if (totalWashWeight > 0) {
    lines.push(`⚖️ *Total Wash Weight:* ${totalWashWeight.toFixed(1)} kg`);
  } else if (order.totalWeight && Number(order.totalWeight) > 0) {
    lines.push(`⚖️ *Total Weight:* ${order.totalWeight} kg`);
  }

  if (order.subtotal && order.subtotal !== order.grandTotal) {
    lines.push(`Subtotal: ${currency}${order.subtotal}`);
  }
  
  if (order.discount && Number(order.discount) > 0) {
    lines.push(`🏷️ *Discount:* -${currency}${order.discount}`);
  }
  
  lines.push(`💰 *GRAND TOTAL: ${currency}${order.grandTotal}*`);

  const isPaid = order.paymentStatus === 'paid';
  if (isPaid) {
    lines.push(`💳 *Payment Status:* PAID (${order.paymentMode || 'Cash'})`);
  } else {
    lines.push(`💳 *Payment Status:* PENDING (${order.paymentMode || 'UPI / Pay on Delivery'})`);
    
    // Attach Masked 1-Tap Online Payment Link
    const payLink = buildPaymentRedirectUrl(order, shopSettings);
    lines.push(`────────────────────────`);
    lines.push(`📲 *TAP TO PAY ONLINE (GPay / PhonePe / Paytm):*`);
    lines.push(`👉 ${payLink}`);
    if (upiId) {
      lines.push(`\nOr Pay directly to UPI ID: *${upiId}*`);
    }
  }

  // 7-Day Missing Item Policy Instruction
  lines.push(`────────────────────────`);
  lines.push(`🛡️ *7-DAY MISSING ITEM POLICY:*`);
  lines.push(`Please verify your clothes at pickup/delivery.`);
  lines.push(`To report missing clothes within 7 days, reply to this chat:`);
  lines.push(`*COMPLAINT #${order.orderId} <missing item details>*`);

  lines.push(`────────────────────────`);
  lines.push(`📍 *Pickup Location:*`);
  lines.push(`${shopSettings.address || ''}, ${shopSettings.city || ''}`);
  lines.push(`📞 *Contact Support:* ${formatDisplayPhoneNumber(shopSettings.phone) || shopSettings.phone || ''}`);
  lines.push(`\n🙏 *Thank you for trusting us with your clothes!*`);
  
  return lines.join('\n');
}

/**
 * Builds customer notification message when their payment is confirmed.
 */
export function buildPaymentSuccessWhatsAppMessage(order, shopSettings = {}) {
  const currency = shopSettings.currency || '₹';
  const shopName = shopSettings.shopName || 'BTech Drycleaners';
  
  return [
    `🎉 *PAYMENT CONFIRMED — ${shopName.toUpperCase()}* 🧺`,
    `────────────────────────`,
    `📋 *Order ID:* #${order.orderId}`,
    `👤 *Customer:* ${order.customerName}`,
    `💰 *Amount Received:* ${currency}${order.grandTotal}`,
    `💳 *Status:* VERIFIED & PAID (${order.paymentMode || 'UPI'})`,
    `📅 *Date:* ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    `────────────────────────`,
    `✨ Your clothes are now being washed & cared for!`,
    `🚚 *Ready By:* ${order.deliveryDate || 'Within 48 Hours'}`,
    `\n🙏 *Thank you for choosing ${shopName}!*`
  ].join('\n');
}

/**
 * Builds owner notification message when payment is recorded.
 */
export function buildOwnerPaymentNotificationMessage(order, shopSettings = {}) {
  const currency = shopSettings.currency || '₹';
  const shopName = shopSettings.shopName || 'BTech Drycleaners';
  
  return [
    `🎉 *PAYMENT RECEIVED — ${shopName.toUpperCase()}*`,
    `────────────────────────`,
    `📋 *Order ID:* #${order.orderId}`,
    `👤 *Customer:* ${order.customerName}`,
    `📞 *Phone:* ${formatDisplayPhoneNumber(order.customerPhone) || order.customerPhone}`,
    `💰 *Amount:* ${currency}${order.grandTotal}`,
    `💳 *Payment Mode:* ${(order.paymentMode || 'UPI').toUpperCase()}`,
    `📅 *Time:* ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} (${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`,
    `────────────────────────`,
    `👕 *Total Items:* ${order.totalPieces} pcs`,
    `Status updated to *PAID* in billing system.`
  ].join('\n');
}

/**
 * Returns the wa.me URL for one-click opening.
 */
export function getWhatsAppShareUrl(phone, message) {
  const cleanPhone = formatPhoneNumberForWhatsApp(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
