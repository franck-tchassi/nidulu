// app/[locale]/layout.tsx
import React from 'react'

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  return (
    <div>
      {children}
    </div>
  );
}
