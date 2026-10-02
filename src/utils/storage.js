import { DEFAULT_CATEGORY_ITEMS, DEFAULT_SHOP_SETTINGS } from '../data/defaultItems';

const STORAGE_KEYS = {
  CATEGORY_ITEMS: 'laundry_app_category_items_v2',
  ORDERS: 'laundry_app_orders_v1',
  SETTINGS: 'laundry_app_settings_v1',
};

export const storage = {
  getCategoryItems: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORY_ITEMS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CATEGORY_ITEMS, JSON.stringify(DEFAULT_CATEGORY_ITEMS));
        return DEFAULT_CATEGORY_ITEMS;
      }
      const parsed = JSON.parse(data);
      // Validate all 4 keys exist
      if (parsed.regular && parsed.premium && parsed.dry_cleaning && parsed.others) {
        return parsed;
      }
      return DEFAULT_CATEGORY_ITEMS;
    } catch (e) {
      console.error('Failed to load category items from storage', e);
      return DEFAULT_CATEGORY_ITEMS;
    }
  },

  saveCategoryItems: (categoryItems) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORY_ITEMS, JSON.stringify(categoryItems));
    } catch (e) {
      console.error('Failed to save category items', e);
    }
  },

  getOrders: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load orders', e);
      return [];
    }
  },

  saveOrder: (newOrder) => {
    try {
      const currentOrders = storage.getOrders();
      const updated = [newOrder, ...currentOrders];
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save order', e);
      return [];
    }
  },

  updateOrderStatus: (orderId, newStatus) => {
    try {
      const orders = storage.getOrders();
      const updated = orders.map((order) =>
        order.id === orderId || order.orderId === orderId
          ? { ...order, orderStatus: newStatus, updatedAt: new Date().toISOString() }
          : order
      );
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to update order status', e);
      return [];
    }
  },

  updatePaymentStatus: (orderId, newPaymentStatus, paymentMode) => {
    try {
      const orders = storage.getOrders();
      const updated = orders.map((order) =>
        order.id === orderId || order.orderId === orderId
          ? { 
              ...order, 
              paymentStatus: newPaymentStatus, 
              ...(paymentMode ? { paymentMode } : {}),
              updatedAt: new Date().toISOString() 
            }
          : order
      );
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to update payment status', e);
      return [];
    }
  },

  getSettings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SHOP_SETTINGS));
        return DEFAULT_SHOP_SETTINGS;
      }
      return { ...DEFAULT_SHOP_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to load settings', e);
      return DEFAULT_SHOP_SETTINGS;
    }
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  getRecentCustomers: () => {
    const orders = storage.getOrders();
    const map = new Map();
    orders.forEach(order => {
      if (order.customerPhone && !map.has(order.customerPhone)) {
        map.set(order.customerPhone, {
          name: order.customerName,
          phone: order.customerPhone,
          lastOrderDate: order.createdAt
        });
      }
    });
    return Array.from(map.values());
  }
};
