import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import "./globals.css";
import { AppProviders } from "@/components/layout/app-providers";
import { AppShell } from "@/components/layout/app-shell";
import { SessionControls } from "@/components/layout/session-controls";
import { getAppSession } from "@/lib/auth/session";

const sans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Tecnoglobal FSM",
  description:
    "Plataforma FSM / SAT / GMAO para servicios tecnicos de aire comprimido industrial.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAppSession();

  return (
    <html
      lang="es"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppProviders>
          <AppShell session={session} sessionControls={<SessionControls session={session} />}>
            {children}
          </AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
