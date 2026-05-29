import { notFound } from 'next/navigation';
import { ChatView } from '@/components/ChatView';
import { Footer } from '@/components/Footer';
import { getAllChatMeta, getChat } from '@/lib/chats';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllChatMeta().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const chat = getChat(slug);
  if (!chat) return {};
  return {
    title: `${chat.title} — My Chats With Claude`,
    description: chat.summary,
  };
}

export default async function ChatPage({ params }: { params: Params }) {
  const { slug } = await params;
  const chat = getChat(slug);
  if (!chat) notFound();
  return (
    <>
      <ChatView chat={chat} />
      <Footer />
    </>
  );
}
