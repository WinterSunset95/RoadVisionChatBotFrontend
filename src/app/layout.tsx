import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider, ThemeProvider } from "@/components/providers";
import StoreProvider from "@/lib/redux/StoreProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RoadGPT",
  description: "RoadVision's very own chatbot. A helper for tender documents.",
};

/**
 * The root layout for the entire application.
 * It sets up the HTML structure, fonts, and global context providers.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 antialiased h-[100dvh] w-[100dvw] transition-all`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <StoreProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
