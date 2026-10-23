import React from 'react';
import { Sparkles, Crown, Shirt, Flame, Check, Plus } from 'lucide-react';
import { DEFAULT_SERVICES } from '../data/defaultItems';

const ICON_MAP = {
  Sparkles,
  Crown,
  Shirt,
  Flame
};

export default function ServiceSelector({ 
  selectedServices = ['regular'], 
  onToggleService, 
  shopSettings = {} 
}) {
  const activeList = Array.isArray(selectedServices) ? selectedServices : [selectedServices];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
        <div>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>2. Services</span>
          </h2>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            {activeList.length} {activeList.length === 1 ? 'Service' : 'Services'} Selected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {DEFAULT_SERVICES.map((srv) => {
          const Icon = ICON_MAP[srv.icon] || Sparkles;
          const isSelected = activeList.includes(srv.id);

          const rateBadge = {
            regular: `₹${shopSettings.regularKgRate || 60}/kg`,
            premium: `₹${shopSettings.premiumKgRate || 80}/kg`,
            dry_cleaning: 'Per Piece',
            others: 'Per Item'
          }[srv.id];

          const colorTheme = {
            regular: {
              activeBorder: 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/70',
              iconBg: 'bg-blue-100 text-blue-600',
              badge: 'bg-blue-100 text-blue-700',
              checkColor: 'bg-blue-600'
            },
            premium: {
              activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/70',
              iconBg: 'bg-amber-100 text-amber-700',
              badge: 'bg-amber-100 text-amber-800',
              checkColor: 'bg-amber-600'
            },
            dry_cleaning: {
              activeBorder: 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/70',
              iconBg: 'bg-purple-100 text-purple-700',
              badge: 'bg-purple-100 text-purple-800',
              checkColor: 'bg-purple-600'
            },
            others: {
              activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/70',
              iconBg: 'bg-emerald-100 text-emerald-700',
              badge: 'bg-emerald-100 text-emerald-800',
              checkColor: 'bg-emerald-600'
            }
          }[srv.id];

          return (
            <button
              key={srv.id}
              type="button"
              onClick={() => onToggleService(srv.id)}
              className={`relative text-left p-3 sm:p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between active:scale-[0.97] touch-manipulation cursor-pointer ${
                isSelected
                  ? `${colorTheme.activeBorder} shadow-xs`
                  : 'border-slate-200 hover:border-slate-300 bg-white opacity-85 hover:opacity-100'
              }`}
            >
              {/* Checkbox indicator */}
              <div className="absolute top-2.5 right-2.5">
                {isSelected ? (
                  <div className={`w-5 h-5 rounded-full ${colorTheme.checkColor} text-white flex items-center justify-center shadow-xs`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center">
                    <Plus className="w-3 h-3 text-slate-400" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${colorTheme.iconBg}`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${colorTheme.badge}`}>
                    {srv.badge}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">{srv.name}</h3>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 text-[10px] flex items-center">
                <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                  {rateBadge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
