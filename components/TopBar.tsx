import Link from 'next/link';
import { GearIcon } from './Icons';

export function TopBar() {
  return (
    <div className="flex items-center justify-end px-4 sm:px-6 py-3">
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
