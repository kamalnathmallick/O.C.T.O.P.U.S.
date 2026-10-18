'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api';
import NotificationCenter from '@/components/NotificationCenter';
import ThemeToggle from '@/components/ThemeToggle';
import {
  LayoutDashboard,
  Settings,
  Activity,
  AlertTriangle,
  Cpu,
  Wrench,
  BarChart3,
  Users,
  Server,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Bot,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Agents', href: '/dashboard/agents', icon: Bot },
  { name: 'Machines', href: '/dashboard/machines', icon: Cpu },
  { name: 'Sensors', href: '/dashboard/sensors', icon: Activity },
  { name: 'Alerts', href: '/dashboard/alerts', icon: AlertTriangle },
  { name: 'Predictions', href: '/dashboard/predictions', icon: BarChart3 },
  { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Users', href: '/dashboard/users', icon: Users, adminOnly: true },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, adminOnly: true },
  { name: 'System Health', href: '/dashboard/system', icon: Server, adminOnly: true },
];

const secondaryNav = [
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
  { name: 'Support', href: '/dashboard/support', icon: HelpCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, accessToken } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/');
    }
  }, [mounted, isAuthenticated, router]);

  const handleLogout = async () => {
    if (accessToken) {
      try {
        await authService.logout(accessToken);
      } catch {
        // Ignore logout errors
      }
    }
    logout();
    router.push('/');
  };

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredNav = navigation.filter(
    (item) => !item.adminOnly || user.role === 'ADMIN'
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-slate-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 backdrop-blur-xl border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-slate-700">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">O</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Octopus</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {secondaryNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Notifications */}
              <NotificationCenter />

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400 hidden sm:block" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                            {user.role}
                          </span>
                          {user.department && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-300">
                              {user.department}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}