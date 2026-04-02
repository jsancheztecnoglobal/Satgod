"use client";

import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { RuntimeCleanup } from "@/components/layout/runtime-cleanup";
import { UiDeviceProvider } from "@/components/layout/ui-device-context";
import { queryPersister } from "@/lib/offline/query-persister";

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
      <UiDeviceProvider>
        <RuntimeCleanup />
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </UiDeviceProvider>
    </PersistQueryClientProvider>
  );
}
