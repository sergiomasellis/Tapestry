"use client";

import * as React from "react";
import Header from "@/components/layout/Header";

type AppShellProps = {
  children: React.ReactNode;
};

/**
 * AppShell wraps pages with the global header and provides
 * touch-friendly padding and responsive container.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4 md:py-6 touch-pan-y">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppShell;