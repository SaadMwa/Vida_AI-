'use client';

import { LayoutGrid, FileText, BookOpen, Sparkles } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { icon: LayoutGrid, label: 'Home',        href: '/' },
    { icon: FileText,   label: 'Assignments', href: '/assignments' },
    { icon: BookOpen,   label: 'Library',     href: '/library' },
    { icon: Sparkles,   label: 'AI Toolkit',  href: '/toolkit' },
  ];

  return (
    <nav
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around px-4"
      style={{
        height: '64px',
        background: '#1C1C1E',
        borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      }}
    >
      {tabs.map(({ icon: Icon, label, href }) => {
        const active = pathname === href || pathname.startsWith(href === '/' ? '/home' : href);

        return (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="flex flex-col items-center justify-center gap-1"
            style={{ minWidth: '60px' }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: '40px',
                height: '28px',
                borderRadius: '9999px',
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                transition: 'background 200ms',
              }}
            >
              <Icon
                size={20}
                color={active ? '#FFFFFF' : '#6B7280'}
                strokeWidth={active ? 2.5 : 1.8}
              />
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: active ? 600 : 400,
                color: active ? '#FFFFFF' : '#6B7280',
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}