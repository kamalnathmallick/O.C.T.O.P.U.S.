'use client';

export default function ReportsPage() {
  return (
      <div className="space-y-6 w-full max-w-full">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Generate and export maintenance reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Maintenance Report', 'Failure Report', 'Health Report', 'Compliance Report'].map((report) => (
            <div key={report} className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{report}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Generate and download {report.toLowerCase()}</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors">
                  PDF
                </button>
                <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-sm text-slate-900 dark:text-white transition-colors">
                  CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}
