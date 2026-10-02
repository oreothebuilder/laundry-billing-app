import React from 'react';
import { 
  Scale, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Tag, 
  Sparkles, 
  Crown,
  Shirt,
  Info,
  CheckCircle2,
  CreditCard
} from 'lucide-react';

export default function WeightAndPricing({
  selectedServices = ['regular'],
  orderItems = [],
  onUpdateQuantity,
  onRemoveItem,
  regularWeight = '',
  onChangeRegularWeight,
  premiumWeight = '',
  onChangePremiumWeight,
  discount = '',
  onChangeDiscount,
  onGenerateBill,
  shopSettings = {}
}) {
  const currency = shopSettings.currency || '₹';
  const regularRate = shopSettings.regularKgRate || 60;
  const premiumRate = shopSettings.premiumKgRate || 80;

  const hasRegular = selectedServices.includes('regular');
  const hasPremium = selectedServices.includes('premium');
  const hasDryCleaning = selectedServices.includes('dry_cleaning');
  const hasOthers = selectedServices.includes('others');

  // 1. Regular Wash Calculations
  const regWeightNum = parseFloat(regularWeight) || 0;
  const regAmount = hasRegular ? Math.round(regWeightNum * regularRate) : 0;
  const regItems = orderItems.filter(i => i.serviceCategory === 'regular');
  const regPieces = regItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  // 2. Premium Care Calculations
  const premWeightNum = parseFloat(premiumWeight) || 0;
  const premAmount = hasPremium ? Math.round(premWeightNum * premiumRate) : 0;
  const premItems = orderItems.filter(i => i.serviceCategory === 'premium');
  const premPieces = premItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  // 3. Dry Cleaning Calculations (Piece-based)
  const dcItems = orderItems.filter(i => i.serviceCategory === 'dry_cleaning');
  const dcAmount = hasDryCleaning 
    ? dcItems.reduce((acc, curr) => acc + ((curr.unitPrice || curr.price || 0) * (curr.quantity || 0)), 0)
    : 0;
  const dcPieces = dcItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  // 4. Others Calculations (Piece-based)
  const othItems = orderItems.filter(i => i.serviceCategory === 'others');
  const othAmount = hasOthers 
    ? othItems.reduce((acc, curr) => acc + ((curr.unitPrice || curr.price || 0) * (curr.quantity || 0)), 0)
    : 0;
  const othPieces = othItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  // Totals
  const totalPieces = regPieces + premPieces + dcPieces + othPieces;
  const subtotal = regAmount + premAmount + dcAmount + othAmount;
  const discountNum = Math.min(subtotal, Math.max(0, parseFloat(discount) || 0));
  const grandTotal = Math.max(0, Math.round(subtotal - discountNum));

  // Validation: are required weights entered?
  const isRegularValid = !hasRegular || regWeightNum > 0;
  const isPremiumValid = !hasPremium || premWeightNum > 0;
  const hasSelectedClothes = orderItems.length > 0;
  const isFormReady = hasSelectedClothes && isRegularValid && isPremiumValid;

  return (
    <div id="billing-section" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
      
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Scale className="w-4 h-4 text-blue-600 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
            4. Weight & Bill
          </h2>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
          {totalPieces} Clothes Selected
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. REGULAR WASH WEIGHT INPUT                                              */}
      {/* ========================================================================= */}
      {hasRegular && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>Regular Wash (kg)</span>
            </label>
            <span className="text-[11px] font-extrabold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
              Rate: {currency}{regularRate}/kg
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.05"
                inputMode="decimal"
                min="0"
                value={regularWeight}
                onChange={(e) => onChangeRegularWeight(e.target.value)}
                placeholder="0.0"
                className="w-full pl-3 pr-10 py-2.5 bg-white border border-blue-300 rounded-xl text-lg font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                KG
              </span>
            </div>

            {/* Quick Weight Pills */}
            <div className="flex gap-1">
              {['1.0', '2.5', '3.0', '3.5', '5.0'].map((w) => {
                const isActive = regularWeight !== '' && (regularWeight === w || parseFloat(regularWeight) === parseFloat(w));
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onChangeRegularWeight(w)}
                    className={`px-2.5 py-2 text-xs rounded-xl border transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-black'
                        : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50 font-bold'
                    }`}
                  >
                    {w}k
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-blue-900 font-bold mt-2 pt-2 border-t border-blue-200/60">
            <span>{regPieces} Regular Clothes:</span>
            <span className="text-sm font-extrabold text-blue-700">
              {regWeightNum > 0 ? `${regWeightNum} kg × ${currency}${regularRate} = ${currency}${regAmount}` : `₹0`}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PREMIUM CARE WEIGHT INPUT                                              */}
      {/* ========================================================================= */}
      {hasPremium && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>Premium Care (kg)</span>
            </label>
            <span className="text-[11px] font-extrabold text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-200">
              Rate: {currency}{premiumRate}/kg
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.05"
                inputMode="decimal"
                min="0"
                value={premiumWeight}
                onChange={(e) => onChangePremiumWeight(e.target.value)}
                placeholder="0.0"
                className="w-full pl-3 pr-10 py-2.5 bg-white border border-amber-300 rounded-xl text-lg font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                KG
              </span>
            </div>

            {/* Quick Weight Pills */}
            <div className="flex gap-1">
              {['1.0', '1.5', '2.0', '2.5', '3.0'].map((w) => {
                const isActive = premiumWeight !== '' && (premiumWeight === w || parseFloat(premiumWeight) === parseFloat(w));
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onChangePremiumWeight(w)}
                    className={`px-2.5 py-2 text-xs rounded-xl border transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-black'
                        : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50 font-bold'
                    }`}
                  >
                    {w}k
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-amber-900 font-bold mt-2 pt-2 border-t border-amber-200/60">
            <span>{premPieces} Premium Clothes:</span>
            <span className="text-sm font-extrabold text-amber-800">
              {premWeightNum > 0 ? `${premWeightNum} kg × ${currency}${premiumRate} = ${currency}${premAmount}` : `₹0`}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DRY CLEANING PIECES SUMMARY                                            */}
      {/* ========================================================================= */}
      {hasDryCleaning && (
        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-purple-600" />
              <span>Dry Cleaning</span>
            </span>
            <span className="text-xs font-extrabold text-purple-700">
              {currency}{dcAmount}
            </span>
          </div>

          {dcItems.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-purple-200/60 text-xs text-purple-900">
              {dcItems.map((it) => (
                <div key={it.itemId || it.id} className="flex justify-between items-center py-0.5">
                  <span className="font-medium">{it.name} × {it.quantity}</span>
                  <span className="font-extrabold">{currency}{(it.unitPrice || it.price) * it.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. OTHERS / SPECIAL CLEANING SUMMARY                                      */}
      {/* ========================================================================= */}
      {hasOthers && (
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Others</span>
            </span>
            <span className="text-xs font-extrabold text-emerald-700">
              {currency}{othAmount}
            </span>
          </div>

          {othItems.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-emerald-200/60 text-xs text-emerald-900">
              {othItems.map((it) => (
                <div key={it.itemId || it.id} className="flex justify-between items-center py-0.5">
                  <span className="font-medium">{it.name} × {it.quantity}</span>
                  <span className="font-extrabold">{currency}{(it.unitPrice || it.price) * it.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BILL TOTALS & PAYMENT SECTION                                             */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        
        {/* Subtotal & Breakdown */}
        <div className="space-y-1.5 text-xs text-slate-600">
          {hasRegular && (
            <div className="flex justify-between">
              <span>Regular Wash ({regWeightNum} kg @ {currency}{regularRate}):</span>
              <span className="font-extrabold text-slate-800">{currency}{regAmount}</span>
            </div>
          )}
          {hasPremium && (
            <div className="flex justify-between">
              <span>Premium Care ({premWeightNum} kg @ {currency}{premiumRate}):</span>
              <span className="font-extrabold text-slate-800">{currency}{premAmount}</span>
            </div>
          )}
          {hasDryCleaning && (
            <div className="flex justify-between">
              <span>Dry Cleaning ({dcPieces} pcs):</span>
              <span className="font-extrabold text-slate-800">{currency}{dcAmount}</span>
            </div>
          )}
          {hasOthers && (
            <div className="flex justify-between">
              <span>Others ({othPieces} items):</span>
              <span className="font-extrabold text-slate-800">{currency}{othAmount}</span>
            </div>
          )}

          <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-700">
            <span>Subtotal:</span>
            <span>{currency}{subtotal}</span>
          </div>
        </div>

        {/* Discount Row */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Discount ({currency}):</span>
          </label>
          <div className="w-28 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{currency}</span>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => onChangeDiscount(e.target.value)}
              placeholder="0"
              className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-right focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Grand Total Bar */}
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-200 shadow-2xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Grand Total
            </span>
            <span className="text-2xl font-black text-blue-700 tracking-tight">
              {currency}{grandTotal}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 font-medium">
              {totalPieces} Clothes Total
            </span>
            {(regWeightNum > 0 || premWeightNum > 0) && (
              <span className="block text-[11px] font-bold text-blue-800">
                {(regWeightNum + premWeightNum).toFixed(1)} kg Wash Weight
              </span>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FINAL ACTION: GENERATE BILL                                               */}
      {/* ========================================================================= */}
      <button
        type="button"
        disabled={!isFormReady}
        onClick={onGenerateBill}
        className={`w-full py-4 px-5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer touch-manipulation ${
          isFormReady
            ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/25'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
        }`}
      >
        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
        <span>Generate Bill & Send WhatsApp ({currency}{grandTotal})</span>
      </button>

    </div>
  );
}
