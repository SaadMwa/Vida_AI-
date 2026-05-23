'use client';

import { ArrowLeft, Bell, ChevronDown, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import avatar from './avtar.jpg';
export function Header() {
  const router = useRouter();

  return (
    <header className="mt-4 mx-4 mb-2 h-14 bg-white border border-gray-200 rounded-2xl px-6 sm:px-8 flex items-center justify-between shrink-0 z-10 shadow-sm max-w-full">

      {/* Left — back arrow + breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-gray-100 rounded-md transition"
        >
          <ArrowLeft size={16} className="text-black" />
        </button>
        <LayoutGrid size={14} className="text-black" />
        <span className="text-sm font-medium text-gray-600">Assignments</span>
      </div>

      {/* Right — bell + user */}
      <div className="flex items-center gap-4">

        {/* Bell */}
        <button className="relative p-1">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={avatar}
              alt="John Doe"
              width={32}
              height={32}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900 hidden sm:inline">
            John Doe
          </span>
          <ChevronDown size={16} className="text-gray-500" />
        </div>

      </div>
    </header>
  );
}