import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, isConfigured } from '../firebase';
import { storage } from '../utils/storage';
import { DEFAULT_CATEGORY_ITEMS } from '../data/defaultItems';

export const firebaseService = {
  isConfigured: () => isConfigured && Boolean(db),

  // ==========================================
  // ORDERS (Real-time Firestore)
  // ==========================================

  subscribeToOrders: (onData, onError) => {
    if (!db) {
      onData(storage.getOrders());
      return () => {};
    }

    try {
      const ordersCol = collection(db, 'orders');
      const q = query(ordersCol, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          localStorage.setItem('laundry_app_orders_v1', JSON.stringify(orders));
          onData(orders);
        },
        (error) => {
          console.error('Firestore orders subscription error:', error);
          if (onError) onError(error);
          onData(storage.getOrders());
        }
      );

      return unsubscribe;
    } catch (e) {
      console.error('Failed to subscribe to orders:', e);
      onData(storage.getOrders());
      return () => {};
    }
  },

  createOrder: async (orderData) => {
    if (!db) {
      return storage.saveOrder(orderData);
    }

    try {
      const docRef = doc(db, 'orders', orderData.orderId);
      const dataToSave = {
        ...orderData,
        createdAt: orderData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(docRef, dataToSave);
      console.log('✅ Order saved to Firestore:', orderData.orderId);
      return dataToSave;
    } catch (e) {
      console.error('Failed to save order to Firestore, saving locally:', e);
      storage.saveOrder(orderData);
      throw e;
    }
  },

  updateOrderStatus: async (orderId, newStatus) => {
    if (!db) {
      return storage.updateOrderStatus(orderId, newStatus);
    }

    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, {
        orderStatus: newStatus,
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
    } catch (e) {
      console.error('Failed to update status in Firestore, updating locally:', e);
      storage.updateOrderStatus(orderId, newStatus);
      throw e;
    }
  },

  updatePaymentStatus: async (orderId, newPaymentStatus, paymentMode) => {
    storage.updatePaymentStatus(orderId, newPaymentStatus, paymentMode);
    if (!db) return;

    try {
      const docRef = doc(db, 'orders', orderId);
      const payload = {
        paymentStatus: newPaymentStatus,
        updatedAt: new Date().toISOString()
      };
      if (paymentMode) payload.paymentMode = paymentMode;

      await updateDoc(docRef, payload);
      console.log(`✅ Order ${orderId} payment status updated to ${newPaymentStatus}`);
    } catch (e) {
      console.error('Failed to update payment status in Firestore:', e);
      throw e;
    }
  },

  deleteOrder: async (orderId) => {
    if (!db) {
      const filtered = storage.getOrders().filter(o => o.orderId !== orderId && o.id !== orderId);
      localStorage.setItem('laundry_app_orders_v1', JSON.stringify(filtered));
      return filtered;
    }

    try {
      await deleteDoc(doc(db, 'orders', orderId));
      console.log('✅ Order deleted from Firestore:', orderId);
    } catch (e) {
      console.error('Failed to delete order from Firestore:', e);
      throw e;
    }
  },

  // ==========================================
  // CATEGORY-SPECIFIC CLOTHES CATALOG
  // ==========================================

  subscribeToCategoryItems: (onData, onError) => {
    if (!db) {
      onData(storage.getCategoryItems());
      return () => {};
    }

    try {
      const docRef = doc(db, 'catalog', 'clothes_by_category');
      const unsubscribe = onSnapshot(
        docRef,
        async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            storage.saveCategoryItems(data);
            onData(data);
          } else {
            // Seed defaults into Firestore
            await setDoc(docRef, DEFAULT_CATEGORY_ITEMS);
            storage.saveCategoryItems(DEFAULT_CATEGORY_ITEMS);
            onData(DEFAULT_CATEGORY_ITEMS);
          }
        },
        (error) => {
          console.error('Firestore category items subscription error:', error);
          if (onError) onError(error);
          onData(storage.getCategoryItems());
        }
      );

      return unsubscribe;
    } catch (e) {
      console.error('Failed to subscribe to category items:', e);
      onData(storage.getCategoryItems());
      return () => {};
    }
  },

  saveCategoryItems: async (categoryItems) => {
    storage.saveCategoryItems(categoryItems);

    if (!db) return categoryItems;

    try {
      const docRef = doc(db, 'catalog', 'clothes_by_category');
      await setDoc(docRef, categoryItems);
      console.log('✅ Category clothes catalog saved to Firestore');
      return categoryItems;
    } catch (e) {
      console.error('Failed to save category items to Firestore:', e);
      throw e;
    }
  },

  // ==========================================
  // SHOP SETTINGS
  // ==========================================

  subscribeToSettings: (onData) => {
    if (!db) {
      onData(storage.getSettings());
      return () => {};
    }

    try {
      const docRef = doc(db, 'settings', 'shop_profile');
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            localStorage.setItem('laundry_app_settings_v1', JSON.stringify(data));
            onData(data);
          } else {
            onData(storage.getSettings());
          }
        },
        (error) => {
          console.error('Settings snapshot error:', error);
          onData(storage.getSettings());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.error('Settings subscription error:', e);
      onData(storage.getSettings());
      return () => {};
    }
  },

  saveSettings: async (settingsData) => {
    storage.saveSettings(settingsData);
    if (!db) return settingsData;

    try {
      const docRef = doc(db, 'settings', 'shop_profile');
      await setDoc(docRef, settingsData);
      console.log('✅ Shop settings saved to Firestore');
      return settingsData;
    } catch (e) {
      console.error('Failed to save settings to Firestore:', e);
      throw e;
    }
  }
};
