import { Suspense, useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate, Link } from "react-router-dom";
import {
  BrandMark,
  Button,
  Shell,
  ThemePicker,
  applyTheme,
  readStoredTheme,
  writeStoredTheme,
  type ThemeId,
  cn,
} from "@aliasist/ui";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { NotFound } from "./pages/NotFound";
import { SistRouteFallback } from "./SistRouteFallback";
import { sists } from "./sists";

type EnvLane = "prod" | "staging" | "playground";

const resolveEnvLane = (): EnvLane => {
  const lane = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ENV_LANE;
  if (lane === "prod" || lane === "staging" || lane === "playground") return lane;
  return "prod";
};

const laneTone = (lane: EnvLane): string => {
  if (lane === "playground") return "text-amber-300 border-amber-500/40 bg-amber-500/10";
  if (lane === "staging") return "text-sky-300 border-sky-500/40 bg-sky-500/10";
  return "text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
};

export const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<ThemeId>(() => readStoredTheme() ?? "lab");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const envLane = resolveEnvLane();

  useEffect(() => {
    applyTheme(theme);
    writeStoredTheme(theme);
  }, [theme]);

  useEffect(() => {
    setSettingsOpen(false);
  }, [location.pathname]);

  return (
    <Shell
      header={
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center rounded-md text-ink-100 outline-none transition-all duration-250 hover:text-ufo-400 focus-visible:ring-2 focus-visible:ring-ufo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            <BrandMark size={24} className="gap-2" />
          </Link>
          <nav className="hidden items-center gap-0.5 md:flex">
            {sists.map((s) => {
              const active = location.pathname.startsWith(s.path);
              return (
                <Link
                  key={s.id}
                  to={s.path}
                  className={cn(
                    "relative rounded-md px-3 py-1.5 text-sm transition-all duration-250 ease-out",
                    active
                      ? "bg-ink-800/90 text-ink-50 shadow-[0_0_0_1px_rgba(47,149,220,0.22),0_12px_32px_-20px_rgba(47,149,220,0.35)]"
                      : "text-ink-300 hover:bg-ink-800/55 hover:text-ink-50",
                  )}
                >
                  {s.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "hidden rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] md:inline-flex",
                laneTone(envLane),
              )}
            >
              {envLane}
            </span>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen((open) => !open)}
                aria-expanded={settingsOpen}
                aria-haspopup="dialog"
              >
                Settings
              </Button>
              {settingsOpen ? (
                <div
                  role="dialog"
                  aria-label="Display settings"
                  className="absolute right-0 top-11 z-40 w-64 rounded-xl border border-ink-700 bg-ink-900/95 p-3 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.85)] backdrop-blur"
                >
                  <div className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
                    Theme
                  </div>
                  <p className="mt-1 text-xs text-ink-300">
                    Lab is default. Alternate themes are optional.
                  </p>
                  <ThemePicker value={theme} onChange={setTheme} className="mt-2 w-full justify-start" />
                </div>
              ) : null}
            </div>
            <Link to="/about">
              <Button variant="ghost" size="sm">
                About
              </Button>
            </Link>
            <a
              href="https://github.com/aliasist"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" size="sm">
                GitHub
              </Button>
            </a>
          </div>
        </div>
      }
      footer={
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 text-xs text-ink-400 sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Aliasist — built in the open.</span>
          <div className="flex items-center gap-3">
            <span className="font-mono">aliasist.tech</span>
          </div>
        </div>
      }
    >
      <Suspense fallback={<SistRouteFallback />}>
        <Routes>
          <Route path="/" element={<Home sists={sists} onNavigate={navigate} theme={theme} />} />
          <Route path="/about" element={<About />} />
          {sists.map((s) => {
            const Element = s.element;
            return s.status === "coming-soon" ? (
              <Route
                key={s.id}
                path={`${s.path}/*`}
                element={<ComingSoon name={s.name} />}
              />
            ) : (
              <Route key={s.id} path={`${s.path}/*`} element={<Element />} />
            );
          })}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Shell>
  );
};

const ComingSoon = ({ name }: { name: string }) => (
  <div className="relative flex min-h-[56vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_62%_50%_at_50%_42%,rgba(47,149,220,0.09),transparent_68%),radial-gradient(ellipse_40%_36%_at_80%_18%,rgba(255,179,71,0.05),transparent_55%)]"
    />
    <div className="relative">
      <div className="text-xs uppercase tracking-[0.2em] text-ink-400">
        {name}
      </div>
      <h2 className="mt-3 max-w-lg font-display text-3xl text-ink-50 sm:text-4xl">
        <span className="bg-gradient-to-br from-ink-50 via-ufo-200/95 to-ink-200/80 bg-clip-text text-transparent">
          Migrating from the legacy Aliasist suite
        </span>
      </h2>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-300">
        This sist ships in Phase 5 of the vNext rollout — moved from its original
        repo into this monorepo with the shared UI system and API gateway.
      </p>
    </div>
  </div>
);
