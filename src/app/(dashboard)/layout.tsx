'use client';

import { DashboardLanguageProvider } from '@/contexts/DashboardLanguageContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLanguageProvider>
      {children}
    </DashboardLanguageProvider>
  );
} 