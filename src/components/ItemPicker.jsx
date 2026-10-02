import React, { useState, useEffect } from 'react';
import { 
  Shirt, 
  Search, 
  Plus, 
  Minus, 
  PlusCircle, 
  Pencil,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { DEFAULT_SERVICES, DEFAULT_WASH_ITEMS } from '../data/defaultItems';

export default function ItemPicker({
  selectedServices = ['regular'],
  categoryItems = {},
  orderItems = [],
  onUpdateQuantity,
  onOpenItemManager,
  onAddCustomQuickItem,
  onEditItem,
  onDeleteItem,
  shopSettings = {}
}) {
  const activeServices = Array.isArray(selectedServices) ? selectedServices : [selectedServices];
  
  // Track which service tab is currently being viewed in the picker
  const [activeTab, setActiveTab] = useState(activeServices[0] || 'regular');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickItemName, setQuickItemName] = useState('');
  const [quickItemPrice, setQuickItemPrice] = useState('');

  // Inline edit state
  const [editingItemId, setEditingItemId] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');

  // Keep activeTab valid if selectedServices changes
  useEffect(() => {
    if (!activeServices.includes(activeTab)) {
      setActiveTab(activeServices[0] || 'regular');
    }
  }, [selectedServices]);

  // Determine items list for the active service tab
  // Regular wash and Premium care share the exact same clothes catalog!
  const isWashService = activeTab === 'regular' || activeTab === 'premium';
  
  let catalogList = [];
  if (isWashService) {
    catalogList = categoryItems.regular || categoryItems.wash || DEFAULT_WASH_ITEMS;
  } else if (activeTab === 'dry_cleaning') {
    catalogList = categoryItems.dry_cleaning || [];
  } else if (activeTab === 'others') {
    catalogList = categoryItems.others || [];
  }

  const filteredItems = catalogList.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get quantity of this item under the currently viewed service
  const getItemQty = (itemId) => {
    const found = orderItems.find(
      i => (i.itemId === itemId || i.id === itemId) && i.serviceCategory === activeTab
    );
    return found ? found.quantity : 0;
  };

  // Count items added for a specific service category
  const getServiceItemsCount = (srvId) => {
    return orderItems
      .filter(i => i.serviceCategory === srvId)
      .reduce((sum, i) => sum + (i.quantity || 0), 0);
  };

  const totalClothesInBill = orderItems.reduce((sum, i) => sum + (i.quantity || 0), 0);

  // Active rate display for weight services
  const activeKgRate = activeTab === 'regular' 
    ? (shopSettings.regularKgRate || 60)
    : (shopSettings.premiumKgRate || 80);

  // Active service metadata
  const currentServiceMeta = DEFAULT_SERVICES.find(s => s.id === activeTab) || {
    id: activeTab,
    name: activeTab.replace('_', ' ')
  };

  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!quickItemName.trim()) return;
    const priceNum = Number(quickItemPrice) || (isWashService ? 30 : 150);
    
    if (onAddCustomQuickItem) {
      onAddCustomQuickItem({
        name: quickItemName.trim(),
        price: priceNum,
        serviceCategory: activeTab
      });
    }

    setQuickItemName('');
    setQuickItemPrice('');
    setShowQuickAdd(false);
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemPrice(String(item.price || ''));
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditItemName('');
    setEditItemPrice('');
  };

  const handleSaveEdit = async (itemId) => {
    if (!editItemName.trim()) return;
    if (onEditItem) {
      await onEditItem(itemId, editItemName.trim(), editItemPrice, activeTab);
    }
    setEditingItemId(null);
  };

  const handleDeleteItem = async (item) => {
    const confirmMsg = `Delete "${item.name}" from ${currentServiceMeta.name} clothes list?`;
    if (window.confirm(confirmMsg)) {
      if (onDeleteItem) {
        await onDeleteItem(item.id, activeTab);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 sm:gap-2">
              <Shirt className="w-4 h-4 text-blue-600 shrink-0" />
              <span>3. Add Clothes</span>
            </h2>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {totalClothesInBill} Total Pcs
            </span>
          </div>
        </div>

        {/* Quick Add Custom Item button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 active:bg-blue-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-blue-200 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Custom Item</span>
          </button>
        </div>
      </div>

      {/* SERVICE SWITCHER TABS (When multiple services are selected) */}
      {activeServices.length > 1 && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-4 overflow-x-auto scrollbar-none">
          {activeServices.map((srvId) => {
            const srv = DEFAULT_SERVICES.find(s => s.id === srvId) || { id: srvId, name: srvId };
            const isActive = activeTab === srvId;
            const itemsCount = getServiceItemsCount(srvId);

            const tabColors = {
              regular: isActive ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/70',
              premium: isActive ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/70',
              dry_cleaning: isActive ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/70',
              others: isActive ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/70'
            }[srvId] || (isActive ? 'bg-slate-900 text-white' : 'text-slate-700');

            return (
              <button
                key={srvId}
                type="button"
                onClick={() => {
                  setActiveTab(srvId);
                  setSearchTerm('');
                  setEditingItemId(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${tabColors}`}
              >
                <span>{srv.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {itemsCount}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Add Custom Item inline form */}
      {showQuickAdd && (
        <form onSubmit={handleQuickAddSubmit} className="mb-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-wrap items-center gap-2 animate-in slide-in-from-top-1 duration-150">
          <input
            type="text"
            value={quickItemName}
            onChange={(e) => setQuickItemName(e.target.value)}
            placeholder={`Item name for ${currentServiceMeta.name} (e.g. Silk Scarf)`}
            className="flex-1 min-w-[160px] px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {!isWashService && (
            <div className="relative w-24">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={quickItemPrice}
                onChange={(e) => setQuickItemPrice(e.target.value)}
                placeholder="Rate"
                className="w-full pl-6 pr-2 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Add to {currentServiceMeta.name}
          </button>
          <button
            type="button"
            onClick={() => setShowQuickAdd(false)}
            className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Search Bar for Clothes */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search clothes in ${currentServiceMeta.name}...`}
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* CLOTHES LIST VIEW WITH INLINE EDIT & DELETE */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Shirt className="w-8 h-8 mx-auto mb-1 text-slate-300" />
          <p className="text-xs font-bold text-slate-600">No clothes match "{searchTerm}"</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredItems.map((item) => {
            const qty = getItemQty(item.id);
            const isAdded = qty > 0;
            const isEditing = editingItemId === item.id;

            // INLINE EDIT MODE FOR THIS ROW
            if (isEditing) {
              return (
                <div
                  key={item.id}
                  className="p-2.5 sm:p-3 rounded-xl border-2 border-blue-500 bg-blue-50/70 shadow-xs flex flex-wrap items-center justify-between gap-2 animate-in fade-in-50 duration-150"
                >
                  <div className="flex-1 min-w-[160px] flex items-center gap-2">
                    <input
                      type="text"
                      value={editItemName}
                      onChange={(e) => setEditItemName(e.target.value)}
                      placeholder="Cloth name"
                      className="flex-1 px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    {!isWashService && (
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={editItemPrice}
                          onChange={(e) => setEditItemPrice(e.target.value)}
                          placeholder="Price"
                          className="w-full pl-6 pr-2 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(item.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            // STANDARD COMPACT LIST ROW
            return (
              <div
                key={item.id}
                className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 select-none ${
                  isAdded
                    ? 'border-blue-400 bg-blue-50/40 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }`}
              >
                {/* Left: Cloth Name & Rate Tag */}
                <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                    {item.name}
                  </span>

                  {!isWashService && (
                    <span className="text-[11px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 shrink-0">
                      ₹{item.price}
                    </span>
                  )}
                </div>

                {/* Right controls: Edit, Delete & Stepper */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {/* Inline Edit button */}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    title={`Edit ${item.name}`}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {/* Inline Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item)}
                    title={`Delete ${item.name} from list`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-200 mx-0.5" />

                  {/* Counter controls */}
                  <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60">
                    <button
                      type="button"
                      disabled={qty === 0}
                      onClick={() => onUpdateQuantity(item, qty - 1, activeTab)}
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors active:scale-95 cursor-pointer ${
                        qty > 0 
                          ? 'bg-white hover:bg-slate-200 text-slate-800 shadow-2xs' 
                          : 'text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className={`text-xs font-black min-w-[22px] text-center ${
                      qty > 0 ? 'text-blue-700 font-extrabold' : 'text-slate-400'
                    }`}>
                      {qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item, qty + 1, activeTab)}
                      className="w-7 h-7 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
