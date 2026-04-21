import { Link } from "react-router-dom";

export const NotFound = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
    <div className="font-mono text-xs uppercase tracking-[0.18em] text-ufo-400">
      404 · off-grid
    </div>
    <h2 className="mt-3 font-display text-3xl text-ink-50">
      That path isn't on the map.
    </h2>
    <p className="mt-2 max-w-md text-sm text-ink-300">
      The URL you followed doesn't match a sist or portal route. Try the home
      page or pick a lab from the header.
    </p>
    <Link
      to="/"
      className="mt-5 inline-flex items-center gap-2 rounded-md border border-ink-600 px-4 py-2 text-sm text-ink-100 transition hover:border-ufo-500 hover:text-ufo-400"
    >
      ← Return to base
    </Link>
  </div>
);
