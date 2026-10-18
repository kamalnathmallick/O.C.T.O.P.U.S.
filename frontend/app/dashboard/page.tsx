'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { analyticsService, alertService, machineService, maintenanceService } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import {
  Cpu,
  AlertTriangle,
  Wrench,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, accessToken, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      loadDashboardData();
    }
  }, [accessToken]);

  const loadDashboardData = async () => {
    // Validate token exists
    if (!accessToken) {
      console.log('No access token found, redirecting to login...');
      toast.error('Authentication Required', 'Please login to access the dashboard');
      logout();
      router.push('/');
      setLoading(false);
      return;
    }

    try {
      const [statsData, alertsData, machinesData, maintenanceData] = await Promise.all([
        analyticsService.getDashboardStats(accessToken),
        alertService.getAlerts(accessToken, 'ACTIVE'),
        machineService.getMachines(accessToken),
        maintenanceService.getTasks(accessToken, 'PENDING'),
      ]);
      setStats(statsData);
      setAlerts(alertsData.slice(0, 5));
      setMachines(machinesData.slice(0, 5));
      setMaintenance(maintenanceData.slice(0, 5));
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard data';

      if (
        message.includes('token') ||
        message.includes('Unauthorized') ||
        message.includes('Invalid token') ||
        message.includes('Session expired')
      ) {
        toast.error('Session Expired', 'Your session has expired. Please login again.');
        logout();
        router.replace('/');
        return;
      }

      // Check if backend server is not running
      if (message.includes('fetch') || message.includes('Failed to fetch')) {
        toast.error('Backend Server Not Running', 'Please start the backend server: cd backend && npm run dev', { persist: true });
        setLoading(false);
        return;
      }

      console.error('Failed to load dashboard data:', error);
      toast.error('Error Loading Data', message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'CRITICAL':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Welcome header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Here&apos;s what&apos;s happening with your equipment today.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Machines</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats?.totalMachines || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-green-600 dark:text-green-400">{stats?.healthyMachines || 0} healthy</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-yellow-600 dark:text-yellow-400">{stats?.warningMachines || 0} warning</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-red-600 dark:text-red-400">{stats?.criticalMachines || 0} critical</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Alerts</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats?.activeAlerts || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-slate-600 dark:text-slate-400">Needs attention</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending Maintenance</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats?.pendingMaintenance || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-slate-600 dark:text-slate-400">Tasks scheduled</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Risk Assessment</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats?.predictionStats?.normal || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-green-600 dark:text-green-400">
                {stats?.predictionStats?.normal || 0} normal
              </span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-red-600 dark:text-red-400">
                {stats?.predictionStats?.critical || 0} critical
              </span>
            </div>
          </div>
        </div>

        {/* Charts and tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Machine health chart */}
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Machine Health Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Healthy', value: stats?.healthyMachines || 0 },
                      { name: 'Warning', value: stats?.warningMachines || 0 },
                      { name: 'Critical', value: stats?.criticalMachines || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[0, 1, 2].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Critical</span>
              </div>
            </div>
          </div>

          {/* Recent alerts */}
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400 text-sm">No active alerts</p>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200/50 dark:border-slate-700/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-red-500'
                            : alert.severity === 'WARNING'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{alert.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{alert.machine?.name}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        alert.status === 'ACTIVE'
                          ? 'bg-red-500/20 text-red-400'
                          : alert.status === 'ACKNOWLEDGED'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Machines table */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Machine Status</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 pb-3">Machine</th>
                  <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 pb-3">Type</th>
                  <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 pb-3">Status</th>
                  <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 pb-3">Health</th>
                  <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 pb-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {machines.map((machine) => (
                  <tr key={machine.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{machine.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">{machine.serialNumber}</p>
                    </td>
                    <td className="py-3 text-sm text-slate-600 dark:text-slate-400">{machine.type}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(machine.status)}
                        <span className="text-sm text-slate-700 dark:text-slate-300">{machine.status}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              machine.healthScore >= 80
                                ? 'bg-green-500'
                                : machine.healthScore >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${machine.healthScore}%` }}
                          />
                        </div>
                        <span className={`text-sm ${getHealthColor(machine.healthScore)}`}>
                          {machine.healthScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-slate-600 dark:text-slate-400">{machine.location || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
