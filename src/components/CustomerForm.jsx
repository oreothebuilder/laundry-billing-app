import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, Check, Sparkles } from 'lucide-react';
import { stripCountryCode, formatDisplayPhoneNumber } from '../utils/whatsappHelper';

export default function CustomerForm({ 
  customer, 
  onChangeCustomer, 
  recentCustomers = [] 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Phone quick match suggestions with +91 default
  const handlePhoneChange = (val) => {
    const rawDigits = stripCountryCode(val);
    const formatted = rawDigits ? `+91 ${rawDigits}` : '';
    onChangeCustomer({ ...customer, phone: formatted });

    if (rawDigits.length >= 3) {
      const matches = recentCustomers.filter(c => {
        const cDigits = stripCountryCode(c.phone);
        return cDigits.includes(rawDigits) || (c.name ? c.name.toLowerCase().includes(val.toLowerCase()) : false);
      });
      setSuggestions(matches.slice(0, 4));
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (selected) => {
    onChangeCustomer({
      ...customer,
      name: selected.name,
      phone: formatDisplayPhoneNumber(selected.phone)
    });
    setShowSuggestions(false);
  };

  // Helper for quick delivery dates
  const getDateForOffset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const setQuickDelivery = (days) => {
    const dateStr = getDateForOffset(days);
    onChangeCustomer({ ...customer, deliveryDate: dateStr });
  };

  useEffect(() => {
    if (!customer.deliveryDate) {
      onChangeCustomer({ ...customer, deliveryDate: getDateForOffset(2) });
    }
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 sm:gap-2">
          <User className="w-4 h-4 text-blue-600 shrink-0" />
          <span>1. Customer Details</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Customer Phone (With native mobile numeric keypad & +91 prefix) */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Customer Phone <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 bg-slate-100/90 border-r border-slate-200 text-slate-700 font-extrabold text-xs select-none shrink-0 font-mono">
              <span className="text-sm">🇮🇳</span>
              <span>+91</span>
            </div>
            <input
              type="tel"
              inputMode="tel"
              value={stripCountryCode(customer.phone)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="98765 43210"
              maxLength={15}
              className="w-full px-3 py-2.5 bg-transparent text-base sm:text-sm font-semibold tracking-wide text-slate-900 focus:outline-hidden"
              required
            />
            {stripCountryCode(customer.phone).length >= 10 && (
              <div className="pr-3 flex items-center text-emerald-600 shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            )}
          </div>

          {/* Autocomplete dropdown for returning customers */}
          {showSuggestions && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Tap to Autofill
              </div>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectCustomer(s)}
                  className="w-full text-left px-3 py-2.5 text-xs hover:bg-blue-50 active:bg-blue-100 flex items-center justify-between transition-colors border-b border-slate-100 last:border-b-0 cursor-pointer"
                >
                  <span className="font-bold text-slate-900">{s.name}</span>
                  <span className="text-blue-600 font-mono text-[11px] font-bold">{formatDisplayPhoneNumber(s.phone)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Customer Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Customer Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={customer.name}
              onChange={(e) => onChangeCustomer({ ...customer, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>
        </div>

        {/* Expected Delivery Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ready / Pickup Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="date"
              value={customer.deliveryDate || ''}
              onChange={(e) => onChangeCustomer({ ...customer, deliveryDate: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Quick Date Pills (Dynamically reactive to customer.deliveryDate) */}
          <div className="flex gap-1.5 mt-2 overflow-x-auto pb-0.5">
            {[
              { days: 0, label: 'Today' },
              { days: 1, label: 'Tomorrow' },
              { days: 2, label: '2 Days (Std)' },
              { days: 3, label: '3 Days' },
              { days: 5, label: '5 Days' }
            ].map(({ days, label }) => {
              const targetDate = getDateForOffset(days);
              const isActive = customer.deliveryDate === targetDate;
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => setQuickDelivery(days)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-extrabold shadow-2xs border border-blue-600'
                      : 'bg-slate-100 hover:bg-slate-200 active:bg-blue-100 text-slate-700 font-semibold border border-transparent'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
