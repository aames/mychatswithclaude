'use client';

import Link from 'next/link';
import { CollapseIcon, GearIcon } from './Icons';
import { useSidebar } from './SidebarContext';

export function TopBar() {
  const { desktopHidden, mobileOpen, open } = useSidebar();

  return (
    <div className="flex items-center justify-between px-2 sm:px-4 py-2">
      <button
        type="button"
        onClick={open}
        title="Open sidebar"
        aria-label="Open sidebar"
        className={[
          'p-2 rounded-md text-ink/60 hover:text-ink hover:bg-rule/60',
          // Mobile: show unless drawer is open
          mobileOpen ? 'hidden' : 'flex',
          // Desktop: only show when sidebar is hidden
          desktopHidden ? 'md:flex' : 'md:hidden',
        ].join(' ')}
      >
        <CollapseIcon className="w-5 h-5" />
      </button>
      <div className="flex-1" />
      <Link
        href="/settings"
        className="text-ink/60 hover:text-ink p-2 rounded-full hover:bg-rule/60"
        title="Settings"
        aria-label="Settings"
      >
        <GearIcon className="w-5 h-5" />
      </Link>
    </div>
  );
}
