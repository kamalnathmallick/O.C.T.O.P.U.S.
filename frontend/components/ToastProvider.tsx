'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 5000,
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        },
        // Success
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            background: '#1e293b',
            border: '1px solid #10b981',
          },
        },
        // Error
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: '#1e293b',
            border: '1px solid #ef4444',
          },
        },
        // Loading
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

// Made with Bob
