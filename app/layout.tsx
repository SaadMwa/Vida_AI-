'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '../public/components/sidebar';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '../components/ui/Tooltip';
import { store } from './store/store';
import { MobileHeader } from '../public/components/MobileHeader';
import { BottomTabBar } from '../public/components/BottomTopbar';
import { FloatingButton } from '../public/components/FloatingButton';
import { Header } from '../public/components/topheader';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
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
            <div className="flex min-h-screen overflow-x-hidden bg-gray-50">
              {/* Sidebar — desktop only */}
              <div className="hidden md:block shrink-0">
                <Sidebar />
              </div>

              {/* Main column — single {children} render */}
              <div className="flex flex-1 flex-col min-w-0 min-h-screen md:bg-gray-50 bg-[#c1c0c083]">
                <div className="hidden md:block shrink-0">
                  <Header />
                </div>
                <div className="md:hidden shrink-0">
                  <MobileHeader />
                </div>

                <main className="flex-1 flex flex-col min-h-0 w-full overflow-x-hidden p-4 md:p-6 pb-24 md:pb-6">
                  <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col min-h-0 min-w-0">
                    {children}
                  </div>
                </main>

                <div className="md:hidden shrink-0">
                  <FloatingButton />
                  <BottomTabBar />
                </div>
              </div>
            </div>
          </TooltipProvider>
        </Provider>
      </body>
    </html>
  );
}
