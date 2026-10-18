'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { analyticsService } from '@/services/api';
import { BarChart3, TrendingDown, TrendingUp, Clock, Wrench } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];

export default function AnalyticsPage() {
  const { accessToken } = useAuthStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      loadAnalytics();
    }
  }, [accessToken]);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsService.getAnalytics(accessToken!);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Performance metrics and trend analysis</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">MTBF</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.mtbf || 0}h</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Mean Time Between Failures</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">MTTR</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.mttr || 0}h</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Mean Time To Repair</p>
            </div>
            <Wrench className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Health</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.machineStats?.avgHealthScore || 0}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Overall equipment health</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Uptime</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">99.2%</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">System availability</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Downtime Trend */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Downtime Trend (Last 7 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.downtimeTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="downtime"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        {/* Failure Rate by Type */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Failure Rate by Machine Type</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(analytics?.failureRateByType || {}).map(([name, value]) => ({ name, value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      {/* Machine Stats */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Machine Status Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics?.machineStats?.total || 0}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total</p>
          </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-3xl font-bold text-green-400">{analytics?.machineStats?.healthy || 0}</p>
              <p className="text-sm text-green-400 mt-1">Healthy</p>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-3xl font-bold text-yellow-400">{analytics?.machineStats?.warning || 0}</p>
              <p className="text-sm text-yellow-400 mt-1">Warning</p>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-3xl font-bold text-red-400">{analytics?.machineStats?.critical || 0}</p>
              <p className="text-sm text-red-400 mt-1">Critical</p>
            </div>
            <div className="text-center p-4 bg-slate-500/10 rounded-lg border border-slate-500/20">
              <p className="text-3xl font-bold text-slate-400">{analytics?.machineStats?.offline || 0}</p>
              <p className="text-sm text-slate-400 mt-1">Offline</p>
            </div>
          </div>
        </div>
      </div>
  );
}
