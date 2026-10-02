import React, { useState } from 'react';
import { 
  Store, 
  Scale, 
  Shirt, 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  Crown,
  Tag,
  DollarSign
} from 'lucide-react';
import { DEFAULT_CATEGORY_ITEMS, DEFAULT_WASH_ITEMS } from '../data/defaultItems';
import { useAuth } from '../context/AuthContext';
import { stripCountryCode, formatDisplayPhoneNumber } from '../utils/whatsappHelper';

export default function SettingsPage({
  settings = {},
  onSaveSettings,
  categoryItems = DEFAULT_CATEGORY_ITEMS,
  onSaveCategoryItems
}) {
  const { currentUser, logout } = useAuth();
  
  // Tabs: 'set_prices', 'shop', 'account'
  const [activeTab, setActiveTab] = useState('set_prices');
  
  // Sub-category switcher within 'set_prices'
  const [catalogCategory, setCatalogCategory] = useState('wash'); // 'wash', 'dry_cleaning', 'others'

  const [formData, setFormData] = useState({ ...settings });
  
  // Lists state
  const [washItemsList, setWashItemsList] = useState(
    categoryItems?.regular || categoryItems?.wash || DEFAULT_WASH_ITEMS
  );
  const [dryCleaningList, setDryCleaningList] = useState(
    categoryItems?.dry_cleaning || []
  );
  const [othersList, setOthersList] = useState(
    categoryItems?.others || []
  );

  const [saved, setSaved] = useState(false);

  // New item inputs
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('150');

  // Save all settings & catalogs to Firestore
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();

    // 1. Save Shop Profile & Weight Rates (Ensure numbers start with +91)
    const cleanedSettings = {
      ...formData,
      phone: formData.phone ? formatDisplayPhoneNumber(formData.phone) : '',
      ownerWhatsAppPhone: formData.ownerWhatsAppPhone ? formatDisplayPhoneNumber(formData.ownerWhatsAppPhone) : ''
    };
    if (onSaveSettings) {
      await onSaveSettings(cleanedSettings);
    }

    // 2. Save Catalogs (Regular and Premium share the identical wash catalog!)
    if (onSaveCategoryItems) {
      const updatedCategoryItems = {
        regular: washItemsList,
        premium: washItemsList,
        dry_cleaning: dryCleaningList,
        others: othersList
      };
      await onSaveCategoryItems(updatedCategoryItems);
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  // Wash Items handlers (Shared between Regular & Premium)
  const handleAddWashItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: `wash-${Date.now()}`,
      name: newItemName.trim(),
      price: 30
    };

    setWashItemsList([newItem, ...washItemsList]);
    setNewItemName('');
  };

  const handleDeleteWashItem = (itemId) => {
    setWashItemsList(washItemsList.filter(i => i.id !== itemId));
  };

  // Dry Cleaning items handlers
  const handleAddDryCleanItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const priceNum = Math.max(0, parseInt(newItemPrice, 10) || 0);
    const newItem = {
      id: `dc-${Date.now()}`,
      name: newItemName.trim(),
      price: priceNum,
      serviceCategory: 'dry_cleaning'
    };

    setDryCleaningList([newItem, ...dryCleaningList]);
    setNewItemName('');
    setNewItemPrice('220');
  };

  const handleUpdateDryCleanPrice = (itemId, newPrice) => {
    const priceNum = Math.max(0, parseInt(newPrice, 10) || 0);
    setDryCleaningList(dryCleaningList.map(item =>
      item.id === itemId ? { ...item, price: priceNum } : item
    ));
  };

  const handleDeleteDryCleanItem = (itemId) => {
    setDryCleaningList(dryCleaningList.filter(i => i.id !== itemId));
  };

  // Others items handlers
  const handleAddOthersItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const priceNum = Math.max(0, parseInt(newItemPrice, 10) || 0);
    const newItem = {
      id: `oth-${Date.now()}`,
      name: newItemName.trim(),
      price: priceNum,
      serviceCategory: 'others'
    };

    setOthersList([newItem, ...othersList]);
    setNewItemName('');
    setNewItemPrice('160');
  };

  const handleUpdateOthersPrice = (itemId, newPrice) => {
    const priceNum = Math.max(0, parseInt(newPrice, 10) || 0);
    setOthersList(othersList.map(item =>
      item.id === itemId ? { ...item, price: priceNum } : item
    ));
  };

  const handleDeleteOthersItem = (itemId) => {
    setOthersList(othersList.filter(i => i.id !== itemId));
  };

  const handleLogout = async () => {
    if (window.confirm('Log out of FreshPress POS?')) {
      await logout();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            <span>Settings & Pricing</span>
          </h2>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className={`self-start sm:self-auto px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/20'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Main Settings Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'set_prices', label: 'Set Prices', icon: Tag },
          { id: 'shop', label: 'Shop Profile', icon: Store },
          { id: 'account', label: 'Account & Security', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SET PRICES (RATES PER KG & INDIVIDUAL PIECE RATES)                 */}
      {/* ========================================================================= */}
      {activeTab === 'set_prices' && (
        <div className="space-y-6">
          
          {/* SECTION 1: PER KG RATES FOR REGULAR & PREMIUM WASH */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Scale className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                1. Wash Rates Per Kg
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Regular Wash Rate */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Shirt className="w-4 h-4 text-blue-600" />
                    <span>Regular Wash Rate (₹ / kg)</span>
                  </label>
                  <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Default: ₹60
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.regularKgRate ?? 60}
                    onChange={(e) => setFormData({ ...formData, regularKgRate: parseInt(e.target.value, 10) || 0 })}
                    className="w-full pl-8 pr-12 py-2 bg-white border border-blue-300 rounded-xl text-base font-extrabold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/ kg</span>
                </div>
              </div>

              {/* Premium Care Rate */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span>Premium Care Rate (₹ / kg)</span>
                  </label>
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Default: ₹80
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.premiumKgRate ?? 80}
                    onChange={(e) => setFormData({ ...formData, premiumKgRate: parseInt(e.target.value, 10) || 0 })}
                    className="w-full pl-8 pr-12 py-2 bg-white border border-amber-300 rounded-xl text-base font-extrabold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/ kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CLOTHES CATALOGS & INDIVIDUAL PIECE RATES */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  2. Clothes Catalogs
                </h3>
              </div>
            </div>

            {/* Category Selector Pills */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setCatalogCategory('wash');
                  setNewItemName('');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  catalogCategory === 'wash'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Wash Clothes
              </button>
              <button
                type="button"
                onClick={() => {
                  setCatalogCategory('dry_cleaning');
                  setNewItemName('');
                  setNewItemPrice('220');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  catalogCategory === 'dry_cleaning'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dry Cleaning
              </button>
              <button
                type="button"
                onClick={() => {
                  setCatalogCategory('others');
                  setNewItemName('');
                  setNewItemPrice('160');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  catalogCategory === 'others'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Others
              </button>
            </div>

            {/* SUB-CATEGORY 1: WASH CLOTHES (SHARED) */}
            {catalogCategory === 'wash' && (
              <div className="space-y-4">

                {/* Add new wash item form */}
                <form onSubmit={handleAddWashItem} className="flex gap-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Add clothing item (e.g. Lowers, Daily Kurta, Apron)..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </form>

                {/* Wash items list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {washItemsList.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteWashItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-CATEGORY 2: DRY CLEANING ITEMS */}
            {catalogCategory === 'dry_cleaning' && (
              <div className="space-y-4">
                {/* Add dry cleaning item form */}
                <form onSubmit={handleAddDryCleanItem} className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Dry cleaning garment (e.g. Leather Jacket, Sherwani)..."
                    className="flex-1 min-w-[200px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      placeholder="Rate"
                      className="w-full pl-7 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Garment</span>
                  </button>
                </form>

                {/* Dry cleaning items list */}
                <div className="space-y-2">
                  {dryCleaningList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                    >
                      <span className="text-xs font-bold text-slate-800 flex-1 truncate">{item.name}</span>
                      
                      <div className="flex items-center gap-2">
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => handleUpdateDryCleanPrice(item.id, e.target.value)}
                            className="w-full pl-6 pr-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-right"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteDryCleanItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-CATEGORY 3: OTHERS / SPECIAL CLEANING */}
            {catalogCategory === 'others' && (
              <div className="space-y-4">
                {/* Add others item form */}
                <form onSubmit={handleAddOthersItem} className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Item name (e.g. Riding Gloves, Tent wash)..."
                    className="flex-1 min-w-[200px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      placeholder="Rate"
                      className="w-full pl-7 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </form>

                {/* Others items list */}
                <div className="space-y-2">
                  {othersList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                    >
                      <span className="text-xs font-bold text-slate-800 flex-1 truncate">{item.name}</span>
                      
                      <div className="flex items-center gap-2">
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => handleUpdateOthersPrice(item.id, e.target.value)}
                            className="w-full pl-6 pr-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-right"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteOthersItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SHOP PROFILE                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'shop' && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Store className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Shop Profile & Receipts
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Shop Name
              </label>
              <input
                type="text"
                value={formData.shopName || ''}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Store WhatsApp / Phone
              </label>
              <div className="relative flex rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                <div className="flex items-center gap-1 px-2.5 bg-slate-100/90 border-r border-slate-200 text-slate-700 font-extrabold text-xs select-none shrink-0 font-mono">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={stripCountryCode(formData.phone)}
                  onChange={(e) => {
                    const raw = stripCountryCode(e.target.value);
                    setFormData({ ...formData, phone: raw ? `+91 ${raw}` : '' });
                  }}
                  placeholder="98765 43210"
                  maxLength={15}
                  className="w-full px-3 py-2 bg-transparent text-xs font-semibold text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Owner Phone (for Payment Alerts)
              </label>
              <div className="relative flex rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                <div className="flex items-center gap-1 px-2.5 bg-slate-100/90 border-r border-slate-200 text-slate-700 font-extrabold text-xs select-none shrink-0 font-mono">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={stripCountryCode(formData.ownerWhatsAppPhone)}
                  onChange={(e) => {
                    const raw = stripCountryCode(e.target.value);
                    setFormData({ ...formData, ownerWhatsAppPhone: raw ? `+91 ${raw}` : '' });
                  }}
                  placeholder="98765 43210"
                  maxLength={15}
                  className="w-full px-3 py-2 bg-transparent text-xs font-semibold text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Shop UPI ID (for WhatsApp 1-Click Pay)
              </label>
              <input
                type="text"
                value={formData.shopUpiId || ''}
                onChange={(e) => setFormData({ ...formData, shopUpiId: e.target.value })}
                placeholder="e.g. freshpress@okaxis or 9876543210@paytm"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Web Payment Domain (for WhatsApp Link)
              </label>
              <input
                type="text"
                value={formData.hostedAppUrl || ''}
                onChange={(e) => setFormData({ ...formData, hostedAppUrl: e.target.value })}
                placeholder="https://btech-laundry.web.app"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Mumbai, Maharashtra"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Shop Address
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, landmark..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Receipt Terms & Policy
              </label>
              <textarea
                rows={2}
                value={formData.terms || ''}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACCOUNT & SECURITY                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Admin Account & Session
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Logged In As:</span>
              <span className="font-extrabold text-slate-900">{currentUser?.email || 'Admin'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Authentication:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Active (Permanent Device Session)
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer border border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out from this Device</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
