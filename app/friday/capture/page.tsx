import type { Metadata } from 'next';
import { CaptureTool } from '@/components/friday/CaptureTool';

// Authoring tool for the /friday easter egg. Hidden, noindex'd, not linked.
export const metadata: Metadata = {
  title: 'friday capture',
  robots: { index: false, follow: false },
};

export default function FridayCapturePage() {
  return <CaptureTool />;
}
