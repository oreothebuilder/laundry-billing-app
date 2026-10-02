import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  Eye, 
  Trash2,
  Phone,
  ArrowUpRight,
  Shirt,
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { buildWhatsAppReceiptMessage, getWhatsAppShareUrl, formatDisplayPhoneNumber } from '../utils/whatsappHelper';

const STATUS_OPTIONS = [
  { id: 'received', label: 'Received', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'washing', label: 'Washing', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'ready', label: 'Ready', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'delivered', label: 'Delivered', color: 'bg-slate-100 text-slate-700 border-slate-200' }
];

export default function OrderHistory({ 
  orders, 
  shopSettings, 
  onViewOrder, 
  onUpdateStatus, 
  onUpdatePaymentStatus,
  onDeleteOrder 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const currency = shopSettings.currency || '₹';

  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const activeOrders = orders.filter(o => o.orderStatus !== 'delivered').length;
  const readyOrders = orders.filter(o => o.orderStatus === 'ready').length;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = serviceFilter === 'all' || order.serviceType === serviceFilter;
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

    return matchesSearch && matchesService && matchesStatus;
  });

  const handleSendWhatsApp = (order) => {
    const msg = buildWhatsAppReceiptMessage(order, shopSettings);
    const url = getWhatsAppShareUrl(order.customerPhone, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Shirt className="w-5 h-5 text-blue-600" />
          <span>All Bills</span>
        </h2>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {orders.length} {orders.length === 1 ? 'Bill' : 'Bills'}
        </span>
      </div>

      {/* Top Stat Cards (2x2 grid on mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">{orders.length}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-500">In Process</p>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-0.5">{activeOrders}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-500">Ready</p>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">{readyOrders}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-500">Billed Total</p>
          <p className="text-xl sm:text-2xl font-extrabold text-blue-700 mt-0.5">{currency}{totalRevenue}</p>
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
            placeholder="Search orders..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 p-1"
            >
              ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
          >
            <option value="all">All Services</option>
            <option value="regular">Regular</option>
            <option value="premium">Premium</option>
            <option value="dry_cleaning">Dry Cleaning</option>
            <option value="others">Others</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="received">Received</option>
            <option value="washing">Washing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
          <Shirt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No Orders Found</h3>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredOrders.map((order) => {
            const currentStatusObj = STATUS_OPTIONS.find(s => s.id === order.orderStatus) || STATUS_OPTIONS[0];

            return (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-3"
              >
                {/* Header Row: ID, Service, Total Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-extrabold text-xs bg-slate-100 text-slate-900 px-2 py-0.5 rounded-md">
                      #{order.orderId}
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                      {order.serviceName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base sm:text-lg font-extrabold text-blue-700">
                      {currency}{order.grandTotal}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{order.customerName}</h4>
                    <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <a href={`tel:${order.customerPhone}`} className="hover:underline">
                        {formatDisplayPhoneNumber(order.customerPhone)}
                      </a>
                    </p>
                  </div>

                  {/* Status & Payment Controls */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {/* Payment Status Toggle: Collect Payment <-> Collected */}
                    {order.paymentStatus === 'paid' ? (
                      <button
                        type="button"
                        onClick={() => onUpdatePaymentStatus && onUpdatePaymentStatus(order.orderId, 'pending', 'pending')}
                        className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-amber-100 hover:text-amber-900 text-emerald-800 border border-emerald-300 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
                        title="Click to toggle to Collect Payment"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Collected</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdatePaymentStatus && onUpdatePaymentStatus(order.orderId, 'paid', 'UPI')}
                        className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-emerald-600 text-white border border-amber-600 hover:border-emerald-700 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
                        title="Click to mark as Collected"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Collect Payment</span>
                      </button>
                    )}

                    {/* Status Dropdown */}
                    <div>
                      <select
                        value={order.orderStatus || 'received'}
                        onChange={(e) => onUpdateStatus(order.orderId, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${currentStatusObj.color}`}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Clothes Breakdown Preview */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl flex items-center justify-between">
                  <span className="truncate max-w-[220px]">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </span>
                  <span className="font-bold text-slate-700 shrink-0 ml-1">
                    {order.totalPieces} pcs {order.totalWeight ? `(${order.totalWeight}kg)` : ''}
                  </span>
                </div>

                {/* Action Buttons Bar */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  {/* Resend WhatsApp */}
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(order)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Send WhatsApp</span>
                  </button>

                  {/* View / Print */}
                  <button
                    type="button"
                    onClick={() => onViewOrder(order)}
                    className="py-2 px-3 rounded-xl border border-slate-200 active:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="View / Print Receipt"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">View</span>
                  </button>

                  {/* Delete Bill */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete bill #${order.orderId} for ${order.customerName}?`)) {
                        onDeleteOrder(order.orderId);
                      }
                    }}
                    className="py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 active:bg-rose-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Delete Bill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
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
