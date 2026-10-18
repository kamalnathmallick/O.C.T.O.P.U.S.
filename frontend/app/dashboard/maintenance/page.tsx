'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { maintenanceService, machineService } from '@/services/api';
import { Wrench, Plus, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function MaintenancePage() {
  const { accessToken, user } = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (accessToken) {
      loadData();
    }
  }, [accessToken]);

  const loadData = async () => {
    try {
      const [tasksData, machinesData] = await Promise.all([
        maintenanceService.getTasks(accessToken!),
        machineService.getMachines(accessToken!),
      ]);
      setTasks(tasksData);
      setMachines(machinesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await maintenanceService.createTask(accessToken!, {
        machineId: formData.get('machineId'),
        title: formData.get('title'),
        description: formData.get('description'),
        type: formData.get('type'),
        priority: formData.get('priority'),
        scheduledDate: formData.get('scheduledDate'),
      });
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await maintenanceService.updateTask(accessToken!, id, { status });
      loadData();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 dark:text-red-400';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'LOW':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const filteredTasks = tasks.filter((task) => 
    statusFilter === 'all' || task.status === statusFilter
  );

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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage maintenance tasks and work orders</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Tasks list */}
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <Wrench className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{task.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-500">
                      <span>{task.machine?.name}</span>
                      <span>•</span>
                      <span>{task.type}</span>
                      <span>•</span>
                      <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  
                  {task.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors"
                    >
                      Start
                    </button>
                  )}
                  
                  {task.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg text-sm text-white transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>

              {task.scheduledDate && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Scheduled: {new Date(task.scheduledDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No maintenance tasks found</p>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Create Maintenance Task</h2>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Machine</label>
                  <select
                    name="machineId"
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">Select machine</option>
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input
                    name="title"
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    placeholder="Task description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="PREVENTIVE">Preventive</option>
                      <option value="CORRECTIVE">Corrective</option>
                      <option value="PREDICTIVE">Predictive</option>
                      <option value="INSPECTION">Inspection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                    <select
                      name="priority"
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Scheduled Date</label>
                  <input
                    name="scheduledDate"
                    type="date"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-slate-900 dark:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
