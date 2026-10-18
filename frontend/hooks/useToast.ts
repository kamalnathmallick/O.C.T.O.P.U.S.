import toast from 'react-hot-toast';
import { useNotificationStore } from '@/store/notificationStore';

export const useToast = () => {
  const { addNotification } = useNotificationStore();

  const showToast = {
    success: (title: string, message: string, options?: {
      actionUrl?: string;
      actionLabel?: string;
      metadata?: any;
      persist?: boolean;
    }) => {
      toast.success(message);
      if (options?.persist !== false) {
        addNotification({
          type: 'success',
          title,
          message,
          actionUrl: options?.actionUrl,
          actionLabel: options?.actionLabel,
          metadata: options?.metadata,
        });
      }
    },

    error: (title: string, message: string, options?: {
      actionUrl?: string;
      actionLabel?: string;
      metadata?: any;
      persist?: boolean;
    }) => {
      toast.error(message);
      if (options?.persist !== false) {
        addNotification({
          type: 'error',
          title,
          message,
          actionUrl: options?.actionUrl,
          actionLabel: options?.actionLabel,
          metadata: options?.metadata,
        });
      }
    },

    warning: (title: string, message: string, options?: {
      actionUrl?: string;
      actionLabel?: string;
      metadata?: any;
      persist?: boolean;
    }) => {
      toast(message, {
        icon: '⚠️',
        style: {
          background: '#1e293b',
          border: '1px solid #f59e0b',
        },
      });
      if (options?.persist !== false) {
        addNotification({
          type: 'warning',
          title,
          message,
          actionUrl: options?.actionUrl,
          actionLabel: options?.actionLabel,
          metadata: options?.metadata,
        });
      }
    },

    info: (title: string, message: string, options?: {
      actionUrl?: string;
      actionLabel?: string;
      metadata?: any;
      persist?: boolean;
    }) => {
      toast(message, {
        icon: 'ℹ️',
        style: {
          background: '#1e293b',
          border: '1px solid #3b82f6',
        },
      });
      if (options?.persist !== false) {
        addNotification({
          type: 'info',
          title,
          message,
          actionUrl: options?.actionUrl,
          actionLabel: options?.actionLabel,
          metadata: options?.metadata,
        });
      }
    },

    loading: (message: string) => {
      return toast.loading(message);
    },

    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ) => {
      return toast.promise(promise, messages);
    },

    dismiss: (toastId?: string) => {
      toast.dismiss(toastId);
    },

    custom: (message: string, options?: any) => {
      toast(message, options);
    },
  };

  return showToast;
};

// Made with Bob
