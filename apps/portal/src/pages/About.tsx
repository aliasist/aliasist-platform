import { Panel } from "@aliasist/ui";

export const About = () => (
  <div className="mx-auto max-w-3xl space-y-6">
    <header>
      <div className="text-xs uppercase tracking-[0.2em] text-ufo-400/80">
        About
      </div>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink-50">
        One platform, five labs.
      </h1>
      <p className="mt-3 text-sm text-ink-300">
        Aliasist is a single SPA served from Cloudflare Pages, backed by one
        unified Worker at <span className="font-mono">api.aliasist.tech</span>.
        Every "sist" is a feature module — same shell, same design system,
        same AI layer. Add a new sist by shipping a manifest.
      </p>
    </header>

    <Panel eyebrow="Mission" title="Educational by default">
      <p className="text-sm text-ink-300">
        Each lab is built to teach the system it visualizes — markets, storms,
        space, data centers, social signal. AI explainers are grounded in the
        data on the page and are safety-first. No hype, no black boxes.
      </p>
    </Panel>

    <Panel eyebrow="Stack" title="How it's built">
      <ul className="space-y-1.5 text-sm text-ink-200">
        <li>· React 18 + TypeScript + Tailwind + Framer Motion</li>
        <li>· pnpm workspaces + Turborepo for incremental builds</li>
        <li>· Cloudflare Workers (Hono) for the unified gateway</li>
        <li>· D1 per domain, R2 for tiles and imagery</li>
        <li>· Ollama (Azure, Cloudflare Tunnel) → Groq fallback for AI</li>
        <li>· Sentry + Datadog for observability</li>
      </ul>
    </Panel>
  </div>
);
