import React from 'react';
import { 
  PlusCircle, 
  TrendingUp, 
  Settings, 
  Shirt, 
  ArrowRight, 
  Clock, 
  IndianRupee, 
  AlertCircle,
  Sparkles,
  CreditCard,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard({
  orders = [],
  shopSettings = {},
  onNavigate,
  onViewOrder,
  onUpdateOrderStatus,
  onUpdatePaymentStatus
}) {
  const currency = shopSettings.currency || '₹';

  // 1. Orders under cleaning (status is 'received' or 'washing')
  const underCleaningOrders = orders.filter(
    o => o.orderStatus === 'received' || o.orderStatus === 'washing'
  );

  // 2. Money collected this week
  // Calculate start of current week (Monday 00:00:00)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekOrders = orders.filter(o => new Date(o.createdAt) >= startOfWeek);
  const moneyCollectedThisWeek = thisWeekOrders.reduce((sum, o) => {
    if (o.paymentStatus === 'paid') return sum + (o.grandTotal || 0);
    if (o.paymentStatus === 'partial') return sum + Math.round((o.grandTotal || 0) * 0.5);
    return sum;
  }, 0);

  // 3. Money remaining to be collected (Pending payments)
  const moneyRemainingToCollect = orders.reduce((sum, o) => {
    if (o.paymentStatus === 'pending') return sum + (o.grandTotal || 0);
    if (o.paymentStatus === 'partial') return sum + Math.round((o.grandTotal || 0) * 0.5);
    return sum;
  }, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Executive Dashboard</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {shopSettings.shopName || 'FreshPress Laundry'} POS
            </h1>
          </div>

          {/* Primary Call to Action */}
          <button
            type="button"
            onClick={() => onNavigate('issue_bill')}
            className="self-start sm:self-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2 touch-manipulation"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>+ Issue New Bill</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3 PRIMARY EXECUTIVE METRIC CARDS                                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Metric 1: Orders Under Cleaning */}
        <div 
          onClick={() => onNavigate('issue_bill')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Under Cleaning
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {underCleaningOrders.length}
          </div>
        </div>

        {/* Metric 2: Money Collected This Week */}
        <div 
          onClick={() => onNavigate('track_money')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Collected This Week
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            {currency}{moneyCollectedThisWeek.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Metric 3: Money Remaining to be Collected */}
        <div 
          onClick={() => onNavigate('track_money')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              To Be Collected
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            {currency}{moneyRemainingToCollect.toLocaleString('en-IN')}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* QUICK SHORTCUT NAVIGATION BAR                                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => onNavigate('issue_bill')}
          className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 text-left transition-all active:scale-95 shadow-2xs flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">Issue Bill</h4>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('track_money')}
          className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 text-left transition-all active:scale-95 shadow-2xs flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">Track Money</h4>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 text-left transition-all active:scale-95 shadow-2xs flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">Settings</h4>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ORDERS UNDER CLEANING FULL-WIDTH VIEW                                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-blue-600" />
              <span>Orders Under Cleaning</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>All Bills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {underCleaningOrders.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            No active orders.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {underCleaningOrders.map(order => (
              <div 
                key={order.orderId}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                      {order.customerName}
                    </span>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                      #{order.orderId}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {order.totalPieces} clothes {order.totalWeight ? `(${order.totalWeight}kg)` : ''} •{' '}
                    <span className="font-bold text-slate-700">{order.serviceName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 mr-1 sm:mr-2">
                    {currency}{order.grandTotal}
                  </span>

                  {order.paymentStatus === 'paid' ? (
                    <button
                      type="button"
                      onClick={() => onUpdatePaymentStatus && onUpdatePaymentStatus(order.orderId, 'pending', 'pending')}
                      className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-emerald-100 hover:bg-amber-100 hover:text-amber-900 text-emerald-800 border border-emerald-300 transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-xs"
                      title="Click to toggle to Collect Payment"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Collected</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdatePaymentStatus && onUpdatePaymentStatus(order.orderId, 'paid', 'UPI')}
                      className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-amber-500 hover:bg-emerald-600 text-white border border-amber-600 hover:border-emerald-700 transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-xs"
                      title="Click to mark as Collected"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Collect Payment</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.orderId, order.orderStatus === 'received' ? 'washing' : 'ready')}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all active:scale-95 ${
                      order.orderStatus === 'received'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {order.orderStatus === 'received' ? 'Start Wash' : 'Mark Ready'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
