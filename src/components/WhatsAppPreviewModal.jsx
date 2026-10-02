import React, { useState } from 'react';
import { X, Send, Copy, Check, ShieldCheck } from 'lucide-react';
import { buildWhatsAppReceiptMessage, getWhatsAppShareUrl, formatPhoneNumberForWhatsApp, formatDisplayPhoneNumber } from '../utils/whatsappHelper';

export default function WhatsAppPreviewModal({ order, shopSettings, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const rawMessage = buildWhatsAppReceiptMessage(order, shopSettings);
  const formattedPhone = formatPhoneNumberForWhatsApp(order.customerPhone);
  const shareUrl = getWhatsAppShareUrl(order.customerPhone, rawMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#075E54] text-white px-4 sm:px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-base">
              💬
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm">WhatsApp Receipt Preview</h3>
                <span className="text-[10px] bg-emerald-700 text-emerald-100 px-1.5 py-0.2 rounded-md font-mono">
                  #{order.orderId}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">To: {formatDisplayPhoneNumber(order.customerPhone)} ({order.customerName})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* WhatsApp Chat Simulated Screen */}
        <div className="p-3.5 bg-[#E5DDD5] overflow-y-auto flex-1">
          {/* Chat Bubble */}
          <div className="bg-white rounded-2xl rounded-tl-xs p-3 shadow-sm max-w-sm ml-auto border border-emerald-100 text-xs text-slate-800 space-y-1">
            <div className="whitespace-pre-wrap leading-relaxed font-mono text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {rawMessage}
            </div>
            <div className="text-[10px] text-slate-400 text-right pt-0.5 flex items-center justify-end gap-1">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-blue-500 font-bold">✓✓</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-2 shrink-0 safe-bottom">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] active:bg-[#1DA851] text-white font-extrabold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all touch-manipulation text-center cursor-pointer"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
            <span>Open in WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto py-2.5 px-4 border border-slate-300 active:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
