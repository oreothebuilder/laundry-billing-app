# 🧺 FreshPress Laundry Billing & POS App

A professional, easy-to-use billing and counter management app designed specifically for laundry and dry-cleaning businesses.

---

## ✨ Features

- **Customer Intake**: Customer Name, WhatsApp Phone number (with international auto-formatting and auto-fill for returning customers), and delivery date.
- **Service Categories**:
  - `Regular` (Everyday wash & fold/iron)
  - `Premium` (Individual gentle wash & premium press)
  - `Dry Cleaning` (Suits, blazers, silks, woolens)
  - `Others` (Express delivery, steam press only, custom fabrics)
- **Dynamic Item Management**:
  - Preset items: **T-shirts, Shorts, Socks, Pillow Covers, Bedsheets**, Shirts, Jeans, Suits, Kurta, Blankets, Towels, Jackets, etc.
  - Increment (`+`), decrement (`-`), direct quantity entry.
  - Built-in **Clothes & Price Catalog Manager** to add custom clothes, edit names, and customize rates per service type.
  - "Load Demo Example" button that fills the exact test scenario (4 T-shirts, 5 shorts, 2 socks, 1 pillow cover, 1 bedsheet, 3.5 kg) in 1 click!
- **Total Clothes Weight (kg)**:
  - Input total weight of clothes.
  - Support for piece-based billing, weight-based billing (₹/kg), or hybrid billing.
- **Bill Generation & POS Printing**:
  - Unique Order ID (e.g. `#LND-260928-001`).
  - Interactive Modern Invoice view and Thermal POS Receipt (80mm/58mm) view.
  - Browser print support (`window.print()`).
  - Confetti celebration upon bill creation.
- **WhatsApp Notification (100% Free, Zero AI)**:
  - 1-Click WhatsApp Direct dispatch via official Click-to-Chat protocol (`https://wa.me/`).
  - Live in-app WhatsApp chat bubble preview with copy text option.
  - Optional headless background Node.js gateway (`server/whatsapp_gateway.js`) using QR-code linked WhatsApp Web for automated zero-click delivery.
- **Order History & Status Tracking**:
  - Track orders across: *Received -> Washing -> Ready for Pickup -> Delivered*.
  - Search by Name, Phone, or Order ID.
  - Resend bills on WhatsApp anytime.

---

## 🚀 How to Run the App

1. In the project root, start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser at:
   ```
   http://localhost:3000
   ```

---

## 📲 How to Test Free WhatsApp Automation

1. Click on the **"Free WhatsApp Automation"** tab in the top navigation.
2. Enter your own phone number in the tester.
3. Click **"Test Send Sample Bill on WhatsApp"**.
4. WhatsApp will open with the formatted receipt pre-typed with order ID, clothes breakdown, weight, and grand total ready to send.
