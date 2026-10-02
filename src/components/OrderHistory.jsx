import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  Eye, 
  Trash2, 
  Phone, 
  Shirt, 
  CheckCircle2, 
  CreditCard,
  Calendar,
  Clock
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

export default function OrderHistory({ 
  orders = [], 
  shopSettings = {}, 
  onViewOrder, 
  onUpdatePaymentStatus,
  onDeleteOrder 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const currency = shopSettings?.currency || '₹';
  const validOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];

  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o?.grandTotal) || 0), 0);
  const pendingCount = validOrders.filter(o => o?.paymentStatus !== 'paid').length;
  const collectedCount = validOrders.filter(o => o?.paymentStatus === 'paid').length;

  const filteredOrders = validOrders.filter(order => {
    if (!order) return false;
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = 
      (order.customerName && order.customerName.toLowerCase().includes(term)) ||
      (order.customerPhone && order.customerPhone.includes(term)) ||
      (order.orderId && order.orderId.toLowerCase().includes(term));
    
    const matchesService = serviceFilter === 'all' || 
      (Array.isArray(order.selectedServices) && order.selectedServices.includes(serviceFilter)) ||
      order.serviceType === serviceFilter;
      
    const matchesPayment = paymentFilter === 'all' ||
      (paymentFilter === 'paid' ? order.paymentStatus === 'paid' : order.paymentStatus !== 'paid');

    return matchesSearch && matchesService && matchesPayment;
  });

  const handleSendWhatsApp = (order) => {
    if (!order) return;
    const msg = buildWhatsAppReceiptMessage(order, shopSettings);
    const url = getWhatsAppShareUrl(order.customerPhone, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">All Bills</h2>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {validOrders.length} {validOrders.length === 1 ? 'Bill' : 'Bills'}
        </span>
      </div>

      {/* Top Stat Cards (2x2 on mobile, 4 in a row on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Total Bills</p>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">{validOrders.length}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-500">Pending</p>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-0.5">{pendingCount}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-500">Collected</p>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">{collectedCount}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-500">Total Revenue</p>
          <p className="text-xl sm:text-2xl font-extrabold text-blue-700 mt-0.5">{currency}{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bills by customer name, phone, or #order ID..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Services</option>
            <option value="regular">Regular Wash</option>
            <option value="premium">Premium Care</option>
            <option value="dry_cleaning">Dry Cleaning</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Collected</option>
          </select>
        </div>
      </div>

      {/* Bills List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
          <Shirt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No Bills Found</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            if (!order) return null;
            const isPaid = order.paymentStatus === 'paid';
            const orderDate = parseOrderDate(order.createdAt);
            const formattedDate = orderDate 
              ? orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-3"
              >
                {/* 1. Header Row: ID, Service, Timestamp & Price */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-extrabold text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                        #{order.orderId}
                      </span>
                      <span className="font-extrabold text-sm sm:text-base text-slate-900">
                        {order.customerName || 'Customer'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-1">
                      {order.customerPhone && (
                        <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 hover:text-blue-600 hover:underline">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{formatDisplayPhoneNumber(order.customerPhone)}</span>
                        </a>
                      )}
                      {formattedDate && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base sm:text-xl font-black text-slate-900">
                      {currency}{order.grandTotal ?? 0}
                    </span>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                      {order.serviceName || 'Laundry'}
                    </div>
                  </div>
                </div>

                {/* 2. Order Information Details */}
                <div className="bg-slate-50 rounded-xl p-2.5 sm:p-3 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border border-slate-100">
                  <div className="truncate">
                    <span className="font-bold text-slate-800">
                      {order.totalPieces || itemsList.length} clothes {order.totalWeight ? `(${order.totalWeight}kg)` : ''}:
                    </span>{' '}
                    <span className="text-slate-600">
                      {itemsSummary}
                    </span>
                  </div>

                  {order.deliveryDate && (
                    <div className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Ready: <strong className="text-slate-700">{order.deliveryDate}</strong></span>
                    </div>
                  )}
                </div>

                {/* 3. The 4 Buttons ONLY: Collect payment, Send WhatsApp, View bill, Delete */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
                  {/* Button 1: Collect Payment (Toggles to Collected) */}
                  {isPaid ? (
                    <button
                      type="button"
                      onClick={() => onUpdatePaymentStatus && onUpdatePaymentStatus(order.orderId, 'pending', 'pending')}
                      className="py-2 px-2.5 rounded-xl bg-emerald-100 hover:bg-amber-100 hover:text-amber-900 text-emerald-800 border border-emerald-300 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                      title="Click to mark as Collect Payment"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Collected</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdatePaymentStatus && onUpdatePaymentStatus(order.orderId, 'paid', 'UPI')}
                      className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-emerald-600 text-white border border-amber-600 hover:border-emerald-700 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
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
                    className="py-2 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                    title="Send Bill Receipt on WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                    <span className="truncate">Send WhatsApp</span>
                  </button>

                  {/* Button 3: View Bill */}
                  <button
                    type="button"
                    onClick={() => onViewOrder && onViewOrder(order)}
                    className="py-2 px-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:text-blue-700 active:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="View / Print Bill Receipt"
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
                    className="py-2 px-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 active:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
  );
}
