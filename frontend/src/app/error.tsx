"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
    
    // In production, you could send to Sentry or similar
    // if (process.env.NODE_ENV === "production") {
    //   Sentry.captureException(error);
    // }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription className="text-base">
            We encountered an unexpected error. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-md bg-muted p-4 text-xs font-mono overflow-auto max-h-40">
              <p className="text-destructive font-semibold mb-2">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="text-muted-foreground whitespace-pre-wrap">
                  {error.stack.slice(0, 1000)}
                </pre>
              )}
              {error.digest && (
                <p className="mt-2 text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => reset()}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            className="w-full sm:w-auto"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

