'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { sensorService } from '@/services/api';
import { Activity, Search, Filter, Battery, Wifi } from 'lucide-react';

export default function SensorsPage() {
  const { accessToken } = useAuthStore();
  const [sensors, setSensors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (accessToken) {
      loadSensors();
    }
  }, [accessToken]);

  const loadSensors = async () => {
    try {
      const data = await sensorService.getSensors(accessToken!);
      setSensors(data);
    } catch (error) {
      console.error('Failed to load sensors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'temperature':
        return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400';
      case 'vibration':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'pressure':
        return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400';
      case 'current':
        return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'acoustic':
        return 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-slate-500/20 text-gray-700 dark:text-slate-400';
    }
  };

  const filteredSensors = sensors.filter((sensor) =>
    typeFilter === 'all' || sensor.type === typeFilter
  );

  const sensorTypes = [...new Set(sensors.map((s) => s.type))];

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sensors</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Monitor sensor status and readings</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Types</option>
          {sensorTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Sensors grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSensors.map((sensor) => (
          <div
            key={sensor.id}
            className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                  <Activity className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{sensor.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{sensor.machine?.name}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(sensor.type)}`}>
                {sensor.type}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">Unit</span>
                <span className="text-sm text-gray-900 dark:text-white font-medium">{sensor.unit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">Threshold</span>
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {sensor.thresholdMin} - {sensor.thresholdMax}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">Status</span>
                <div className="flex items-center gap-2">
                  {sensor.isActive ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                      <span className="text-sm text-gray-500 dark:text-slate-500">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              {sensor.batteryLevel !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Battery</span>
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-gray-600 dark:text-slate-400" />
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{sensor.batteryLevel}%</span>
                  </div>
                </div>
              )}
            </div>

            {sensor.readings && sensor.readings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-slate-500 mb-2">Latest Reading</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {sensor.readings[0]?.value} {sensor.unit}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-500">
                  {new Date(sensor.readings[0]?.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSensors.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">No sensors found</p>
        </div>
      )}
    </div>
  );
}