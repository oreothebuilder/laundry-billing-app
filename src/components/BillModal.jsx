import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Send, 
  Download, 
  CheckCircle2, 
  Share2, 
  Scale, 
  Copy,
  Check,
  Shirt,
  Phone,
  Sparkles,
  Crown,
  QrCode
} from 'lucide-react';
import { 
  buildWhatsAppReceiptMessage, 
  getWhatsAppShareUrl, 
  formatDisplayPhoneNumber,
  buildUpiPaymentUrl 
} from '../utils/whatsappHelper';

export default function BillModal({ 
  order, 
  shopSettings, 
  onClose, 
  onOpenWhatsAppPreview,
  onResetOrder 
}) {
  const [viewMode, setViewMode] = useState('modern'); // 'modern' or 'thermal'
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const parseOrderDate = (val) => {
    if (!val) return null;
    if (typeof val.toDate === 'function') return val.toDate();
    if (val.seconds) return new Date(val.seconds * 1000);
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const currency = shopSettings?.currency || '₹';
  const whatsappUrl = getWhatsAppShareUrl(order.customerPhone, buildWhatsAppReceiptMessage(order, shopSettings));
  
  const upiId = (shopSettings?.shopUpiId || '').trim();
  const upiUri = upiId ? buildUpiPaymentUrl(order, shopSettings) : '';
  const qrCodeImgUrl = upiUri ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}&margin=2` : '';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTextReceipt = () => {
    const text = buildWhatsAppReceiptMessage(order, shopSettings);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsAppDirect = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const items = Array.isArray(order.items)
    ? order.items
    : (order.items && typeof order.items === 'object' ? Object.values(order.items) : []);

  const regItems = items.filter(i => i?.serviceCategory === 'regular');
  const premItems = items.filter(i => i?.serviceCategory === 'premium');
  const dcItems = items.filter(i => i?.serviceCategory === 'dry_cleaning');
  const othItems = items.filter(i => i?.serviceCategory === 'others');

  // Format service name(s)
  const serviceDisplayName = Array.isArray(order.selectedServices)
    ? order.selectedServices.map(s => {
        if (s === 'regular') return 'Regular Wash';
        if (s === 'premium') return 'Premium Care';
        if (s === 'dry_cleaning') return 'Dry Cleaning';
        return 'Others';
      }).join(' + ')
    : (order.serviceName || 'Laundry Service');

  const formattedDate = (() => {
    const d = parseOrderDate(order.createdAt);
    return d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';
  })();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="no-print bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4 sm:px-6 py-3.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Order #{order.orderId}</h3>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Switcher & Action Toolbar */}
        <div className="no-print bg-slate-50 px-4 sm:px-6 py-2 border-b border-slate-200 flex items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg font-semibold">
            <button
              onClick={() => setViewMode('modern')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                viewMode === 'modern' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Invoice
            </button>
            <button
              onClick={() => setViewMode('thermal')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                viewMode === 'thermal' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              POS Thermal
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyTextReceipt}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white active:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white active:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          <div id="printable-receipt" className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200/70 max-w-xl mx-auto">
            {viewMode === 'modern' ? (
              /* MODERN INVOICE VIEW */
              <div className="space-y-4 text-slate-800">
                {/* Brand & Order Details */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <img src="/logo.png" alt={shopSettings.shopName || "BTech Drycleaners"} className="h-9 sm:h-10 w-auto object-contain" />
                    </div>
                    {shopSettings.address && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {shopSettings.address}, {shopSettings.city}
                      </p>
                    )}
                    {shopSettings.phone && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{formatDisplayPhoneNumber(shopSettings.phone)}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-blue-100 text-blue-800 font-mono font-extrabold text-xs px-2 py-0.5 rounded-md mb-0.5">
                      #{order.orderId}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {formattedDate || 'Recent'}
                    </p>
                  </div>
                </div>

                {/* Customer & Service Info Bar */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Customer</span>
                    <p className="font-extrabold text-slate-900 text-xs sm:text-sm">{order.customerName}</p>
                    <p className="text-slate-600 font-mono text-[11px]">{formatDisplayPhoneNumber(order.customerPhone)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Services & Ready Date</span>
                    <p className="font-bold text-blue-700 capitalize text-xs">{serviceDisplayName}</p>
                    <p className="text-slate-600 text-[11px]">Ready: <strong>{order.deliveryDate}</strong></p>
                  </div>
                </div>

                {/* Service Breakdowns & Items */}
                <div className="space-y-3">
                  
                  {/* 1. Regular Wash Section */}
                  {(regItems.length > 0 || (order.regularWeight && Number(order.regularWeight) > 0)) && (
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-blue-200/60 text-xs font-bold text-blue-900">
                        <span className="flex items-center gap-1">
                          <Shirt className="w-3.5 h-3.5 text-blue-600" />
                          <span>Regular Wash ({order.regularWeight || order.totalWeight} kg @ {currency}{order.regularRatePerKg || shopSettings.regularKgRate || 60}/kg)</span>
                        </span>
                        <span className="text-blue-700 font-extrabold">{currency}{order.regularAmount || 0}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-700">
                        {regItems.map((it, idx) => (
                          <span key={idx} className="bg-white px-2 py-0.5 rounded border border-blue-200 font-medium">
                            {it.name}: <strong>{it.quantity}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Premium Care Section */}
                  {(premItems.length > 0 || (order.premiumWeight && Number(order.premiumWeight) > 0)) && (
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-amber-200/60 text-xs font-bold text-amber-900">
                        <span className="flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-amber-600" />
                          <span>Premium Care ({order.premiumWeight} kg @ {currency}{order.premiumRatePerKg || shopSettings.premiumKgRate || 80}/kg)</span>
                        </span>
                        <span className="text-amber-800 font-extrabold">{currency}{order.premiumAmount || 0}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-700">
                        {premItems.map((it, idx) => (
                          <span key={idx} className="bg-white px-2 py-0.5 rounded border border-amber-200 font-medium">
                            {it.name}: <strong>{it.quantity}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Dry Cleaning Section */}
                  {dcItems.length > 0 && (
                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                      <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-purple-200/60 text-xs font-bold text-purple-900">
                        <span>Dry Cleaning (Individual Piece Rates)</span>
                        <span className="text-purple-800 font-extrabold">{currency}{order.dryCleaningAmount || 0}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        {dcItems.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span>{it.name} × {it.quantity}</span>
                            <span className="font-bold">{currency}{(it.unitPrice || it.price) * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Others Section */}
                  {othItems.length > 0 && (
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-emerald-200/60 text-xs font-bold text-emerald-900">
                        <span>Others</span>
                        <span className="text-emerald-800 font-extrabold">{currency}{order.othersAmount || 0}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        {othItems.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span>{it.name} × {it.quantity}</span>
                            <span className="font-bold">{currency}{(it.unitPrice || it.price) * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Summary & Totals */}
                <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row justify-between gap-3">
                  <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <p>Total Clothes Count: <strong className="text-slate-900">{order.totalPieces} pcs</strong></p>
                    {((parseFloat(order.regularWeight) || 0) + (parseFloat(order.premiumWeight) || 0) > 0) && (
                      <p>Total Wash Weight: <strong className="text-slate-900">
                        {((parseFloat(order.regularWeight) || 0) + (parseFloat(order.premiumWeight) || 0)).toFixed(1)} kg
                      </strong></p>
                    )}
                  </div>

                  <div className="text-xs space-y-1 sm:w-56">
                    {order.subtotal && order.subtotal !== order.grandTotal && (
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span>{currency}{order.subtotal}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount:</span>
                        <span>-{currency}{order.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline border-t border-slate-200 pt-1 text-slate-900 font-bold">
                      <span className="text-sm">Grand Total:</span>
                      <span className="text-xl text-blue-700 font-extrabold">{currency}{order.grandTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Counter Walk-In UPI QR Code */}
                {qrCodeImgUrl && (
                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-900">
                        <QrCode className="w-4 h-4 text-blue-600" />
                        <span>Scan & Pay via UPI</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                      <p className="text-[11px] font-mono font-bold text-blue-700">UPI: {upiId}</p>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-xs shrink-0">
                      <img src={qrCodeImgUrl} alt="UPI QR Code" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* THERMAL RECEIPT VIEW */
              <div className="font-mono text-xs text-slate-800 max-w-xs mx-auto p-1 leading-tight">
                <div className="text-center pb-2 border-b border-dashed border-slate-400">
                  <p className="font-bold text-sm">{shopSettings.shopName.toUpperCase()}</p>
                  {shopSettings.phone && <p className="text-[10px]">{formatDisplayPhoneNumber(shopSettings.phone)}</p>}
                  <p className="mt-1 font-bold">*** BILL RECEIPT ***</p>
                </div>

                <div className="py-2 border-b border-dashed border-slate-400 text-[11px]">
                  <p>ORDER: #{order.orderId}</p>
                  <p>CUST: {order.customerName}</p>
                  <p>PHONE: {formatDisplayPhoneNumber(order.customerPhone)}</p>
                  <p>SERVICES: {serviceDisplayName.toUpperCase()}</p>
                  <p>READY: {order.deliveryDate}</p>
                </div>

                <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
                  {order.regularWeight && Number(order.regularWeight) > 0 && (
                    <div className="flex justify-between py-0.5">
                      <span>REGULAR WASH ({order.regularWeight}kg):</span>
                      <span className="font-bold">{currency}{order.regularAmount || 0}</span>
                    </div>
                  )}
                  {order.premiumWeight && Number(order.premiumWeight) > 0 && (
                    <div className="flex justify-between py-0.5">
                      <span>PREMIUM CARE ({order.premiumWeight}kg):</span>
                      <span className="font-bold">{currency}{order.premiumAmount || 0}</span>
                    </div>
                  )}
                  {dcItems.map((it, i) => (
                    <div key={i} className="flex justify-between py-0.5">
                      <span className="truncate max-w-[120px]">{it.name}</span>
                      <span>{it.quantity}x{currency}{it.unitPrice}</span>
                      <span className="font-bold">{currency}{(it.unitPrice || it.price) * it.quantity}</span>
                    </div>
                  ))}
                  {othItems.map((it, i) => (
                    <div key={i} className="flex justify-between py-0.5">
                      <span className="truncate max-w-[120px]">{it.name}</span>
                      <span>{it.quantity}x{currency}{it.unitPrice}</span>
                      <span className="font-bold">{currency}{(it.unitPrice || it.price) * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>TOTAL PCS:</span>
                    <span className="font-bold">{order.totalPieces}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span>DISCOUNT:</span>
                      <span>-{currency}{order.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-300">
                    <span>GRAND TOTAL:</span>
                    <span>{currency}{order.grandTotal}</span>
                  </div>
                </div>

                {/* Thermal UPI QR Code */}
                {qrCodeImgUrl && (
                  <div className="text-center py-2 border-b border-dashed border-slate-400">
                    <p className="font-bold text-[10px] mb-1">SCAN TO PAY (UPI)</p>
                    <img src={qrCodeImgUrl} alt="UPI QR" className="w-24 h-24 mx-auto object-contain" />
                    <p className="text-[9px] mt-1 font-mono">{upiId}</p>
                  </div>
                )}

                <div className="text-center pt-2 text-[10px] text-slate-500">
                  <p>*** THANK YOU! ***</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print bg-white px-4 py-3 border-t border-slate-200 flex flex-col gap-2 shrink-0 safe-bottom">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] active:bg-[#1DA851] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all touch-manipulation cursor-pointer text-center"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
            <span>Send on WhatsApp</span>
          </a>

          <div className="flex gap-2">
            <button
              onClick={onOpenWhatsAppPreview}
              className="flex-1 py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 active:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Preview Message</span>
            </button>
            <button
              onClick={() => {
                if (onResetOrder) onResetOrder();
                onClose();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
            >
              New Bill
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
