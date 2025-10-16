/**
 * @file A custom hook that provides a consistent interface for showing toast notifications.
 * This acts as an adapter for the 'sonner' toast library, allowing us to easily
 * swap out the underlying notification system in the future without refactoring components.
 */
'use client';

import { toast } from 'sonner';

// Defines the types of toasts our application can show.
type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default';

export const useToasts = () => {
  /**
   * Displays a toast notification.
   * @param type - The style of the toast ('success', 'error', etc.).
   * @param title - The main heading for the toast.
   * @param message - An optional, more detailed description.
   */
  const addToast = (
    type: ToastType,
    title: string,
    message?: string
  ) => {
    // Map our internal toast types to the corresponding functions from the 'sonner' library.
    const toastFunction = {
      success: toast.success,
      error: toast.error,
      info: toast.info,
      warning: toast.warning,
      default: toast,
    }[type];
    
    // Call the selected sonner function with the provided title and description.
    toastFunction(title, {
      description: message,
    });
  };

  return { addToast };
};

