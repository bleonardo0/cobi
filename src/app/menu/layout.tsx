'use client';

import { MenuLanguageProvider } from '@/contexts/MenuLanguageContext';

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MenuLanguageProvider>
      {children}
    </MenuLanguageProvider>
  );
} 