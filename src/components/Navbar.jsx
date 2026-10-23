import React from 'react';
import { 
  LayoutDashboard,
  PlusCircle, 
  TrendingUp, 
  Settings, 
  FileText,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  ordersCount = 0
}) {
  const { currentUser, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'history', label: 'All bills', icon: FileText, badge: ordersCount > 0 ? ordersCount : null },
    { id: 'track_money', label: 'Track money', icon: TrendingUp, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out from BTech Drycleaners POS?')) {
      try {
        await logout();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  return (
    <>
      {/* TOP HEADER (Sticky across all devices) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Brand Logo & Name */}
            <div 
              className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
              onClick={() => setActiveTab('dashboard')}
            >
              <img 
                src="/logo.png" 
                alt="BTech Drycleaners" 
                className="h-8 sm:h-9 w-auto object-contain" 
              />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md self-center">
                POS
              </span>
            </div>

            {/* Desktop Navigation Tabs (Hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold text-white ${item.badgeColor || 'bg-blue-600'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right side Actions (Issue Bill button, Auth indicator, Logout) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Primary Top Bar Action: Issue Bill Button (Replaces old clock icon) */}
              <button
                type="button"
                onClick={() => setActiveTab('issue_bill')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-extrabold active:scale-95 transition-all shadow-xs cursor-pointer ${
                  activeTab === 'issue_bill'
                    ? 'bg-blue-700 text-white shadow-blue-600/30 ring-2 ring-blue-300'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                }`}
                title="Issue Bill"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Issue Bill</span>
              </button>

              {/* Authenticated User Badge & Logout */}
              {currentUser && (
                <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                  <div 
                    onClick={() => setActiveTab('settings')}
                    className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-xl cursor-pointer transition-colors"
                    title={`Logged in as ${currentUser.email}`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold text-slate-700 max-w-[130px] truncate">
                      {currentUser.email}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Log Out of POS"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* MOBILE NATIVE-STYLE BOTTOM NAVIGATION BAR (4 tabs) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg safe-bottom no-print">
        <div className="grid grid-cols-4 h-15">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center gap-0.5 relative py-1 transition-colors cursor-pointer ${
                  isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`absolute -top-1.5 -right-2 text-white text-[9px] font-extrabold px-1 py-0.2 rounded-full min-w-3.5 text-center leading-none ${item.badgeColor || 'bg-blue-600'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] tracking-tight capitalize ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 w-7 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
