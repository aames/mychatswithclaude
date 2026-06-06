import type { Metadata } from 'next';
import { BirthdayPlayer } from '@/components/birthday/BirthdayPlayer';

// Hidden easter egg. Not linked from anywhere, kept out of the sitemap, and
// noindex'd so it doesn't show up in search — you find it only via the link.
export const metadata: Metadata = {
  title: 'Happy Birthday',
  robots: { index: false, follow: false },
  alternates: { canonical: undefined },
};

export default function BirthdayPage() {
  return <BirthdayPlayer />;
}
