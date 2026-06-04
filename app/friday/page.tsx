import type { Metadata } from 'next';
import { FridayPlayer } from '@/components/friday/FridayPlayer';

// Hidden easter egg. Not linked from anywhere, kept out of the sitemap, and
// noindex'd so it doesn't show up in search — you find it only via the link.
export const metadata: Metadata = {
  title: "It's Friday",
  robots: { index: false, follow: false },
  alternates: { canonical: undefined },
};

export default function FridayPage() {
  return <FridayPlayer />;
}
