'use client';

import { BookOpen, Video, MessageCircle } from 'lucide-react';

export default function HelpPage() {
  return (
      <div className="space-y-6 w-full max-w-full">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Help & Support</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Get help with the platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Documentation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Read the full documentation and user guides</p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <Video className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Video Tutorials</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Watch video tutorials to learn the platform</p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <MessageCircle className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Contact Support</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Reach out to our support team for help</p>
          </div>
        </div>
      </div>
  );
}
