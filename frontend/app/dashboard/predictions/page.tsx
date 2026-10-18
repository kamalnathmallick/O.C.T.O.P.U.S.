'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { predictionService } from '@/services/api';
import { BarChart3, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
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
} from 'recharts';

export default function PredictionsPage() {
  const { accessToken } = useAuthStore();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      loadData();
    }
  }, [accessToken]);

  const loadData = async () => {
    try {
      const [predictionsData, statsData] = await Promise.all([
        predictionService.getPredictions(accessToken!),
        predictionService.getPredictionStats(accessToken!),
      ]);
      setPredictions(predictionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600 dark:text-green-400';
    if (score < 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400';
      case 'WARNING':
        return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'CRITICAL':
        return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400';
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Predictions</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">AI-powered failure predictions and RUL estimates</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Normal</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.normal || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Warning</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.warning || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Critical</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.critical || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg RUL</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(stats?.avgRUL || 0)} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Predictions table */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Machine Predictions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 pb-3">Machine</th>
                  <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 pb-3">Status</th>
                  <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 pb-3">Failure Prob.</th>
                  <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 pb-3">RUL</th>
                  <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 pb-3">Risk Score</th>
                  <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 pb-3">Confidence</th>
                  <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 pb-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {predictions.slice(0, 20).map((pred) => (
                  <tr key={pred.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{pred.machine?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">{pred.machine?.type}</p>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(pred.status)}`}>
                        {pred.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pred.failureProbability > 0.7
                                ? 'bg-red-500'
                                : pred.failureProbability > 0.3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${pred.failureProbability * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {(pred.failureProbability * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-sm ${getRiskColor(pred.rul || 100)}`}>
                        {pred.rul || 365} days
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-sm font-medium ${getRiskColor(pred.riskScore)}`}>
                        {pred.riskScore}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-700 dark:text-slate-300">
                      {(pred.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(pred.predictionDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {predictions.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No predictions available</p>
            </div>
          )}
        </div>
      </div>
  );
}
