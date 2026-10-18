'use client';

export default function SettingsPage() {
  return (
      <div className="space-y-6 w-full max-w-full">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Configure system settings</p>
        </div>

        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">System Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
              <input type="text" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" defaultValue="Octopus Industries" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Retention (days)</label>
              <input type="number" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" defaultValue="365" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alert Thresholds</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-500">Critical</label>
                  <input type="number" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" defaultValue="80" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-500">Warning</label>
                  <input type="number" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" defaultValue="60" />
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
  );
}
