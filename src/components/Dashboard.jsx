import React from 'react';
import { 
  PlusCircle, 
  TrendingUp, 
  Settings, 
  Shirt, 
  ArrowRight, 
  IndianRupee, 
  AlertCircle,
  Sparkles,
  CreditCard,
  CheckCircle2,
  Send,
  Eye,
  Trash2,
  Phone,
  FileText
} from 'lucide-react';
import { buildWhatsAppReceiptMessage, getWhatsAppShareUrl, formatDisplayPhoneNumber } from '../utils/whatsappHelper';

// Safe date parser to handle Firestore Timestamps ({ seconds }), strings, and Date instances
const parseOrderDate = (val) => {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate();
  if (val.seconds) return new Date(val.seconds * 1000);
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

export default function Dashboard({
  orders = [],
  shopSettings = {},
  onNavigate,
  onViewOrder,
  onUpdatePaymentStatus,
  onDeleteOrder
}) {
  const currency = shopSettings?.currency || '₹';
  const validOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];

  const handleSendWhatsApp = (order) => {
    if (!order) return;
    const msg = buildWhatsAppReceiptMessage(order, shopSettings);
    const url = getWhatsAppShareUrl(order.customerPhone, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const displayOrders = validOrders.slice(0, 8);

  // 1. Total bills count
  const totalBillsCount = validOrders.length;

  // 2. Money collected this week
  // Calculate start of current week (Monday 00:00:00)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekOrders = validOrders.filter(o => {
    const d = parseOrderDate(o?.createdAt);
    return d && d >= startOfWeek;
  });

  const moneyCollectedThisWeek = thisWeekOrders.reduce((sum, o) => {
    if (o?.paymentStatus === 'paid') return sum + (Number(o?.grandTotal) || 0);
    if (o?.paymentStatus === 'partial') return sum + Math.round((Number(o?.grandTotal) || 0) * 0.5);
    return sum;
  }, 0);

  // 3. Money remaining to be collected (Pending payments)
  const moneyRemainingToCollect = validOrders.reduce((sum, o) => {
    if (o?.paymentStatus === 'pending') return sum + (Number(o?.grandTotal) || 0);
    if (o?.paymentStatus === 'partial') return sum + Math.round((Number(o?.grandTotal) || 0) * 0.5);
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
              {shopSettings?.shopName || 'BTech Drycleaners'} POS
            </h1>
          </div>

          {/* Primary Call to Action */}
          <button
            type="button"
            onClick={() => onNavigate('issue_bill')}
            className="self-start sm:self-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2 touch-manipulation cursor-pointer"
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
        
        {/* Metric 1: Total Bills */}
        <div 
          onClick={() => onNavigate('history')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Bills
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {totalBillsCount}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => onNavigate('issue_bill')}
          className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 text-left transition-all active:scale-95 shadow-2xs flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Issue Bill</h4>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('history')}
          className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 text-left transition-all active:scale-95 shadow-2xs flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">All Bills</h4>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('track_money')}
          className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 text-left transition-all active:scale-95 shadow-2xs flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Track Money</h4>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 text-left transition-all active:scale-95 shadow-2xs flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Settings</h4>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* RECENT BILLS PREVIEW                                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-blue-600" />
              <span>Recent Bills</span>
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

        {displayOrders.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            No bills created yet.
          </div>
        ) : (
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {displayOrders.map(order => {
              if (!order) return null;
              const isPaid = order.paymentStatus === 'paid';
              const orderDate = parseOrderDate(order.createdAt);
              const formattedDate = orderDate 
                ? orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                : '';

              const itemsList = Array.isArray(order.items) 
                ? order.items 
                : (order.items && typeof order.items === 'object' ? Object.values(order.items) : []);

              const itemsSummary = itemsList.length > 0
                ? itemsList.map(i => `${i?.quantity || 1}x ${i?.name || 'Item'}`).join(', ')
                : 'No item list';

              return (
                <div 
                  key={order.orderId || Math.random()}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col gap-2.5 hover:bg-slate-100/60 transition-colors"
                >
                  {/* Order Info Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-extrabold text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                          #{order.orderId}
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                          {order.customerName || 'Customer'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-[11px] text-slate-500 font-mono mt-1">
                        {order.customerPhone && (
                          <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 hover:text-blue-600 hover:underline">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{formatDisplayPhoneNumber(order.customerPhone)}</span>
                          </a>
                        )}
                        {formattedDate && (
                          <span className="text-slate-400">• {formattedDate}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        {currency}{order.grandTotal ?? 0}
                      </span>
                      <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                        {order.serviceName || 'Laundry'}
                      </div>
                    </div>
                  </div>

                  {/* Order Clothes Summary */}
                  <div className="text-[11px] text-slate-600 bg-white/80 rounded-xl px-2.5 py-1.5 border border-slate-200/60 truncate">
                    <span className="font-bold text-slate-800">
                      {order.totalPieces || itemsList.length} clothes {order.totalWeight ? `(${order.totalWeight}kg)` : ''}:
                    </span>{' '}
                    <span className="text-slate-500">
                      {itemsSummary}
                    </span>
                  </div>

                  {/* The 4 Action Buttons ONLY */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/60">
                    {/* Button 1: Collect Payment (Toggles to Collected) */}
                    {isPaid ? (
                      <button
                        type="button"
                        onClick={() => onUpdatePaymentStatus && onUpdatePaymentStatus(order.orderId, 'pending', 'pending')}
                        className="py-1.5 px-2.5 rounded-xl bg-emerald-100 hover:bg-amber-100 hover:text-amber-900 text-emerald-800 border border-emerald-300 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                        title="Click to mark as Collect Payment"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Collected</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdatePaymentStatus && onUpdatePaymentStatus(order.orderId, 'paid', 'UPI')}
                        className="py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-emerald-600 text-white border border-amber-600 hover:border-emerald-700 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                        title="Click to mark as Collected"
                      >
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Collect Payment</span>
                      </button>
                    )}

                    {/* Button 2: Send WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(order)}
                      className="py-1.5 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                      title="Send Bill Receipt on WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                      <span className="truncate">Send WhatsApp</span>
                    </button>

                    {/* Button 3: View Bill */}
                    <button
                      type="button"
                      onClick={() => onViewOrder && onViewOrder(order)}
                      className="py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:text-blue-700 active:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="View Bill Receipt"
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">View Bill</span>
                    </button>

                    {/* Button 4: Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete bill #${order.orderId} for ${order.customerName || 'Customer'}?`)) {
                          onDeleteOrder && onDeleteOrder(order.orderId);
                        }
                      }}
                      className="py-1.5 px-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 active:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Delete Bill"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Delete</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
