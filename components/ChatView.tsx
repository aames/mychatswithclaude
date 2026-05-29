import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Chat } from '@/lib/chats';

export function ChatView({ chat }: { chat: Chat }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 sm:px-8 py-10">
      <header className="mb-8 border-b border-rule pb-6">
        <h1 className="font-serif text-3xl text-ink">{chat.title}</h1>
        {chat.date && (
          <p className="mt-2 text-sm text-muted">
            {formatDate(chat.date)}
          </p>
        )}
        {chat.summary && (
          <p className="mt-3 text-ink/70 italic">{chat.summary}</p>
        )}
      </header>

      <div className="space-y-8">
        {chat.messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} />
        ))}
      </div>
    </article>
  );
}

function Message({
  role,
  content,
}: {
  role: 'user' | 'assistant';
  content: string;
}) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-rule px-4 py-3 text-ink whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-clay text-paper font-serif text-sm"
      >
        C
      </span>
      <div className="prose-claude flex-1 text-ink">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
