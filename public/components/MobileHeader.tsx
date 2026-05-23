'use client';

import Image from 'next/image';
import { Bell, Menu } from 'lucide-react';
import logo from './veda_ai.png';
import avatar from './avatar.jpg';

export function MobileHeader() {
  return (
    <header
      className="mx-2 mt-4 mb-2 bg-white flex items-center justify-between gap-3 max-w-full"
      style={{
        height: '60px',
        paddingLeft: '20px',
        paddingRight: '20px',
        boxShadow: '0 7px 10px rgba(0,0,0,0.08)',
        borderRadius: '12px',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 shrink-0 overflow-hidden"
          style={{
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #E56820 0%, #7B2D0A 100%)',
          }}
        >
          <img
            src={logo.src}
            alt="VedaAI"
            style={{
              width: '100%',
              height: '60px',
              objectFit: 'cover',
              objectPosition: '50% 75%',
              marginTop: '-1px',
              backgroundColor: 'black',
            }}
          />
        </div>
        <span className="text-base font-bold text-gray-900 tracking-tight">
          VedaAI
        </span>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <button className="relative p-1">
          <Bell size={20} className="text-gray-700" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
          <Image
            src={avatar}
            alt="Profile"
            width={32}
            height={32}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Hamburger */}
        <button className="p-1">
          <Menu size={22} className="text-gray-700" />
        </button>
      </div>
    </header>
  );
}
