'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  CaretDown,
  WaveformIcon,
  MicIcon,
  ArrowUpIcon,
  StarIcon,
} from './Icons';
import type { ChatMeta } from '@/lib/chats';

export function Greeting({ chats }: { chats: ChatMeta[] }) {
  const router = useRouter();
  const [value, setValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    // Spoof site: pretend the user "started" a chat by sending them to a random archived chat
    if (chats.length === 0) return;
    const random = chats[Math.floor(Math.random() * chats.length)];
    router.push(`/chats/${random.slug}`);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <h1 className="flex items-center justify-center gap-3 font-serif text-3xl sm:text-4xl text-ink mb-10">
          <StarIcon className="w-5 h-5 text-clay/80" />
          <span>Anonymous Wombat returns!</span>
          <StarIcon className="w-5 h-5 text-clay/80" />
        </h1>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-rule bg-cream shadow-sm"
        >
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="How can I help you today?"
            className="w-full bg-transparent px-5 pt-4 pb-3 text-ink placeholder:text-muted focus:outline-none"
          />

          <div className="flex items-center justify-between px-3 pb-3 pt-1 gap-2">
            <div className="flex items-center gap-2">
              <ModelPill />
              <ReasoningPill />
            </div>
            <div className="flex items-center gap-1">
              <IconButton title="Voice mode">
                <WaveformIcon className="w-4 h-4" />
              </IconButton>
              <IconButton title="Dictate">
                <MicIcon className="w-4 h-4" />
              </IconButton>
              <button
                type="submit"
                disabled={!value.trim()}
                className="ml-1 h-8 w-8 rounded-full bg-clay text-paper disabled:opacity-40 flex items-center justify-center hover:bg-clay/90"
                aria-label="Send"
              >
                <ArrowUpIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <ActionChip>Write</ActionChip>
          <ActionChip>Strategize</ActionChip>
          <ActionChip>Career chat</ActionChip>
          <ActionChip>From Calendar</ActionChip>
          <ActionChip>From Gmail</ActionChip>
        </div>

        <p className="text-center text-[11px] text-muted mt-10 max-w-md mx-auto leading-relaxed">
          This is a parody archive. The chat box doesn&rsquo;t actually talk to
          Claude — pick a conversation from the sidebar to read along.
        </p>
      </div>
    </div>
  );
}

function ModelPill() {
  return (
    <button
      type="button"
      className="flex items-center gap-1 text-[12px] text-ink/70 hover:text-ink px-2 py-1 rounded hover:bg-rule/60"
    >
      Sonnet 4.6
      <CaretDown className="w-3 h-3" />
    </button>
  );
}

function ReasoningPill() {
  return (
    <button
      type="button"
      className="flex items-center gap-1 text-[12px] text-ink/70 hover:text-ink px-2 py-1 rounded hover:bg-rule/60"
    >
      Low
      <CaretDown className="w-3 h-3" />
    </button>
  );
}

function IconButton({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      className="h-8 w-8 rounded-full text-ink/60 hover:text-ink hover:bg-rule/60 flex items-center justify-center"
    >
      {children}
    </button>
  );
}

function ActionChip({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="text-[12px] text-ink/80 px-3 py-1.5 rounded-full border border-rule bg-paper hover:bg-rule/40 flex items-center gap-1.5"
    >
      {children}
    </button>
  );
}
