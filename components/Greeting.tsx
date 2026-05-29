'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  CaretDown,
  WaveformIcon,
  MicIcon,
  ArrowUpIcon,
} from './Icons';
import { ClaudeLogo } from './ClaudeLogo';
import { useSidebar } from './SidebarContext';
import type { ChatMeta } from '@/lib/chats';

const MODELS = ['Opus 4.7', 'Sonnet 4.6', 'Haiku 4.5'];
const REASONING = ['None', 'Low', 'Medium', 'High'];
const ACTIONS = ['Write', 'Strategize', 'Career chat', 'From Calendar', 'From Gmail'];

export function Greeting({ chats }: { chats: ChatMeta[] }) {
  const router = useRouter();
  const { animal } = useSidebar();
  const [value, setValue] = useState('');
  const [model, setModel] = useState('Sonnet 4.6');
  const [reasoning, setReasoning] = useState('Low');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    if (chats.length === 0) return;
    const random = chats[Math.floor(Math.random() * chats.length)];
    router.push(`/chats/${random.slug}`);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <h1 className="flex items-center justify-center gap-3 sm:gap-4 font-serif text-3xl sm:text-4xl text-ink mb-10">
          <ClaudeLogo className="w-8 h-8 sm:w-10 sm:h-10 text-clay shrink-0" />
          <span>Anonymous {animal} returns!</span>
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
              <Dropdown
                value={model}
                options={MODELS}
                onChange={setModel}
                label="Model"
              />
              <Dropdown
                value={reasoning}
                options={REASONING}
                onChange={setReasoning}
                label="Reasoning effort"
              />
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
          {ACTIONS.map((a) => (
            <ActionChip
              key={a}
              active={activeAction === a}
              onClick={() => setActiveAction(activeAction === a ? null : a)}
            >
              {a}
            </ActionChip>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted mt-10 max-w-md mx-auto leading-relaxed">
          This is a parody archive. The chat box doesn&rsquo;t actually talk to
          Claude — pick a conversation from the sidebar to read along.
        </p>
      </div>
    </div>
  );
}

function Dropdown({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="flex items-center gap-1 text-[12px] text-ink/70 hover:text-ink px-2 py-1 rounded hover:bg-rule/60"
      >
        {value}
        <CaretDown className="w-3 h-3" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-20 bottom-full left-0 mb-1 min-w-[140px] rounded-lg border border-rule bg-paper shadow-lg py-1"
        >
          {options.map((o) => {
            const selected = o === value;
            return (
              <li key={o}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                  className={[
                    'w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between gap-3',
                    selected ? 'text-ink bg-rule/60' : 'text-ink/80 hover:bg-rule/40',
                  ].join(' ')}
                >
                  <span>{o}</span>
                  {selected && <Check />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-clay">
      <path d="m5 12 5 5L20 7" />
    </svg>
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

function ActionChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'text-[12px] px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors',
        active
          ? 'bg-clay/15 border-clay/40 text-clay'
          : 'bg-paper border-rule text-ink/80 hover:bg-rule/40',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
