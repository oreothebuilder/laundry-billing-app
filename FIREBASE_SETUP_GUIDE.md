# 🔥 Firebase Cloud Firestore Backend Setup Guide (Step-by-Step)

This guide walks you through connecting your Laundry Billing App to **Google Cloud Firestore**.
Once connected, **no mock data is used** — every bill, cloth item, and status update is saved directly to your live Cloud Firestore database and synchronizes in real time across your phone, tablet, and computer.

---

## ⚡ Fast Setup (Option A: In-App UI - Recommended)

1. Open your app on your mobile phone or PC: [http://localhost:3000](http://localhost:3000) (or `http://192.168.1.22:3000` on mobile).
2. Tap the **"Connect Firebase"** pill at the top right of the navigation bar.
3. Paste your `firebaseConfig` object (from Step 3 below) into the box.
4. Tap **"Connect & Save Firebase Backend"**.
5. Tap **"Test Connection (Ping)"** to verify that read/write works live!
6. Tap **"Seed Clothes to Firestore"** to instantly populate standard clothes (T-shirts, shorts, socks, pillow covers, bedsheets) into your real database.

---

## 🛠️ Step-by-Step Firebase Project Setup

### Step 1: Open Firebase Console
1. Go to **[https://console.firebase.google.com](https://console.firebase.google.com)**.
2. Sign in with your Google account.

### Step 2: Select or Create a Project
* You can select one of your existing projects (e.g. `boombaam-79272`, `ezprint-saas-platform`, `fingermark-attendance`, `janraksha-crowdguard`, `lakshya-flats`, `muj-lovebird-v1`), OR:
* Click **"Add Project"**:
  - Name it `freshpress-laundry` (or any name you prefer).
  - Disable Google Analytics (optional).
  - Click **Create Project**.

### Step 3: Register a Web App & Get Your Config Keys
1. On your Firebase project overview page, click the **Web icon (`</>`)** to add an app.
2. Enter an app nickname (e.g., `laundry-app`).
3. Click **Register app**.
4. Firebase will display your `firebaseConfig` credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789...",
     appId: "1:123456789:web:abcdef..."
   };
   ```
5. Copy this code.

### Step 4: Enable Cloud Firestore Database
1. In the left sidebar of Firebase Console, click **Build → Firestore Database**.
2. Click **Create Database**.
3. Choose your database location (e.g. `asia-south1` Mumbai or `us-central`).
4. In Security Rules, choose **"Start in test mode"** (this allows read and write operations for your shop counter):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   *(A production `firestore.rules` file is also included in your project root).*
5. Click **Enable**.

---

## 📁 Alternative Setup: Using `.env` File

If you prefer configuring via file instead of the UI:
1. Open `.env` (or copy `.env.example` to `.env`):
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```
2. Restart the app (`npm run dev`).

---

## 🗄️ Collections Created in Your Firestore Database

| Collection | Purpose | Fields |
|---|---|---|
| `orders` | Every laundry bill created | `orderId`, `customerName`, `customerPhone`, `serviceType`, `items` (array), `totalWeight`, `grandTotal`, `paymentStatus`, `orderStatus`, `createdAt` |
| `items` | Clothes catalog & pricing | `id`, `name`, `category`, `icon`, `defaultPrices` (`regular`, `premium`, `dry_cleaning`, `others`) |
| `settings` | Shop profile & rates | Document `settings/shop_profile`: `shopName`, `phone`, `address`, `currency`, `regularKgRate`, `terms` |

---

## 📶 Offline & Mobile Resilience
Cloud Firestore is initialized with **Persistent Local Cache**. If your mobile internet flickers while creating a bill at the counter:
1. The app saves the order instantly in the local cache.
2. As soon as connectivity returns, Firestore automatically syncs the data to the cloud in the background.
