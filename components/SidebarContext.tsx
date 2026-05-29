'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

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

type SidebarCtx = {
  desktopHidden: boolean;
  mobileOpen: boolean;
  open: () => void;
  close: () => void;
  closeOnMobile: () => void;
  animal: string;
};

const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [desktopHidden, setDesktopHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Default for SSR/static-export render. Randomized after mount to avoid
  // hydration mismatch.
  const [animal, setAnimal] = useState('Wombat');

  useEffect(() => {
    setAnimal(ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);
  }, []);

  const value: SidebarCtx = {
    desktopHidden,
    mobileOpen,
    open: () => {
      setDesktopHidden(false);
      setMobileOpen(true);
    },
    close: () => {
      setDesktopHidden(true);
      setMobileOpen(false);
    },
    closeOnMobile: () => setMobileOpen(false),
    animal,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSidebar must be used within <SidebarProvider>');
  return v;
}
