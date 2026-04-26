/**
 * Decorative SVG only — no text, no UI chrome. Used behind real hero copy.
 */
export const HeroOrnament = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 400 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <linearGradient id="ho-orbit" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.35" />
        <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#34d399" stopOpacity="0.15" />
      </linearGradient>
      <linearGradient id="ho-glow" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#6d28d9" stopOpacity="0" />
      </linearGradient>
    </defs>
    <ellipse
      cx="200"
      cy="118"
      rx="168"
      ry="88"
      stroke="url(#ho-orbit)"
      strokeWidth="1"
      strokeDasharray="4 6"
    />
    <ellipse
      cx="200"
      cy="118"
      rx="132"
      ry="64"
      stroke="url(#ho-orbit)"
      strokeWidth="0.75"
      opacity="0.7"
    />
    <ellipse
      cx="200"
      cy="118"
      rx="96"
      ry="40"
      stroke="url(#ho-orbit)"
      strokeWidth="0.5"
      opacity="0.5"
    />
    <circle cx="200" cy="30" r="2" fill="#34d399" fillOpacity="0.85" />
    <circle cx="368" cy="118" r="1.5" fill="#fbbf24" fillOpacity="0.7" />
    <circle cx="200" cy="206" r="1.5" fill="#a78bfa" fillOpacity="0.6" />
    <path
      d="M 200 30 Q 320 80 200 200"
      stroke="url(#ho-glow)"
      strokeWidth="16"
      strokeLinecap="round"
      opacity="0.12"
    />
  </svg>
);
