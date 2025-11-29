"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Critical Error</h1>
            <p className="text-muted-foreground mb-6">
              A critical error occurred. Please refresh the page or try again later.
            </p>
            {process.env.NODE_ENV === "development" && error && (
              <div className="mb-6 rounded-md bg-muted p-3 text-left text-xs font-mono overflow-auto max-h-32">
                <p className="text-red-600 dark:text-red-400 font-semibold">
                  {error.name}: {error.message}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => reset()}
                className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

