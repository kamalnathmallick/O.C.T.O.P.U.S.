'use client';

import { Bell, MessageSquare, Mail } from 'lucide-react';

export default function NotificationsPage() {
  return (
      <div className="space-y-6 w-full max-w-full">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your notification preferences</p>
        </div>

        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 space-y-4 shadow-sm">
          {[
            { icon: Bell, title: 'Alert Notifications', desc: 'Receive alerts for critical events' },
            { icon: MessageSquare, title: 'Maintenance Reminders', desc: 'Get notified about upcoming maintenance' },
            { icon: Mail, title: 'Email Notifications', desc: 'Receive email summaries' },
          ].map((item) => (
            <div key={item.title} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-4">
                <item.icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
  );
}
