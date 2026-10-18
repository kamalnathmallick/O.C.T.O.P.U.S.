'use client';

import { Headphones, MessageCircle, Mail } from 'lucide-react';

export default function SupportPage() {
  return (
      <div className="space-y-6 w-full max-w-full">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Get technical support</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <Headphones className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Phone Support</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Call us at: +1 (555) 123-4567</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">Mon-Fri 9am-6pm EST</p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <MessageCircle className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Live Chat</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Chat with our support team</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors">
              Start Chat
            </button>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm">
            <Mail className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Email Support</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">support@octopus.com</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">Response within 24 hours</p>
          </div>
        </div>
      </div>
  );
}
