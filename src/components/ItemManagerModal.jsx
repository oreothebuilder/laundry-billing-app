import React, { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Shirt, Sparkles, Check, AlertCircle } from 'lucide-react';
import { DEFAULT_CATEGORY_ITEMS, DEFAULT_SERVICES } from '../data/defaultItems';

export default function ItemManagerModal({
  categoryItems = DEFAULT_CATEGORY_ITEMS,
  initialCategory = 'regular',
  onSaveCategoryItems,
  onClose
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'regular');
  const [data, setData] = useState(categoryItems);
  
  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('30');
  const [saveFeedback, setSaveFeedback] = useState('');

  const currentCategoryClothes = data[activeCategory] || [];
  const currentServiceMeta = DEFAULT_SERVICES.find(s => s.id === activeCategory) || DEFAULT_SERVICES[0];

  const handleUpdatePrice = (itemId, newPrice) => {
    const priceNum = Math.max(0, parseInt(newPrice, 10) || 0);
    const updatedCategoryList = currentCategoryClothes.map(item => {
      if (item.id === itemId) {
        return { ...item, price: priceNum };
      }
      return item;
    });

    const updatedData = {
      ...data,
      [activeCategory]: updatedCategoryList
    };

    setData(updatedData);
    onSaveCategoryItems(updatedData);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const priceNum = Math.max(0, parseInt(newItemPrice, 10) || 0);
    const newItem = {
      id: `${activeCategory.slice(0, 3)}-${Date.now()}`,
      name: newItemName.trim(),
      price: priceNum,
      serviceCategory: activeCategory
    };

    const updatedCategoryList = [newItem, ...currentCategoryClothes];
    const updatedData = {
      ...data,
      [activeCategory]: updatedCategoryList
    };

    setData(updatedData);
    onSaveCategoryItems(updatedData);

    // Reset inputs
    setNewItemName('');
    setNewItemPrice('30');
    setSaveFeedback(`Added "${newItem.name}" to ${currentServiceMeta.name}`);
    setTimeout(() => setSaveFeedback(''), 2500);
  };

  const handleDeleteItem = (itemId, itemName) => {
    if (window.confirm(`Remove "${itemName}" from ${currentServiceMeta.name}?`)) {
      const updatedCategoryList = currentCategoryClothes.filter(item => item.id !== itemId);
      const updatedData = {
        ...data,
        [activeCategory]: updatedCategoryList
      };

      setData(updatedData);
      onSaveCategoryItems(updatedData);
    }
  };

  const handleResetCurrentCategory = () => {
    if (window.confirm(`Reset clothes & rates for ${currentServiceMeta.name} back to default?`)) {
      const updatedData = {
        ...data,
        [activeCategory]: DEFAULT_CATEGORY_ITEMS[activeCategory] || []
      };
      setData(updatedData);
      onSaveCategoryItems(updatedData);
      setSaveFeedback(`Reset ${currentServiceMeta.name} to defaults.`);
      setTimeout(() => setSaveFeedback(''), 2500);
    }
  };

  const handleResetAllCategories = () => {
    if (window.confirm('Reset clothes & rates for ALL 4 service categories back to factory defaults?')) {
      setData(DEFAULT_CATEGORY_ITEMS);
      onSaveCategoryItems(DEFAULT_CATEGORY_ITEMS);
      setSaveFeedback('All categories reset to defaults.');
      setTimeout(() => setSaveFeedback(''), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Clothes & Prices</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
          {DEFAULT_SERVICES.map(srv => {
            const isTabActive = activeCategory === srv.id;
            const count = (data[srv.id] || []).length;
            
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => setActiveCategory(srv.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 touch-manipulation ${
                  isTabActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 ring-1 ring-slate-900/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{srv.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isTabActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Active Service Banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                {currentServiceMeta.name}
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                {currentServiceMeta.badge}
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetCurrentCategory}
              className="text-[11px] text-slate-500 hover:text-rose-600 active:text-rose-700 font-semibold flex items-center gap-1 shrink-0 ml-2"
              title="Reset this category to default clothes"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          </div>

          {/* Toast / Feedback Notice */}
          {saveFeedback && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveFeedback}</span>
            </div>
          )}

          {/* Add New Cloth to Active Category */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 sm:p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Add Item</span>
            </h4>
            <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Cloth name"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-medium focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex gap-2">
                <div className="relative w-28 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="Price"
                    className="w-full pl-6 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 active:scale-95 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </form>
          </div>

          {/* Clothes List for this Category */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {currentServiceMeta.name} ({currentCategoryClothes.length})
              </h4>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
              {currentCategoryClothes.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No items.
                </div>
              ) : (
                currentCategoryClothes.map((item) => (
                  <div
                    key={item.id}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Cloth Name */}
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate block">
                        {item.name}
                      </span>
                    </div>

                    {/* Price Input */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={item.price}
                          onChange={(e) => handleUpdatePrice(item.id, e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-right focus:bg-white focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">/ pc</span>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 active:text-rose-700 transition-colors rounded-lg active:bg-rose-50"
                        title="Delete cloth item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 safe-bottom">
          <button
            type="button"
            onClick={handleResetAllCategories}
            className="text-[11px] text-slate-400 hover:text-rose-600 font-medium self-start sm:self-center"
          >
            Reset All Defaults
          </button>
          
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 active:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors active:scale-95"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
