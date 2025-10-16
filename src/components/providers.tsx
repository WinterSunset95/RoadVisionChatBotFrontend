/**
 * @file Centralized providers for the application (Theme, Toasts, etc.).
 */
'use client';

import { Toaster } from 'sonner';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  // Using 'sonner' for a more modern toast/notification experience
  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

