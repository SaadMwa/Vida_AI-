'use client';

import { Bell, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TopHeader() {
  const router = useRouter();
  
  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left side - breadcrumb */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => router.back()}
          className="p-1 hover:bg-gray-100 rounded-md transition"
        >
          ←
        </button>
        <span className="text-sm font-medium text-gray-600">Assignments</span>
      </div>
      
      {/* Right side - user menu */}
      <div className="flex items-center gap-4">
        {/* Bell icon with notification */}
        <button className="relative p-1">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
        
        {/* User profile */}
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
          <span className="text-sm font-medium text-gray-900 hidden sm:inline">John Doe</span>
          <ChevronDown size={16} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
}