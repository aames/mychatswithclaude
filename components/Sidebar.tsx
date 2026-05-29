'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ChatMeta } from '@/lib/chats';
import { useSidebar } from './SidebarContext';
import { ClaudeLogo } from './ClaudeLogo';
import {
  NewChatIcon,
  SearchIcon,
  ChatsIcon,
  ProjectsIcon,
  ArtifactsIcon,
  CustomizeIcon,
  CodeIcon,
  DesignIcon,
  CollapseIcon,
  CaretUpDown,
  DownloadIcon,
  SortIcon,
} from './Icons';

export function Sidebar({ chats }: { chats: ChatMeta[] }) {
  const pathname = usePathname();
  const { desktopHidden, mobileOpen, close, closeOnMobile, animal } = useSidebar();
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const activeSlug = pathname?.startsWith('/chats/')
    ? pathname.replace('/chats/', '')
    : undefined;

  const sortedChats = useMemo(() => {
    const copy = [...chats];
    copy.sort((a, b) => {
      // Sort by date, then by title as a tiebreaker so chats with the same
      // date still reorder when sort direction flips.
      const aKey = `${a.date}|${a.title}`;
      const bKey = `${b.date}|${b.title}`;
      if (aKey === bKey) return 0;
      if (sortDir === 'desc') return aKey < bKey ? 1 : -1;
      return aKey < bKey ? -1 : 1;
    });
    return copy;
  }, [chats, sortDir]);

  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={closeOnMobile}
        className={[
          'md:hidden fixed inset-0 z-30 bg-ink/30 transition-opacity duration-200',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      <aside
        className={[
          'flex flex-col w-64 h-screen border-r border-rule bg-sidebar text-[13px]',
          // Mobile: drawer overlay sliding from the left
          'fixed inset-y-0 left-0 z-40 transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: in-flow sticky sidebar (overrides mobile fixed positioning)
          desktopHidden
            ? 'md:hidden'
            : 'md:sticky md:top-0 md:translate-x-0 md:transition-none md:z-auto',
        ].join(' ')}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <Link
            href="/"
            onClick={closeOnMobile}
            className="flex items-center gap-1.5"
          >
            <ClaudeWordmark />
          </Link>
          <button
            type="button"
            onClick={close}
            className="text-ink/50 hover:text-ink/80 p-1 rounded"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <CollapseIcon />
          </button>
        </div>

        {/* Primary nav */}
        <nav className="px-2 pt-1 pb-2 space-y-0.5">
          <NavItem href="/" icon={<NewChatIcon />} label="New chat" exact />
          <NavItem href="/search" icon={<SearchIcon />} label="Search" disabled />
          <NavItem href="/chats" icon={<ChatsIcon />} label="Chats" />
          <NavItem href="/projects" icon={<ProjectsIcon />} label="Projects" disabled />
          <NavItem href="/artifacts" icon={<ArtifactsIcon />} label="Artifacts" disabled />
          <NavItem href="/customize" icon={<CustomizeIcon />} label="Customize" disabled />
        </nav>

        {/* Products section */}
        <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider text-muted">
          Products
        </div>
        <nav className="px-2 pb-2 space-y-0.5">
          <NavItem href="/code" icon={<CodeIcon />} label="Code" disabled />
          <NavItem
            href="/design"
            icon={<DesignIcon />}
            label="Design"
            trailing={<CaretUpDown className="w-3 h-3 text-ink/40" />}
            disabled
          />
        </nav>

        {/* Recents section */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-[11px] uppercase tracking-wider text-muted">
            Recents
          </span>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
            className="text-ink/40 hover:text-ink/70 p-1 rounded transition-transform"
            title={sortDir === 'desc' ? 'Newest first (click for oldest)' : 'Oldest first (click for newest)'}
            aria-label="Toggle sort order"
            style={{ transform: sortDir === 'asc' ? 'rotate(180deg)' : undefined }}
          >
            <SortIcon />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-2">
          {sortedChats.length === 0 && (
            <p className="px-3 py-2 text-muted">No chats yet.</p>
          )}
          <ul>
            {sortedChats.map((c) => {
              const active = c.slug === activeSlug;
              return (
                <li key={c.slug}>
                  <Link
                    href={`/chats/${c.slug}`}
                    onClick={closeOnMobile}
                    className={[
                      'block rounded-md px-3 py-1.5 leading-snug truncate',
                      active
                        ? 'bg-rule text-ink'
                        : 'text-ink/85 hover:bg-rule/70',
                    ].join(' ')}
                    title={c.title}
                  >
                    {c.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile chip */}
        <Link
          href="/settings"
          onClick={closeOnMobile}
          className="flex items-center gap-2 px-3 py-2.5 border-t border-rule hover:bg-rule/40"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-clay text-paper text-xs font-medium"
          >
            {animal[0]}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-ink leading-tight truncate">
              Anonymous {animal}
            </span>
            <span className="block text-[11px] text-muted leading-tight truncate">
              Personal
            </span>
          </span>
          <span className="text-ink/40 flex items-center gap-1">
            <DownloadIcon className="w-3.5 h-3.5" />
            <CaretUpDown className="w-3 h-3" />
          </span>
        </Link>
      </aside>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  trailing,
  exact = false,
  disabled = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  exact?: boolean;
  disabled?: boolean;
}) {
  const pathname = usePathname();
  const { closeOnMobile } = useSidebar();
  const active = exact ? pathname === href : pathname?.startsWith(href);

  const classes = [
    'flex items-center gap-2.5 rounded-md px-3 py-1.5 leading-snug',
    disabled
      ? 'text-ink/40 cursor-not-allowed'
      : active
      ? 'bg-rule text-ink'
      : 'text-ink/85 hover:bg-rule/70',
  ].join(' ');

  if (disabled) {
    return (
      <div className={classes} title="Not available in this archive">
        <span className="text-ink/50">{icon}</span>
        <span className="flex-1">{label}</span>
        {trailing}
      </div>
    );
  }

  return (
    <Link href={href} onClick={closeOnMobile} className={classes}>
      <span className="text-ink/70">{icon}</span>
      <span className="flex-1">{label}</span>
      {trailing}
    </Link>
  );
}

function ClaudeWordmark() {
  return (
    <span className="flex items-center gap-1.5 font-serif text-base text-ink leading-none">
      <ClaudeLogo className="w-5 h-5 text-clay" />
      Claude
    </span>
  );
}
