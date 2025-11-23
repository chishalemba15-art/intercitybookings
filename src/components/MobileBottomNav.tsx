'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-40 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-4">
        <NavButton
          icon="🏠"
          label="Home"
          href="/"
          active={pathname === '/'}
        />
        <NavButton
          icon="🔍"
          label="Search"
          href="/#search"
          active={false}
        />
        <NavButton
          icon="🎫"
          label="Bookings"
          href="/?bookings=true"
          active={false}
        />
        <NavButton
          icon="👤"
          label="Profile"
          href="/profile"
          active={pathname === '/profile'}
        />
      </div>
    </div>
  );
}

function NavButton({ icon, label, href, active }: {
  icon: string;
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 transition-colors min-w-[60px] ${
        active ? 'text-blue-600' : 'text-slate-600'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
