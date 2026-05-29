import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { TopBar } from '@/components/TopBar';
import { getAllChatMeta } from '@/lib/chats';

export default function ChatsIndex() {
  const chats = getAllChatMeta();
  return (
    <>
      <TopBar />
      <div className="flex-1 px-4 sm:px-8 pb-16">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="font-serif text-3xl text-ink mb-2">Your chats</h1>
          <p className="text-ink/60 mb-8">
            {chats.length} conversation{chats.length === 1 ? '' : 's'}
          </p>

          <div className="space-y-2">
            {chats.map((c) => (
              <Link
                key={c.slug}
                href={`/chats/${c.slug}`}
                className="block rounded-xl border border-rule bg-cream hover:bg-rule/40 transition px-5 py-4"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-lg text-ink truncate">
                    {c.title}
                  </h2>
                  {c.date && (
                    <span className="text-xs text-muted shrink-0">
                      {formatDate(c.date)}
                    </span>
                  )}
                </div>
                {c.summary && (
                  <p className="mt-1 text-sm text-ink/70">{c.summary}</p>
                )}
              </Link>
            ))}
            {chats.length === 0 && (
              <p className="text-muted">No chats yet.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
