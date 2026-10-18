'use client';

import { useState, useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { Bell, Check, CheckCheck, Trash2, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotificationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
        <Bell className="w-5 h-5" />
      </button>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors group"
      >
        <Bell className="w-5 h-5 group-hover:animate-pulse" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800/95 backdrop-blur-xl sticky top-0 z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Buttons */}
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="flex-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No notifications yet</p>
                  <p className="text-slate-500 text-xs mt-1">
                    You'll see updates here when something happens
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-700/30 transition-colors ${
                        !notification.read ? 'bg-slate-700/20' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg border ${getTypeColor(notification.type)} flex items-center justify-center`}>
                          {getIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-white">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" />
                            )}
                          </div>
                          
                          <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-slate-500">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </span>

                            <div className="flex items-center gap-1">
                              {notification.actionUrl && (
                                <Link
                                  href={notification.actionUrl}
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    setIsOpen(false);
                                  }}
                                  className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-medium rounded transition-colors"
                                >
                                  {notification.actionLabel || 'View'}
                                </Link>
                              )}
                              
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-slate-400 hover:text-white transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-700 bg-slate-800/95 backdrop-blur-xl">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Made with Bob
