'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { alertService } from '@/services/api';
import { AlertTriangle, Search, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function AlertsPage() {
  const { accessToken } = useAuthStore();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    if (accessToken) {
      loadAlerts();
    }
  }, [accessToken]);

  const loadAlerts = async () => {
    try {
      const data = await alertService.getAlerts(accessToken!);
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await alertService.acknowledgeAlert(accessToken!, id);
      loadAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await alertService.resolveAlert(accessToken!, id);
      loadAlerts();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'WARNING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Alerts</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor and manage system alerts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="WARNING">Warning</option>
          <option value="INFO">Info</option>
        </select>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white dark:bg-slate-800/50 rounded-xl border p-5 shadow-sm ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{alert.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{alert.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-500">
                    <span>{alert.machine?.name}</span>
                    <span>•</span>
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    {alert.sensorType && (
                      <>
                        <span>•</span>
                        <span>{alert.sensorType}: {alert.value}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  alert.status === 'ACTIVE' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                  alert.status === 'ACKNOWLEDGED' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                  'bg-green-500/20 text-green-600 dark:text-green-400'
                }`}>
                  {alert.status}
                </span>
                
                {alert.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-sm text-slate-900 dark:text-white transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
                
                {alert.status === 'ACKNOWLEDGED' && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg text-sm text-white transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>

            {alert.acknowledgedByUser && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Acknowledged by {alert.acknowledgedByUser.name} on{' '}
                  {new Date(alert.acknowledgedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No alerts found</p>
        </div>
      )}
    </div>
  );
}