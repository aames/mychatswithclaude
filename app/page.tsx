import { Footer } from '@/components/Footer';
import { Greeting } from '@/components/Greeting';
import { TopBar } from '@/components/TopBar';
import { getAllChatMeta } from '@/lib/chats';

export default function Home() {
  const chats = getAllChatMeta();
  return (
    <>
      <TopBar />
      <Greeting chats={chats} />
      <Footer />
    </>
  );
}
