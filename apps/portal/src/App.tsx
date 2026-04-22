import { Routes, Route, useLocation, useNavigate, Link } from "react-router-dom";
import { BrandMark, Button, Shell } from "@aliasist/ui";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { NotFound } from "./pages/NotFound";
import { sists } from "./sists";

export const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Shell
      header={
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-ink-100 transition hover:text-ufo-400">
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {sists.map((s) => {
              const active = location.pathname.startsWith(s.path);
              return (
                <Link
                  key={s.id}
                  to={s.path}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-ink-800 text-ink-50"
                      : "text-ink-300 hover:bg-ink-800/60 hover:text-ink-50"
                  }`}
                >
                  {s.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
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
          <span className="font-mono">aliasist.tech</span>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Home sists={sists} onNavigate={navigate} />} />
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
    </Shell>
  );
};

const ComingSoon = ({ name }: { name: string }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
    <div className="text-xs uppercase tracking-[0.2em] text-ink-400">
      {name}
    </div>
    <h2 className="mt-2 font-display text-3xl text-ink-50">
      Migrating from the legacy Aliasist suite
    </h2>
    <p className="mt-3 max-w-md text-sm text-ink-300">
      This sist ships in Phase 5 of the vNext rollout — moved from its original
      repo into this monorepo with the shared UI system and API gateway.
    </p>
  </div>
);
