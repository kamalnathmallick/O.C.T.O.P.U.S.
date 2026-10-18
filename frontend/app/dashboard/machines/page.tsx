'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { machineService } from '@/services/api';
import { Cpu, Search, Filter, Plus, MoreVertical, CheckCircle, AlertTriangle, XCircle, Minus } from 'lucide-react';

export default function MachinesPage() {
  const { accessToken } = useAuthStore();
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (accessToken) {
      loadMachines();
    }
  }, [accessToken]);

  const loadMachines = async () => {
    try {
      const data = await machineService.getMachines(accessToken!);
      setMachines(data);
    } catch (error) {
      console.error('Failed to load machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'CRITICAL':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500 dark:text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400';
      case 'WARNING':
        return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'CRITICAL':
        return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-slate-500/20 text-gray-700 dark:text-slate-400';
    }
  };

  const filteredMachines = machines.filter((machine) => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Machines</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Manage and monitor your equipment</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search machines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Status</option>
          <option value="HEALTHY">Healthy</option>
          <option value="WARNING">Warning</option>
          <option value="CRITICAL">Critical</option>
          <option value="OFFLINE">Offline</option>
        </select>
      </div>

      {/* Machines grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMachines.map((machine) => (
          <div
            key={machine.id}
            className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-5 hover:border-gray-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{machine.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{machine.type}</p>
                </div>
              </div>
              <button className="p-1 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">Status</span>
                <div className={`flex items-center gap-2 px-2 py-1 rounded ${getStatusColor(machine.status)}`}>
                  {getStatusIcon(machine.status)}
                  <span className="text-sm font-medium">{machine.status}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Health Score</span>
                  <span className={`text-sm font-medium ${
                    machine.healthScore >= 80 ? 'text-green-600 dark:text-green-400' :
                    machine.healthScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {machine.healthScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      machine.healthScore >= 80 ? 'bg-green-500' :
                      machine.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${machine.healthScore}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-500">Location</p>
                  <p className="text-sm text-gray-900 dark:text-white">{machine.location || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-500">Department</p>
                  <p className="text-sm text-gray-900 dark:text-white">{machine.department || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMachines.length === 0 && (
        <div className="text-center py-12">
          <Cpu className="w-12 h-12 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">No machines found</p>
        </div>
      )}
    </div>
  );
}