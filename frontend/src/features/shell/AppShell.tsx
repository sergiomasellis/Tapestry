"use client";

import * as React from "react";
import Link from "next/link";
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
      <footer className="border-t-2 border-border bg-muted/30 mt-auto">
        <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold">Tapestry</span>
              <span>•</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/legal/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/legal/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppShell;