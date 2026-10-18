'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { systemService } from '@/services/api';
import { Server, Database, Cpu, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function SystemHealthPage() {
  const { accessToken, user: currentUser } = useAuthStore();
  const [health, setHealth] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken && currentUser?.role === 'ADMIN') {
      loadData();
    }
  }, [accessToken, currentUser]);

  const loadData = async () => {
    try {
      const [healthData, logsData] = await Promise.all([
        systemService.getSystemHealth(accessToken!),
        systemService.getSystemLogs(accessToken!),
      ]);
      setHealth(healthData);
      setLogs(logsData.slice(0, 20));
    } catch (error) {
      console.error('Failed to load system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseLogDetails = (details: string | null) => {
    if (!details) return 'N/A';
    try {
      const parsed = JSON.parse(details);
      return parsed.email || details;
    } catch {
      return details;
    }
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Access denied. Admin only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Health</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor system components and status</p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Server className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">API Server</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">Healthy</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Response: {health?.components?.api?.responseTime}ms
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Database className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Database</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">Connected</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {health?.components?.database?.connectionPool}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">AI Model</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">Active</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  v{health?.components?.aiModel?.version}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{health?.metrics?.totalUsers || 0}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Users</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{health?.metrics?.activeUsers || 0}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Active Users</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{health?.metrics?.totalMachines || 0}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Machines</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{health?.metrics?.totalSensors || 0}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Sensors</p>
            </div>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent System Logs</h3>
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-500 dark:text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">{log.action}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {log.entityType} • {parseLogDetails(log.details)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-500">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          {logs.length === 0 && (
            <p className="text-center text-slate-600 dark:text-slate-400 py-4">No recent logs</p>
          )}
      </div>
    </div>
  );
}
