import { Footer } from '@/components/Footer';
import { Greeting } from '@/components/Greeting';
import { getAllChatMeta } from '@/lib/chats';

export default function Home() {
  const chats = getAllChatMeta();
  return (
    <>
      <Greeting chats={chats} />
      <Footer />
    </>
  );
}
