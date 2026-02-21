// app/providers.tsx
// web/src/context/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProviderClient } from '@/locales/client';

import { Toaster } from 'sonner';
import React, { PropsWithChildren, useState } from 'react';
import { AuthProvider } from "@/context/auth-context";

interface ProvidersProps extends PropsWithChildren {
  locale: string;
}

const Providers = ({ children, locale }: ProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProviderClient locale={locale}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </I18nProviderClient>
    </QueryClientProvider>
  );
};

export default Providers;