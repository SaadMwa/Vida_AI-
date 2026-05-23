'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export function FloatingButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/assignments/create')}
      className="fixed z-40 w-12 h-12 bg-white rounded-full flex items-center justify-center"
      style={{
        bottom: '90px',
        right: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}
    >
      <Plus size={22} className="text-accent" />
    </button>
  );
}
