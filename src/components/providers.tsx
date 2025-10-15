'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletContextProvider } from './wallet-provider';
import SessionRedirectHandler from './session-redirect-handler';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletContextProvider>
      <QueryClientProvider client={queryClient}>
        <SessionRedirectHandler />
        {children}
      </QueryClientProvider>
    </WalletContextProvider>
  );
}
