/**
 * LayoutShell.tsx — Conditional layout wrapper
 *
 * Shows the global Header on content pages but hides it on
 * /unlock and /watch routes which have their own navigation.
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';

/** Routes that render their own navigation */
const STANDALONE_ROUTES = ['/unlock', '/watch'];

interface LayoutShellProps {
  children: React.ReactNode;
}

const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.some((route) => pathname?.startsWith(route));

  return (
    <>
      {!isStandalone && <Header />}
      <main className="flex-1">{children}</main>
    </>
  );
};

export default LayoutShell;
