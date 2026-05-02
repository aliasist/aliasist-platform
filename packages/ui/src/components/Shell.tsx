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
      "aliasist-shell relative min-h-screen overflow-x-hidden antialiased",
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
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(980px 540px at 50% -14%, var(--aliasist-shell-orb-1), transparent 58%), radial-gradient(720px 420px at 110% 28%, var(--aliasist-shell-orb-2), transparent 52%), linear-gradient(180deg, rgba(8,11,18,0) 0%, color-mix(in srgb, var(--aliasist-bg) 88%, transparent) 74%)",
        }}
      />
      {/* Aurora orbs */}
      <div
        className={cn(
          "absolute -left-[20%] top-[8%] h-[min(58vw,480px)] w-[min(58vw,480px)] rounded-full",
          "blur-[100px]",
          "motion-reduce:animate-none animate-aurora-1",
        )}
        style={{
          background:
            "linear-gradient(135deg, var(--aliasist-shell-orb-1), transparent 72%)",
        }}
      />
      <div
        className={cn(
          "absolute -right-[18%] top-[38%] h-[min(52vw,420px)] w-[min(52vw,420px)] rounded-full",
          "blur-[88px]",
          "motion-reduce:animate-none animate-aurora-2",
        )}
        style={{
          background:
            "linear-gradient(135deg, var(--aliasist-shell-orb-3), transparent 72%)",
        }}
      />
      <div
        className={cn(
          "absolute left-[32%] -bottom-[12%] h-[min(48vw,380px)] w-[min(70vw,620px)] rounded-full",
          "blur-[96px]",
          "motion-reduce:animate-none animate-aurora-3",
        )}
        style={{
          background:
            "linear-gradient(0deg, var(--aliasist-shell-orb-2), transparent 72%)",
        }}
      />
      {/* Subtle vignette */}
      <div className="absolute inset-0" style={{ background: "var(--aliasist-shell-vignette)" }} />
    </div>
    <svg
      aria-hidden
      viewBox="0 0 360 360"
      className={cn(
        "pointer-events-none absolute right-[-4rem] top-14 hidden h-80 w-80 opacity-50 blur-[0.2px] md:block lg:right-8",
        "motion-reduce:animate-none animate-float-gentle drop-shadow-[0_0_38px_rgba(47,149,220,0.22)]",
      )}
      fill="none"
      style={{ color: "var(--aliasist-accent)" }}
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
      <header className="aliasist-shell-header sticky top-0 z-20 border-b border-[color:var(--aliasist-border)] backdrop-blur-2xl backdrop-saturate-150">
        {/* Accent hairline */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-px opacity-80",
            "aliasist-shell-accent",
            "motion-reduce:animate-none animate-shimmer-line [background-size:240%_100%]",
          )}
        />
        {header}
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        {children}
      </main>
      {footer && (
        <footer className="aliasist-shell-footer relative border-t border-[color:var(--aliasist-border)] backdrop-blur-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
            style={{
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--aliasist-accent) 4%, transparent), transparent)",
            }}
          />
          {footer}
        </footer>
      )}
    </div>
  </div>
);
