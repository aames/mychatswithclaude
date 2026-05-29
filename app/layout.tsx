import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';
import { getAllChatMeta } from '@/lib/chats';

export const metadata: Metadata = {
  title: 'My Chats With Claude',
  description:
    'An unofficial fan archive of funny, weird, and occasionally useful conversations with Claude.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chats = getAllChatMeta();
  return (
    <html lang="en">
      <body className="bg-paper text-ink">
        <div className="flex min-h-screen">
          <Sidebar chats={chats} />
          <main className="flex-1 min-w-0 flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
