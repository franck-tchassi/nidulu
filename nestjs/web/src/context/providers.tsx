"use client";

import React from 'react';

import { UiProvider } from '@/context/ui-context';
import { AuthProvider } from '@/context/auth-context';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      
        <UiProvider>
          {children}
        </UiProvider>
      
    </AuthProvider>
  );
};

export default Providers;
