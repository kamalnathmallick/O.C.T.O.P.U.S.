'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/api';
import { Users, Plus, Search, MoreVertical, Trash2, RotateCcw } from 'lucide-react';

export default function UsersPage() {
  const { accessToken, user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [operatorNumbers, setOperatorNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (accessToken && currentUser?.role === 'ADMIN') {
      loadData();
    }
  }, [accessToken, currentUser]);

  const loadData = async () => {
    try {
      const [usersData, numbersData] = await Promise.all([
        userService.getUsers(accessToken!),
        userService.getOperatorNumbers(accessToken!),
      ]);
      setUsers(usersData);
      setOperatorNumbers(numbersData.filter((n: any) => !n.isAssigned));
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOperator = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await userService.createOperator(accessToken!, {
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
        department: formData.get('department'),
        operatorNumber: formData.get('operatorNumber'),
        machineGroup: formData.get('machineGroup'),
      });
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to create operator:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to disable this user?')) return;
    
    try {
      await userService.deleteUser(accessToken!, id);
      loadData();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    
    try {
      await userService.resetPassword(accessToken!, id, newPassword);
      alert('Password reset successfully');
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="space-y-6 w-full max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage operators and administrators</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Operator
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Users table */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 px-6 py-3">User</th>
                <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 px-6 py-3">Role</th>
                <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 px-6 py-3">Department</th>
                <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 px-6 py-3">Machine Group</th>
                <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 px-6 py-3">Status</th>
                <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 px-6 py-3">Last Login</th>
                <th className="text-left text-sm font-medium text-slate-600 dark:text-slate-400 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {user.machineGroup || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                        title="Reset Password"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Disable User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No users found</p>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Create Operator</h2>
              <form onSubmit={handleCreateOperator} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                  <input
                    name="name"
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    placeholder="Operator name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    placeholder="operator@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    placeholder="Initial password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Operator Number</label>
                  <select
                    name="operatorNumber"
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">Select operator number</option>
                    {operatorNumbers.map((num) => (
                      <option key={num.id} value={num.number}>{num.number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input
                    name="department"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    placeholder="Department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Machine Group</label>
                  <input
                    name="machineGroup"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    placeholder="Machine group"
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
