import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  Scale, 
  ShoppingBag, 
  Calendar, 
  ArrowUpRight, 
  CreditCard, 
  Coins, 
  Smartphone,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';

export default function TrackMoney({ 
  orders = [], 
  shopSettings = {},
  onViewOrder 
}) {
  const currency = shopSettings.currency || '₹';

  // Filters state
  const [duration, setDuration] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [metric, setMetric] = useState('money'); // 'money', 'weight', 'orders'
  const [selectedBar, setSelectedBar] = useState(null);

  // =========================================================================
  // 1. DATA AGGREGATION FOR CHART
  // =========================================================================
  const chartData = useMemo(() => {
    const now = new Date();

    if (duration === 'daily') {
      // Last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);

        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);

        const dayOrders = orders.filter(o => {
          const ordDate = new Date(o.createdAt);
          return ordDate >= d && ordDate < nextD;
        });

        const money = dayOrders.reduce((sum, o) => {
          if (o.paymentStatus === 'paid') return sum + (o.grandTotal || 0);
          if (o.paymentStatus === 'partial') return sum + Math.round((o.grandTotal || 0) * 0.5);
          return sum;
        }, 0);

        const weight = dayOrders.reduce((sum, o) => sum + (parseFloat(o.totalWeight) || 0), 0);
        const count = dayOrders.length;

        days.push({
          label: i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
          fullDate: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          money,
          weight: parseFloat(weight.toFixed(1)),
          orders: count
        });
      }
      return days;
    }

    if (duration === 'weekly') {
      // Last 6 weeks
      const weeks = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - (i * 7 + 6));
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 7);

        const weekOrders = orders.filter(o => {
          const ordDate = new Date(o.createdAt);
          return ordDate >= start && ordDate < end;
        });

        const money = weekOrders.reduce((sum, o) => {
          if (o.paymentStatus === 'paid') return sum + (o.grandTotal || 0);
          if (o.paymentStatus === 'partial') return sum + Math.round((o.grandTotal || 0) * 0.5);
          return sum;
        }, 0);

        const weight = weekOrders.reduce((sum, o) => sum + (parseFloat(o.totalWeight) || 0), 0);
        const count = weekOrders.length;

        weeks.push({
          label: i === 0 ? 'This Wk' : `Wk -${i}`,
          fullDate: `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
          money,
          weight: parseFloat(weight.toFixed(1)),
          orders: count
        });
      }
      return weeks;
    }

    // Monthly: Last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextM = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthOrders = orders.filter(o => {
        const ordDate = new Date(o.createdAt);
        return ordDate >= d && ordDate < nextM;
      });

      const money = monthOrders.reduce((sum, o) => {
        if (o.paymentStatus === 'paid') return sum + (o.grandTotal || 0);
        if (o.paymentStatus === 'partial') return sum + Math.round((o.grandTotal || 0) * 0.5);
        return sum;
      }, 0);

      const weight = monthOrders.reduce((sum, o) => sum + (parseFloat(o.totalWeight) || 0), 0);
      const count = monthOrders.length;

      months.push({
        label: d.toLocaleDateString('en-IN', { month: 'short' }),
        fullDate: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        money,
        weight: parseFloat(weight.toFixed(1)),
        orders: count
      });
    }
    return months;
  }, [orders, duration]);

  // Max value calculation for chart scaling
  const maxValue = useMemo(() => {
    const vals = chartData.map(d => d[metric]);
    const max = Math.max(...vals, 1);
    return max;
  }, [chartData, metric]);

  // Metric metadata
  const metricMeta = {
    money: {
      title: 'Money Collected',
      unit: currency,
      color: 'emerald',
      barColor: 'from-emerald-500 to-teal-600',
      activeBorder: 'border-emerald-600',
      bgLight: 'bg-emerald-50',
      textDark: 'text-emerald-800'
    },
    weight: {
      title: 'Clothes Weight Processed',
      unit: 'kg',
      color: 'blue',
      barColor: 'from-blue-500 to-indigo-600',
      activeBorder: 'border-blue-600',
      bgLight: 'bg-blue-50',
      textDark: 'text-blue-800'
    },
    orders: {
      title: 'Number of Orders',
      unit: 'orders',
      color: 'purple',
      barColor: 'from-purple-500 to-violet-600',
      activeBorder: 'border-purple-600',
      bgLight: 'bg-purple-50',
      textDark: 'text-purple-800'
    }
  }[metric];

  // =========================================================================
  // 2. FINANCIAL KPI TOTALS
  // =========================================================================
  const totalMoneyCollected = orders.reduce((sum, o) => {
    if (o.paymentStatus === 'paid') return sum + (o.grandTotal || 0);
    if (o.paymentStatus === 'partial') return sum + Math.round((o.grandTotal || 0) * 0.5);
    return sum;
  }, 0);

  const totalPendingDue = orders.reduce((sum, o) => {
    if (o.paymentStatus === 'pending') return sum + (o.grandTotal || 0);
    if (o.paymentStatus === 'partial') return sum + Math.round((o.grandTotal || 0) * 0.5);
    return sum;
  }, 0);

  const totalWeightProcessed = orders.reduce(
    (sum, o) => sum + (parseFloat(o.totalWeight) || 0), 
    0
  );

  const averageOrderValue = orders.length > 0 
    ? Math.round(orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0) / orders.length) 
    : 0;

  // =========================================================================
  // 3. RECENT PAYMENTS RECEIVED LIST
  // =========================================================================
  const recentPayments = orders
    .filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'partial')
    .slice(0, 15);

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Track Money</span>
          </h2>
        </div>

        {/* Duration Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl self-start sm:self-auto">
          {[
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setDuration(f.id);
                setSelectedBar(null);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                duration === f.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 KPI Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Collected */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Collected
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {currency}{totalMoneyCollected.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Pending to Collect */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Pending Collection
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            {currency}{totalPendingDue.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Total Weight */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Weight
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-700">
            {totalWeightProcessed.toFixed(1)} <span className="text-xs font-bold">kg</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Average Order Value
          </span>
          <div className="text-xl sm:text-2xl font-black text-purple-700">
            {currency}{averageOrderValue}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE CHART SECTION WITH METRIC TOGGLE                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Metric Switcher & Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              {metricMeta.title}
            </h3>
          </div>

          {/* Metric Toggle Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setMetric('money');
                setSelectedBar(null);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                metric === 'money'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Money Collected</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMetric('weight');
                setSelectedBar(null);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                metric === 'weight'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>Weight (kg)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMetric('orders');
                setSelectedBar(null);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                metric === 'orders'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
              <span>Orders</span>
            </button>
          </div>
        </div>

        {/* Selected Data Point Detail Badge */}
        {selectedBar && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-800">{selectedBar.fullDate}</span>
            </div>
            <div className="flex items-center gap-3 font-extrabold">
              <span className="text-emerald-700">₹{selectedBar.money}</span>
              <span className="text-blue-700">{selectedBar.weight} kg</span>
              <span className="text-purple-700">{selectedBar.orders} orders</span>
            </div>
          </div>
        )}

        {/* Responsive Visual Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="h-56 sm:h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200">
            {chartData.map((item, idx) => {
              const val = item[metric];
              const heightPercent = maxValue > 0 ? Math.max(6, Math.round((val / maxValue) * 100)) : 6;
              const isSelected = selectedBar?.label === item.label;

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedBar(item)}
                  className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                >
                  {/* Floating Value on Bar Top */}
                  <span className="text-[10px] font-extrabold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {metric === 'money' ? `₹${val}` : (metric === 'weight' ? `${val}k` : val)}
                  </span>

                  {/* The Bar */}
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[42px] rounded-t-xl bg-gradient-to-t ${metricMeta.barColor} transition-all duration-300 relative group-hover:brightness-110 active:scale-95 shadow-xs ${
                      isSelected ? 'ring-2 ring-slate-900 ring-offset-2' : ''
                    }`}
                  >
                    {val === maxValue && val > 0 && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] bg-slate-900 text-white px-1 rounded font-bold uppercase">
                        Peak
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between gap-2 sm:gap-4 px-2 pt-2 text-[10px] sm:text-xs font-bold text-slate-500">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex-1 text-center truncate">
                {item.label}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RECENT PAYMENTS RECEIVED LEDGER                                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recent Payments</span>
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {recentPayments.length} Payments
          </span>
        </div>

        {recentPayments.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
            No payments received yet.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {recentPayments.map(order => {
              const paymentIcon = order.paymentMode === 'UPI' ? (
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              ) : order.paymentMode === 'Card' ? (
                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              ) : (
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
              );

              return (
                <div 
                  key={order.orderId}
                  onClick={() => onViewOrder && onViewOrder(order)}
                  className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {paymentIcon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                          {order.customerName}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                          #{order.orderId}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{' '}
                        at {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} •{' '}
                        <span className="font-semibold text-slate-700">{order.paymentMode || 'Cash'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-black text-emerald-700">
                      +{currency}{order.grandTotal}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                      {order.paymentStatus}
                    </span>
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
