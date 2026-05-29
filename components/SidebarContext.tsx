'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

type SidebarCtx = {
  desktopHidden: boolean;
  mobileOpen: boolean;
  open: () => void;
  close: () => void;
  closeOnMobile: () => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [desktopHidden, setDesktopHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSidebar must be used within <SidebarProvider>');
  return v;
}
