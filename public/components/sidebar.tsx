'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Sparkles, LayoutGrid, Users, FileText, Lightbulb, BookOpen, Settings } from 'lucide-react';
import logo from './veda_ai.png';
import avatar from './avtar.jpg';

type NavItemProps = {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: number;
};

function NavItem({ icon: Icon, label, active, badge }: NavItemProps) {
  return (
    <button
      className={`
        w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg
        text-[13.5px] font-medium transition-colors text-left
        ${active
          ? 'bg-gray-100 text-gray-900 font-semibold'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
      `}
    >
      <Icon size={17} className={active ? 'opacity-100' : 'opacity-60'} />
      <span className="flex-1 leading-none">{label}</span>
      {badge !== undefined && (
        <span className="bg-red-500 text-white text-[11px] font-bold px-1.5 py-px rounded-full leading-snug">
          {badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar() {
  const router = useRouter();

  return (
    <aside className="sticky top-0 h-screen w-[260px] shrink-0 bg-white border-r border-gray-200 flex flex-col py-6 shadow-[8px_0_16px_rgba(0,0,0,0.06)]">

<div className="flex items-center gap-2 px-6 mb-8">
  <div
    className="w-10 h-10 shrink-0 overflow-hidden"
    style={{
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #E56820 0%, #7B2D0A 100%)',
    }}
  >
    <img
      src={logo.src}
      alt="VedaAI Logo"
      style={{
        width: '100%',
        height: '70px',
        objectFit: 'cover',
        objectPosition: '50% 75%',
        marginTop: '-3px',
      }}
    />
  </div>
  <span className="text-xl font-bold text-gray-900 tracking-tight">
    VedaAI
  </span>
</div>
      

     {/* CREATE ASSIGNMENT BUTTON */}
<div className="px-4 mb-8">
  <div
    style={{
      background: 'linear-gradient(180deg, #FF7950 0%, #C0350A 100%)',
      borderRadius: '100px',
      padding: '4px',
    }}
  >
    <button
      onClick={() => router.push('/assignments/create')}
      style={{
        width: '100%',
        height: '42px',
        borderRadius: '100px',
        background: '#272727',
        boxShadow: '0px 0px 34.5px 0px #FFFFFF40 inset, 0px -1px 3.5px 0px #B1B1B199 inset',
        gap: '10px',
      }}
      className="w-full flex items-center justify-center text-white text-sm font-semibold transition-colors hover:bg-[#333333]"
    >
      <Sparkles size={16} />
      Create Assignment
    </button>
  </div>
</div>
      {/* NAVIGATION */}
      <nav className="flex-1 px-3 flex flex-col gap-1">
        <NavItem icon={LayoutGrid} label="Home" />
        <NavItem icon={Users}      label="My Groups" />
        <NavItem icon={FileText}   label="Assignments" active badge={10} />
        <NavItem icon={Lightbulb}  label="AI Teacher's Toolkit" />
        <NavItem icon={BookOpen}   label="My Library" badge={37} />
      </nav>

      {/* SETTINGS */}
      <div className="px-3 mt-auto">
        <NavItem icon={Settings} label="Settings" />
      </div>

      {/* PROFILE CARD */}
      <div className="mx-4 mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <Image
            src={avatar}
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
            Delhi Public School
          </p>
          <p className="text-xs text-gray-500 leading-tight mt-0.5 truncate">
            Bokaro Steel City
          </p>
        </div>
      </div>

    </aside>
  );
}