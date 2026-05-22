'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, LayoutGrid, Users, FileText, Lightbulb, BookOpen, Settings } from 'lucide-react';

// ── NAV ITEM COMPONENT (defined FIRST) ────────────────────
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

// ── SCHOOL AVATAR ─────────────────────────────────────────
function SchoolAvatar() {
  return (
    <svg viewBox="0 0 38 38" fill="none" className="w-full h-full">
      <rect width="38" height="38" fill="#f0e0c8" rx="19" />
      <ellipse cx="19" cy="26" rx="10" ry="8" fill="#e8c9a0" />
      <circle cx="19" cy="15" r="6" fill="#d4a07a" />
      <ellipse cx="16.5" cy="14" rx="1.2" ry="1.5" fill="#3d2b1f" />
      <ellipse cx="21.5" cy="14" rx="1.2" ry="1.5" fill="#3d2b1f" />
      <path d="M16.5 17.5 Q19 19.5 21.5 17.5" stroke="#3d2b1f" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M12 12 Q13 9 16 9.5 Q17 8 19 8 Q21 8 22 9.5 Q25 9 26 12 Q23 10.5 19 10.5 Q15 10.5 12 12z" fill="#5c3d2e" />
      <rect x="14" y="23" width="10" height="15" rx="3" fill="#4a90e2" />
      <rect x="9"  y="23" width="5"  height="11" rx="2" fill="#4a90e2" />
      <rect x="24" y="23" width="5"  height="11" rx="2" fill="#4a90e2" />
    </svg>
  );
}

// ── MAIN SIDEBAR COMPONENT ────────────────────────────────
export function Sidebar() {
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[192px] bg-white border-r border-gray-100 flex flex-col py-4">

      {/* LOGO */}
      <div className="flex items-center gap-2 px-4 mb-5">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">V</span>
        </div>
        <span className="text-[17px] font-bold text-gray-900 tracking-tight">
          VedaAI
        </span>
      </div>

      {/* CREATE ASSIGNMENT BUTTON */}
      <div className="px-3 mb-5">
        <button 
          onClick={() => router.push('/assignments/create')}
          className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-[13.5px] font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles size={14} />
          Create Assignment
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        <NavItem icon={LayoutGrid} label="Home" />
        <NavItem icon={Users}      label="My Groups" />
        <NavItem icon={FileText}   label="Assignments" active badge={10} />
        <NavItem icon={Lightbulb}  label="AI Teacher's Toolkit" />
        <NavItem icon={BookOpen}   label="My Library" />
      </nav>

      {/* DIVIDER */}
      <div className="mx-4 my-2 h-px bg-gray-100" />

      {/* SETTINGS */}
      <div className="px-2">
        <NavItem icon={Settings} label="Settings" />
      </div>

      {/* PROFILE CARD */}
      <div className="mx-3 mt-2 p-2.5 border border-gray-100 rounded-xl flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-orange-100 bg-amber-50 flex items-end justify-center">
          <SchoolAvatar />
        </div>
        <div className="min-w-0">
          <p className="text-[12.5px] font-bold text-gray-900 leading-tight truncate">
            Delhi Public School
          </p>
          <p className="text-[11px] text-gray-500 leading-tight mt-0.5 truncate">
            Bokaro Steel City
          </p>
        </div>
      </div>

    </aside>
  );
}