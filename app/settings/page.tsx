'use client';

import { useEffect, useState } from 'react';
import { Footer } from '@/components/Footer';
import {
  CaretDown,
  SunIcon,
  MoonIcon,
  AutoThemeIcon,
} from '@/components/Icons';

const TABS = [
  'General',
  'Account',
  'Usage',
  'Capabilities',
  'Connectors',
  'Claude Code',
] as const;
type Tab = (typeof TABS)[number];

const ANIMALS = [
  'Wombat',
  'Aardvark',
  'Pangolin',
  'Capybara',
  'Axolotl',
  'Quokka',
  'Narwhal',
  'Tapir',
  'Manatee',
  'Okapi',
  'Numbat',
  'Echidna',
  'Platypus',
  'Lemur',
  'Sloth',
  'Hedgehog',
  'Marmot',
  'Stoat',
  'Tanuki',
  'Binturong',
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('General');

  return (
    <>
      <div className="flex-1 px-4 sm:px-8 pb-16">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="font-serif text-4xl text-ink mb-8 mt-2">Settings</h1>

          <div className="flex gap-10">
            {/* Tab nav */}
            <nav className="w-48 shrink-0">
              <ul className="space-y-1">
                {TABS.map((t) => {
                  const active = t === tab;
                  return (
                    <li key={t}>
                      <button
                        type="button"
                        onClick={() => setTab(t)}
                        className={[
                          'w-full text-left rounded-lg px-3 py-2 text-sm',
                          active
                            ? 'bg-rule text-ink font-medium'
                            : 'text-ink/75 hover:bg-rule/60',
                        ].join(' ')}
                      >
                        {t}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Content */}
            <section className="flex-1 min-w-0 max-w-2xl">
              {tab === 'General' && <GeneralTab />}
              {tab === 'Account' && <Placeholder name="Account" />}
              {tab === 'Usage' && <Placeholder name="Usage" />}
              {tab === 'Capabilities' && <Placeholder name="Capabilities" />}
              {tab === 'Connectors' && <Placeholder name="Connectors" />}
              {tab === 'Claude Code' && <Placeholder name="Claude Code" />}
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function GeneralTab() {
  const [animal, setAnimal] = useState('Wombat');
  const [name, setName] = useState('Anonymous Wombat');
  const [nickname, setNickname] = useState('Anonymous Wombat');
  const [work, setWork] = useState('Other');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    const pick = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    setAnimal(pick);
    setName(`Anonymous ${pick}`);
    setNickname(`Anonymous ${pick}`);
  }, []);
  const [theme, setTheme] = useState<'light' | 'auto' | 'dark'>('light');
  const [font, setFont] = useState('Anthropic Serif');
  const [voice, setVoice] = useState('Buttery');
  const [voiceSpeed, setVoiceSpeed] = useState('Normal');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-10">
      <SectionHeader>Profile</SectionHeader>

      <Row label="Avatar">
        <span
          aria-hidden
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-clay text-paper text-base font-medium"
        >
          {animal[0]}
        </span>
      </Row>

      <Row label="Full name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-64 rounded-md border border-rule bg-paper px-3 py-1.5 text-sm focus:outline-none focus:border-ink/40"
        />
      </Row>

      <Row label="What should Claude call you?">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-64 rounded-md border border-rule bg-paper px-3 py-1.5 text-sm focus:outline-none focus:border-ink/40"
        />
      </Row>

      <Row label="What best describes your work?">
        <Select value={work} onChange={setWork} options={['Other', 'Engineering', 'Design', 'Writing', 'Research']} />
      </Row>

      <div>
        <div className="text-sm text-ink mb-2">Instructions for Claude</div>
        <p className="text-xs text-muted mb-2">
          Claude will keep these in mind across chats and Coworks within
          Anthropic&rsquo;s guidelines.{' '}
          <a href="#" className="text-clay underline">
            Learn more
          </a>
        </p>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={5}
          placeholder="Tell Claude how you'd like it to respond..."
          className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm focus:outline-none focus:border-ink/40 resize-y leading-relaxed placeholder:text-muted"
        />
      </div>

      <SectionHeader>Preferences</SectionHeader>

      <Row label="Appearance">
        <div className="flex items-center gap-1 border border-rule rounded-full p-0.5 bg-paper">
          <ThemeToggle current={theme} value="light" onClick={() => setTheme('light')} icon={<SunIcon />} />
          <ThemeToggle current={theme} value="auto" onClick={() => setTheme('auto')} icon={<AutoThemeIcon />} />
          <ThemeToggle current={theme} value="dark" onClick={() => setTheme('dark')} icon={<MoonIcon />} />
        </div>
      </Row>

      <Row label="Chat font">
        <Select value={font} onChange={setFont} options={['Anthropic Serif', 'System Sans', 'Mono']} />
      </Row>

      <Row label="Voice">
        <Select value={voice} onChange={setVoice} options={['Buttery', 'Glassy', 'Mellow', 'Bright']} />
      </Row>

      <Row label="Voice speed">
        <Select value={voiceSpeed} onChange={setVoiceSpeed} options={['Slow', 'Normal', 'Fast']} />
      </Row>

      <SectionHeader>Notifications</SectionHeader>

      <Row label="Enable notifications">
        <Toggle on={notifications} onChange={setNotifications} />
      </Row>

      <p className="text-xs text-muted pt-4 border-t border-rule">
        Nothing here actually saves — this is a parody settings screen on a
        static archive site.
      </p>
    </div>
  );
}

function Placeholder({ name }: { name: string }) {
  return (
    <div className="rounded-xl border border-rule bg-cream px-6 py-12 text-center">
      <h2 className="font-serif text-xl text-ink mb-2">{name}</h2>
      <p className="text-sm text-ink/60">
        This tab is here for decoration — the real Claude has a full {name}{' '}
        screen, but on this parody archive it&rsquo;s just a stub.
      </p>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-xl text-ink border-b border-rule pb-3 mb-2">
      {children}
    </h2>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-1">
      <div className="text-sm text-ink/85">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-md border border-rule bg-paper pl-3 pr-7 py-1.5 text-sm focus:outline-none focus:border-ink/40"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <CaretDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-ink/50 pointer-events-none" />
    </div>
  );
}

function ThemeToggle({
  current,
  value,
  onClick,
  icon,
}: {
  current: string;
  value: 'light' | 'auto' | 'dark';
  onClick: () => void;
  icon: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      title={value}
      aria-label={value}
      className={[
        'h-7 w-7 rounded-full flex items-center justify-center',
        active ? 'bg-rule text-ink' : 'text-ink/50 hover:text-ink',
      ].join(' ')}
    >
      {icon}
    </button>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className={[
        'relative h-6 w-10 rounded-full transition-colors',
        on ? 'bg-clay' : 'bg-rule',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-transform shadow-sm',
          on ? 'translate-x-[18px]' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  );
}
