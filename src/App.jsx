import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowDown, Shirt, Scale } from 'lucide-react';

// Authentication Layer
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import SplashScreen from './components/SplashScreen';

// Components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TrackMoney from './components/TrackMoney';
import SettingsPage from './components/SettingsPage';
import CustomerForm from './components/CustomerForm';
import ServiceSelector from './components/ServiceSelector';
import ItemPicker from './components/ItemPicker';
import WeightAndPricing from './components/WeightAndPricing';
import BillModal from './components/BillModal';
import WhatsAppPreviewModal from './components/WhatsAppPreviewModal';
import ItemManagerModal from './components/ItemManagerModal';
import OrderHistory from './components/OrderHistory';
// Services & Utils
import { firebaseService } from './services/firebaseService';
import { generateOrderId } from './utils/generateOrderId';
import { DEFAULT_SERVICES, DEFAULT_CATEGORY_ITEMS, DEFAULT_WASH_ITEMS, DEFAULT_SHOP_SETTINGS } from './data/defaultItems';
import { buildWhatsAppReceiptMessage, buildOwnerPaymentNotificationMessage } from './utils/whatsappHelper';

function AppContent() {
  const { currentUser, loading } = useAuth();

  // Navigation: Default landing page is 'dashboard'!
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'issue_bill', 'track_money', 'settings', 'history'
  const [catalogCategoryTab, setCatalogCategoryTab] = useState('regular');

  // Master Data (Driven by Cloud Firestore in Real-Time)
  const [categoryItems, setCategoryItems] = useState(DEFAULT_CATEGORY_ITEMS);
  const [orders, setOrders] = useState([]);
  const [shopSettings, setShopSettings] = useState(DEFAULT_SHOP_SETTINGS);
  const [recentCustomers, setRecentCustomers] = useState([]);

  // Active Order State (Multi-Service & Dual-Weight Billing Flow)
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    deliveryDate: ''
  });
  const [selectedServices, setSelectedServices] = useState(['regular']);
  const [orderItems, setOrderItems] = useState([]);
  const [regularWeight, setRegularWeight] = useState('');
  const [premiumWeight, setPremiumWeight] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentMode, setPaymentMode] = useState('Cash');

  // Modals
  const [currentBillModalOrder, setCurrentBillModalOrder] = useState(null);
  const [whatsAppPreviewOrder, setWhatsAppPreviewOrder] = useState(null);
  const [isItemManagerOpen, setIsItemManagerOpen] = useState(false);
  const [itemManagerInitialCategory, setItemManagerInitialCategory] = useState('regular');

  // Real-time Cloud Firestore Subscriptions (Active only when authenticated)
  useEffect(() => {
    if (!currentUser) return;

    // 1. Subscribe to Orders in real-time
    const unsubscribeOrders = firebaseService.subscribeToOrders((loadedOrders) => {
      const safeOrders = Array.isArray(loadedOrders) ? loadedOrders.filter(Boolean) : [];
      setOrders(safeOrders);
      
      // Extract unique customer contacts for auto-complete
      const customerMap = new Map();
      safeOrders.forEach(o => {
        if (o?.customerPhone && !customerMap.has(o.customerPhone)) {
          customerMap.set(o.customerPhone, {
            name: o.customerName || '',
            phone: o.customerPhone
          });
        }
      });
      setRecentCustomers(Array.from(customerMap.values()));
    });

    // 2. Subscribe to Clothes by Category in real-time
    const unsubscribeCategoryItems = firebaseService.subscribeToCategoryItems((loadedCategoryItems) => {
      if (loadedCategoryItems && loadedCategoryItems.regular) {
        setCategoryItems(loadedCategoryItems);
      }
    });

    // 3. Subscribe to Shop Settings in real-time
    const unsubscribeSettings = firebaseService.subscribeToSettings((loadedSettings) => {
      if (loadedSettings) {
        setShopSettings(prev => ({ ...prev, ...loadedSettings }));
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeCategoryItems();
      unsubscribeSettings();
    };
  }, [currentUser]);

  // 2. WhatsApp Gateway Synchronizer (Only if gateway configured)
  useEffect(() => {
    if (!shopSettings.gatewayUrl) return;
    const gatewayUrl = shopSettings.gatewayUrl;

    // Sync latest orders and settings to the gateway
    fetch(`${gatewayUrl}/sync-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders, settings: shopSettings })
    }).catch(() => {});
  }, [orders.length, shopSettings.gatewayUrl]);

  // Handle toggling multiple service categories
  const handleToggleService = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        if (prev.length <= 1) return prev; // Keep at least one service active
        return prev.filter(s => s !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Handler: Update Quantity of an item in the bill under a specific service
  const handleUpdateQuantity = (clothItem, newQty, serviceCategory) => {
    const unitPrice = typeof clothItem.price === 'number' 
      ? clothItem.price 
      : (typeof clothItem.unitPrice === 'number' ? clothItem.unitPrice : 30);

    const itemId = clothItem.id || clothItem.itemId;
    const targetCategory = serviceCategory || clothItem.serviceCategory || selectedServices[0] || 'regular';

    if (newQty <= 0) {
      setOrderItems(prev => prev.filter(i => !( (i.itemId === itemId || i.id === itemId) && i.serviceCategory === targetCategory )));
      return;
    }

    setOrderItems(prev => {
      const existingIndex = prev.findIndex(i => (i.itemId === itemId || i.id === itemId) && i.serviceCategory === targetCategory);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: newQty,
          itemTotal: newQty * copy[existingIndex].unitPrice
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            itemId,
            id: itemId,
            name: clothItem.name,
            serviceCategory: targetCategory,
            unitPrice,
            quantity: newQty,
            itemTotal: newQty * unitPrice
          }
        ];
      }
    });
  };

  const handleRemoveItem = (itemId, serviceCategory) => {
    setOrderItems(prev => prev.filter(i => !( (i.itemId === itemId || i.id === itemId) && (!serviceCategory || i.serviceCategory === serviceCategory) )));
  };

  // Handler: Quick add custom cloth
  const handleAddCustomQuickItem = async ({ name, price, serviceCategory }) => {
    const targetCategory = serviceCategory || selectedServices[0] || 'regular';
    const newItem = {
      id: `${targetCategory.slice(0, 3)}-${Date.now()}`,
      name,
      price: Number(price) || 30,
      serviceCategory: targetCategory
    };

    const isWash = targetCategory === 'regular' || targetCategory === 'premium';
    let updatedCategoryItems;
    if (isWash) {
      const newWashList = [...(categoryItems.regular || []), newItem];
      updatedCategoryItems = {
        ...categoryItems,
        regular: newWashList,
        premium: newWashList
      };
    } else {
      updatedCategoryItems = {
        ...categoryItems,
        [targetCategory]: [...(categoryItems[targetCategory] || []), newItem]
      };
    }

    setCategoryItems(updatedCategoryItems);
    await firebaseService.saveCategoryItems(updatedCategoryItems);
    handleUpdateQuantity(newItem, 1, targetCategory);
  };

  // Handler: Edit cloth name or price in catalog directly
  const handleEditItem = async (itemId, newName, newPrice, serviceCategory) => {
    const isWash = serviceCategory === 'regular' || serviceCategory === 'premium' || serviceCategory === 'wash';
    let updated;
    if (isWash) {
      const currentWash = categoryItems.regular || categoryItems.wash || DEFAULT_WASH_ITEMS;
      const updatedWash = currentWash.map(it => 
        (it.id === itemId) ? { ...it, name: newName } : it
      );
      updated = {
        ...categoryItems,
        regular: updatedWash,
        premium: updatedWash
      };
    } else {
      const currentList = categoryItems[serviceCategory] || [];
      const updatedList = currentList.map(it => 
        (it.id === itemId) ? { ...it, name: newName, price: Number(newPrice) || it.price } : it
      );
      updated = {
        ...categoryItems,
        [serviceCategory]: updatedList
      };
    }
    setCategoryItems(updated);
    await firebaseService.saveCategoryItems(updated);

    // Also update orderItems if this item is currently in the order
    setOrderItems(prev => prev.map(oi => {
      if ((oi.itemId === itemId || oi.id === itemId) && oi.serviceCategory === serviceCategory) {
        const unitPrice = !isWash && Number(newPrice) ? Number(newPrice) : oi.unitPrice;
        return {
          ...oi,
          name: newName,
          unitPrice,
          itemTotal: oi.quantity * unitPrice
        };
      }
      return oi;
    }));
  };

  // Handler: Delete cloth item from catalog directly
  const handleDeleteItem = async (itemId, serviceCategory) => {
    const isWash = serviceCategory === 'regular' || serviceCategory === 'premium' || serviceCategory === 'wash';
    let updated;
    if (isWash) {
      const currentWash = categoryItems.regular || categoryItems.wash || DEFAULT_WASH_ITEMS;
      const updatedWash = currentWash.filter(it => it.id !== itemId);
      updated = {
        ...categoryItems,
        regular: updatedWash,
        premium: updatedWash
      };
    } else {
      const currentList = categoryItems[serviceCategory] || [];
      const updatedList = currentList.filter(it => it.id !== itemId);
      updated = {
        ...categoryItems,
        [serviceCategory]: updatedList
      };
    }
    setCategoryItems(updated);
    await firebaseService.saveCategoryItems(updated);

    // Also remove from orderItems if it was selected in the bill
    setOrderItems(prev => prev.filter(oi => !((oi.itemId === itemId || oi.id === itemId) && oi.serviceCategory === serviceCategory)));
  };

  // Calculations for Multi-Service Order
  const hasRegular = selectedServices.includes('regular');
  const hasPremium = selectedServices.includes('premium');
  const hasDryCleaning = selectedServices.includes('dry_cleaning');
  const hasOthers = selectedServices.includes('others');

  const regularRate = shopSettings.regularKgRate || 60;
  const premiumRate = shopSettings.premiumKgRate || 80;

  const regWeightNum = parseFloat(regularWeight) || 0;
  const regularAmount = hasRegular ? Math.round(regWeightNum * regularRate) : 0;

  const premWeightNum = parseFloat(premiumWeight) || 0;
  const premiumAmount = hasPremium ? Math.round(premWeightNum * premiumRate) : 0;

  const dryCleaningAmount = hasDryCleaning 
    ? orderItems.filter(i => i.serviceCategory === 'dry_cleaning')
        .reduce((sum, i) => sum + ((i.unitPrice || i.price || 0) * (i.quantity || 0)), 0)
    : 0;

  const othersAmount = hasOthers 
    ? orderItems.filter(i => i.serviceCategory === 'others')
        .reduce((sum, i) => sum + ((i.unitPrice || i.price || 0) * (i.quantity || 0)), 0)
    : 0;

  const subtotal = regularAmount + premiumAmount + dryCleaningAmount + othersAmount;
  const discountNum = Math.min(subtotal, Math.max(0, parseFloat(discount) || 0));
  const grandTotal = Math.max(0, Math.round(subtotal - discountNum));
  const totalPieces = orderItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const totalWeight = (regWeightNum + premWeightNum) > 0 ? parseFloat((regWeightNum + premWeightNum).toFixed(2)) : null;

  // Handler: Generate Bill & Save to Cloud Firestore
  const handleGenerateBill = async () => {
    if (orderItems.length === 0) {
      window.alert('Please add at least one cloth item to generate a bill.');
      return;
    }
    if (hasRegular && regWeightNum <= 0) {
      window.alert('Please enter the Regular Wash clothes weight (kg).');
      return;
    }
    if (hasPremium && premWeightNum <= 0) {
      window.alert('Please enter the Premium Care clothes weight (kg).');
      return;
    }
    if (!customer.name.trim() || !customer.phone.trim()) {
      window.alert('Please enter customer Name and WhatsApp Phone number before generating the bill.');
      return;
    }

    const serviceDisplay = selectedServices.map(s => {
      if (s === 'regular') return 'Regular Wash';
      if (s === 'premium') return 'Premium Care';
      if (s === 'dry_cleaning') return 'Dry Cleaning';
      return 'Others';
    }).join(' + ');

    const newOrder = {
      orderId: generateOrderId(orders),
      createdAt: new Date().toISOString(),
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim(),
      deliveryDate: customer.deliveryDate || 'Within 48 Hours',
      selectedServices: [...selectedServices],
      serviceName: serviceDisplay,
      serviceType: selectedServices[0] || 'regular',
      items: [...orderItems],
      totalPieces,
      totalWeight,
      regularWeight: hasRegular ? regWeightNum : 0,
      regularRatePerKg: regularRate,
      regularAmount,
      premiumWeight: hasPremium ? premWeightNum : 0,
      premiumRatePerKg: premiumRate,
      premiumAmount,
      dryCleaningAmount,
      othersAmount,
      subtotal,
      discount: discountNum,
      grandTotal,
      paymentStatus,
      paymentMode,
      orderStatus: 'received'
    };

    // Save directly to Cloud Firestore Backend
    try {
      await firebaseService.createOrder(newOrder);
    } catch (err) {
      console.warn('Order saved locally as fallback');
    }

    // Auto-dispatch bill via WhatsApp Gateway in background if configured
    if (shopSettings.autoSendWhatsAppBill && shopSettings.gatewayUrl) {
      const gatewayUrl = shopSettings.gatewayUrl;
      const receiptMessage = buildWhatsAppReceiptMessage(newOrder, shopSettings);

      fetch(`${gatewayUrl}/send-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: newOrder.customerPhone,
          message: receiptMessage,
          orderId: newOrder.orderId
        })
      }).catch(() => {});
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setCurrentBillModalOrder(newOrder);
  };

  const handleResetOrder = () => {
    setCustomer({
      name: '',
      phone: '',
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setSelectedServices(['regular']);
    setOrderItems([]);
    setRegularWeight('');
    setPremiumWeight('');
    setDiscount('');
    setPaymentStatus('pending');
    setPaymentMode('Cash');
  };

  // Firestore Status Update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await firebaseService.updateOrderStatus(orderId, newStatus);
  };

  // Payment Status Update & Instant WhatsApp Notification to Owner
  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus, paymentMode = 'UPI') => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => (o.orderId === orderId || o.id === orderId) ? { ...o, paymentStatus: newPaymentStatus, paymentMode } : o));
    await firebaseService.updatePaymentStatus(orderId, newPaymentStatus, paymentMode);

    // If marked paid, trigger instant WhatsApp alert to shop owner
    if (newPaymentStatus === 'paid') {
      const order = orders.find(o => o.orderId === orderId || o.id === orderId);
      if (order) {
        const updatedOrder = { 
          ...order, 
          paymentStatus: 'paid', 
          paymentMode 
        };
        const gatewayUrl = shopSettings.gatewayUrl || (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000');
        const notificationMsg = buildOwnerPaymentNotificationMessage(updatedOrder, shopSettings);

        fetch(`${gatewayUrl}/notify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: updatedOrder,
            ownerPhone: shopSettings.ownerWhatsAppPhone || shopSettings.phone,
            message: notificationMsg
          })
        })
        .then(res => res.json())
        .then(data => {
          console.log('✅ Owner payment WhatsApp alert delivered:', data);
        })
        .catch(err => {
          console.warn('Could not dispatch owner payment notification:', err.message);
        });
      }
    }
  };

  // Firestore Delete
  const handleDeleteOrder = async (orderId) => {
    // Optimistic UI update
    setOrders(prev => prev.filter(o => o.orderId !== orderId && o.id !== orderId));
    await firebaseService.deleteOrder(orderId);
  };

  // Settings Save Handlers
  const handleSaveSettings = async (newSettings) => {
    setShopSettings(newSettings);
    await firebaseService.saveSettings(newSettings);
  };

  const handleSaveCategoryItems = async (updatedCategoryItems) => {
    setCategoryItems(updatedCategoryItems);
    await firebaseService.saveCategoryItems(updatedCategoryItems);
  };

  const scrollToBilling = () => {
    const el = document.getElementById('billing-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // =========================================================================
  // AUTHENTICATION GATES
  // =========================================================================
  // 1. Initial Session Restoration
  if (loading) {
    return <SplashScreen />;
  }

  // 2. Unauthenticated: Gated behind Login Screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  // 3. Authenticated: Full POS App
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ordersCount={orders.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 md:pb-6">
        
        {/* ===================================================================== */}
        {/* PAGE 1: EXECUTIVE DASHBOARD (DEFAULT LANDING PAGE)                     */}
        {/* ===================================================================== */}
        {activeTab === 'dashboard' && (
          <Dashboard
            orders={orders}
            shopSettings={shopSettings}
            onNavigate={setActiveTab}
            onViewOrder={(ord) => setCurrentBillModalOrder(ord)}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onDeleteOrder={handleDeleteOrder}
          />
        )}

        {/* ===================================================================== */}
        {/* PAGE 2: ISSUE BILL (FULL WEIGHT & PIECE BILLING WORKFLOW)             */}
        {/* ===================================================================== */}
        {(activeTab === 'issue_bill' || activeTab === 'new_order') && (
          <div className="space-y-4">
            {/* 1. Customer intake */}
            <CustomerForm
              customer={customer}
              onChangeCustomer={setCustomer}
              recentCustomers={recentCustomers}
            />

            {/* 2. Service Category Selection (Multi-Select) */}
            <ServiceSelector
              selectedServices={selectedServices}
              onToggleService={handleToggleService}
              shopSettings={shopSettings}
            />

            {/* 3 & 4. Category-specific Clothes Selection & Weight / Billing Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Clothes Item Picker */}
              <div className="lg:col-span-7">
                <ItemPicker
                  selectedServices={selectedServices}
                  categoryItems={categoryItems}
                  orderItems={orderItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onOpenItemManager={() => {
                    setItemManagerInitialCategory(selectedServices[0] || 'regular');
                    setIsItemManagerOpen(true);
                  }}
                  onAddCustomQuickItem={handleAddCustomQuickItem}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                  shopSettings={shopSettings}
                />
              </div>

              {/* Weight Input, Bill Calculation & Checkout */}
              <div className="lg:col-span-5" id="billing-section">
                <WeightAndPricing
                  selectedServices={selectedServices}
                  orderItems={orderItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  regularWeight={regularWeight}
                  onChangeRegularWeight={setRegularWeight}
                  premiumWeight={premiumWeight}
                  onChangePremiumWeight={setPremiumWeight}
                  discount={discount}
                  onChangeDiscount={setDiscount}
                  onGenerateBill={handleGenerateBill}
                  shopSettings={shopSettings}
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* PAGE 3: TRACK MONEY (ANALYTICS, DURATION/METRIC FILTERS, RECENT LEDGER)*/}
        {/* ===================================================================== */}
        {activeTab === 'track_money' && (
          <TrackMoney
            orders={orders}
            shopSettings={shopSettings}
            onViewOrder={(ord) => setCurrentBillModalOrder(ord)}
          />
        )}

        {/* ===================================================================== */}
        {/* PAGE 5: SETTINGS (WEIGHT RATES ₹60/₹80, DRY CLEANING PIECES, SHOP)     */}
        {/* ===================================================================== */}
        {activeTab === 'settings' && (
          <SettingsPage
            settings={shopSettings}
            onSaveSettings={handleSaveSettings}
            categoryItems={categoryItems}
            onSaveCategoryItems={handleSaveCategoryItems}
          />
        )}

        {/* ===================================================================== */}
        {/* SECONDARY: ORDER HISTORY (ACCESSIBLE VIA NAVBAR)                      */}
        {/* ===================================================================== */}
        {activeTab === 'history' && (
          <OrderHistory
            orders={orders}
            shopSettings={shopSettings}
            onViewOrder={(ord) => setCurrentBillModalOrder(ord)}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onDeleteOrder={handleDeleteOrder}
          />
        )}


      </main>

      {/* MOBILE STICKY FLOATING CART SUMMARY (Only on Billing Page) */}
      {(activeTab === 'issue_bill' || activeTab === 'new_order') && totalPieces > 0 && (
        <aside 
          aria-label="Order summary"
          className="md:hidden fixed bottom-16 left-3 right-3 z-30 animate-in slide-in-from-bottom-2 duration-150"
        >
          <div 
            onClick={scrollToBilling}
            className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl flex items-center justify-between cursor-pointer border border-slate-700/60 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xs">
                {totalPieces}
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {totalPieces} Clothes {totalWeight ? `(${totalWeight}kg)` : ''}
                </p>
                <p className="text-[11px] text-blue-300 font-extrabold">
                  Total: {shopSettings.currency}{grandTotal}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-blue-600 active:bg-blue-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-xs">
              <span>View Bill</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </aside>
      )}

      {/* MODALS */}
      {/* 1. Bill Generation Modal */}
      {currentBillModalOrder && (
        <BillModal
          order={currentBillModalOrder}
          shopSettings={shopSettings}
          onClose={() => setCurrentBillModalOrder(null)}
          onOpenWhatsAppPreview={() => setWhatsAppPreviewOrder(currentBillModalOrder)}
          onResetOrder={handleResetOrder}
        />
      )}

      {/* 2. WhatsApp Preview & Share Modal */}
      {whatsAppPreviewOrder && (
        <WhatsAppPreviewModal
          order={whatsAppPreviewOrder}
          shopSettings={shopSettings}
          onClose={() => setWhatsAppPreviewOrder(null)}
        />
      )}

      {/* 3. Item & Rates Manager Modal */}
      {isItemManagerOpen && (
        <ItemManagerModal
          categoryItems={categoryItems}
          initialCategory={itemManagerInitialCategory}
          onSaveCategoryItems={handleSaveCategoryItems}
          onClose={() => setIsItemManagerOpen(false)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
