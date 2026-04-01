"use client";

import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryPersister } from "@/lib/offline/query-persister";
import { ServiceWorkerRegistration } from "@/components/layout/service-worker-registration";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 30 * 60_000,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 2,
          },
        },
      }),
  );

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: queryPersister }}>
      <ServiceWorkerRegistration />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
