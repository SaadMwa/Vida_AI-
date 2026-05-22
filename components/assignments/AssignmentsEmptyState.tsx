'use client';

import { useRouter } from 'next/navigation';

export function AssignmentsEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-48 h-48 mb-6 relative">
        <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" aria-hidden="true">
          <circle cx="100" cy="100" r="80" fill="#F3F4F6" />
          <rect
            x="70"
            y="80"
            width="60"
            height="70"
            rx="4"
            fill="white"
            stroke="#D1D5DB"
            strokeWidth="2"
          />
          <line x1="80" y1="95" x2="120" y2="95" stroke="#D1D5DB" strokeWidth="2" />
          <line x1="80" y1="105" x2="110" y2="105" stroke="#D1D5DB" strokeWidth="2" />
          <line x1="80" y1="115" x2="115" y2="115" stroke="#D1D5DB" strokeWidth="2" />
          <circle cx="130" cy="60" r="20" fill="white" stroke="#9CA3AF" strokeWidth="2" />
          <line
            x1="143"
            y1="73"
            x2="155"
            y2="85"
            stroke="#9CA3AF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="125" cy="55" r="6" fill="#EF4444" />
          <line x1="122" y1="52" x2="128" y2="58" stroke="white" strokeWidth="1.5" />
          <line x1="128" y1="52" x2="122" y2="58" stroke="white" strokeWidth="1.5" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments yet</h3>
      <p className="text-gray-500 max-w-sm">
        Create your first assignment and let AI generate questions for you
      </p>
      <button
        type="button"
        onClick={() => router.push('/assignments/create')}
        className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition"
      >
        + Create Your First Assignment
      </button>
    </div>
  );
}
