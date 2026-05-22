'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "../public/components/sidebar";
import { TopHeader } from "../public/components/topheader";
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '../components/ui/Tooltip';
import { store } from './store/store';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <Provider store={store}>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#363636', color: '#fff', borderRadius: '12px' },
              success: {
                duration: 3000,
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                duration: 4000,
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
          <TooltipProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-[192px]">
              <TopHeader />
              <main className="p-6">
                {children}
              </main>
            </div>
          </div>
          </TooltipProvider>
        </Provider>
      </body>
    </html>
  );
}