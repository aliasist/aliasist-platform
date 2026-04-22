import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface ShellProps {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Top-level app shell. Provides the global lab-grid backdrop and
 * the header / content / footer layout for every portal route.
 */
export const Shell = ({ header, children, footer, className }: ShellProps) => (
  <div
    className={cn(
      "relative min-h-screen bg-ink-950 text-ink-100 antialiased",
      "bg-grid bg-grid [background-position:center]",
      className,
    )}
  >
    {/* radial accent */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 [background:radial-gradient(1200px_600px_at_50%_-10%,rgba(11,207,114,0.08),transparent_60%)]"
    />
    <div className="relative z-10 flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-ink-800/80 bg-ink-950/70 backdrop-blur">
        {header}
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      {footer && (
        <footer className="border-t border-ink-800/80 bg-ink-950/70">
          {footer}
        </footer>
      )}
    </div>
  </div>
);
