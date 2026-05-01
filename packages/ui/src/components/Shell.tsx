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
      "relative min-h-screen overflow-x-hidden bg-ink-950 text-ink-100 antialiased",
      className,
    )}
  >
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Slow-moving grid */}
      <div
        className={cn(
          "absolute inset-0 bg-grid opacity-[0.22] motion-reduce:animate-none",
          "[background-size:32px_32px] animate-grid-drift",
        )}
      />
      {/* Base wash */}
      <div className="absolute inset-0 [background:radial-gradient(980px_540px_at_50%_-14%,rgba(47,149,220,0.16),transparent_58%),radial-gradient(720px_420px_at_110%_28%,rgba(255,179,71,0.045),transparent_52%),linear-gradient(180deg,rgba(8,11,18,0)_0%,rgba(8,11,18,0.88)_74%)]" />
      {/* Aurora orbs */}
      <div
        className={cn(
          "absolute -left-[20%] top-[8%] h-[min(58vw,480px)] w-[min(58vw,480px)] rounded-full",
          "bg-gradient-to-br from-ufo-400/28 via-ufo-500/12 to-transparent blur-[100px]",
          "motion-reduce:animate-none animate-aurora-1",
        )}
      />
      <div
        className={cn(
          "absolute -right-[18%] top-[38%] h-[min(52vw,420px)] w-[min(52vw,420px)] rounded-full",
          "bg-gradient-to-tr from-signal-500/22 via-signal-400/10 to-transparent blur-[88px]",
          "motion-reduce:animate-none animate-aurora-2",
        )}
      />
      <div
        className={cn(
          "absolute left-[32%] -bottom-[12%] h-[min(48vw,380px)] w-[min(70vw,620px)] rounded-full",
          "bg-gradient-to-t from-ufo-600/18 via-ink-800/20 to-transparent blur-[96px]",
          "motion-reduce:animate-none animate-aurora-3",
        )}
      />
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_62%_at_50%_44%,transparent_32%,rgba(5,6,10,0.55)_100%)]" />
    </div>
    <svg
      aria-hidden
      viewBox="0 0 360 360"
      className={cn(
        "pointer-events-none absolute right-[-4rem] top-14 hidden h-80 w-80 text-ufo-200 opacity-50 blur-[0.2px] md:block lg:right-8",
        "motion-reduce:animate-none animate-float-gentle drop-shadow-[0_0_38px_rgba(47,149,220,0.22)]",
      )}
      fill="none"
    >
      <defs>
        <filter id="aliasist-shell-ufo-glow" x="-60%" y="-80%" width="220%" height="260%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.18 0 0 0 0 0.58 0 0 0 0 0.86 0 0 0 0.7 0"
          />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="aliasist-shell-ufo-beam" x1="180" y1="170" x2="180" y2="330" gradientUnits="userSpaceOnUse">
          <stop stopColor="#88cffd" stopOpacity="0.26" />
          <stop offset="1" stopColor="#0bcf72" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M132 170L96 326H264L228 170"
        fill="url(#aliasist-shell-ufo-beam)"
      />
      <g filter="url(#aliasist-shell-ufo-glow)">
        <path
          d="M114 150c0-36.5 29.5-66 66-66s66 29.5 66 66"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.45"
        />
        <ellipse
          cx="180"
          cy="166"
          rx="122"
          ry="30"
          fill="currentColor"
          fillOpacity="0.07"
          stroke="currentColor"
          strokeWidth="5"
          opacity="0.72"
        />
        <path
          d="M109 187c21 18 121 18 142 0"
          stroke="#0bcf72"
          strokeWidth="4"
          strokeLinecap="round"
          className="motion-reduce:opacity-40 motion-safe:animate-pulse-soft"
          opacity="0.34"
        />
        <circle
          cx="180"
          cy="130"
          r="8"
          fill="#88cffd"
          className="motion-reduce:opacity-85 motion-safe:animate-pulse-soft"
          opacity="0.85"
        />
      </g>
    </svg>
    <div className="relative z-10 flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-ink-950/78 backdrop-blur-2xl backdrop-saturate-150">
        {/* Accent hairline */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-px opacity-80",
            "bg-gradient-to-r from-transparent via-ufo-400/55 to-transparent",
            "motion-reduce:animate-none animate-shimmer-line [background-size:240%_100%]",
          )}
        />
        {header}
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        {children}
      </main>
      {footer && (
        <footer className="relative border-t border-white/[0.08] bg-ink-950/82 backdrop-blur-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ufo-500/[0.04] to-transparent"
          />
          {footer}
        </footer>
      )}
    </div>
  </div>
);
