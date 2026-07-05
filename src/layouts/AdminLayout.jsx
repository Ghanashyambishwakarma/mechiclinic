import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Globe, Stethoscope, UserRound, Building2, MessageSquare,
  Images, HelpCircle, Newspaper, Calendar, Users, Package, Receipt, Wallet,
  Shield, BarChart3, LogOut, Menu, X, ChevronLeft, Settings2,
} from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { ADMIN_NAV } from '../lib/constants';

const iconMap = {
  LayoutDashboard, Globe, Stethoscope, UserRound, Building2, MessageSquare,
  Images, HelpCircle, Newspaper, Calendar, Users, Package, Receipt, Wallet,
  Shield, BarChart3, Settings2,
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen gradient-bg-soft dark:bg-slate-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 glass-strong border-r border-white/20 dark:border-slate-800 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between border-b border-slate-200/30 dark:border-slate-700/30">
            {sidebarOpen ? <Logo size="sm" /> : <Logo size="sm" showText={false} />}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    isActive ? 'admin-sidebar-link-active' : 'admin-sidebar-link'
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200/30 dark:border-slate-700/30">
            {sidebarOpen && user && (
              <p className="text-xs text-slate-500 mb-3 truncate">{user.email}</p>
            )}
            <button onClick={handleLogout} className="admin-sidebar-link w-full text-red-500 hover:text-red-600">
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <header className="sticky top-0 z-30 glass border-b border-white/20 dark:border-slate-800 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Admin Panel
                </h1>
                <p className="text-xs text-slate-500">Mechi Clinic Management</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
