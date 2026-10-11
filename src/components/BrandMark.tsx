/** App logo: a person at the top of a pull-up, chin over the bar. Same drawing as public/favicon.svg. */
export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="brand-mark">
      <rect width="64" height="64" rx="15" fill="#1f6f8b" />
      <g fill="none" stroke="#fff" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 22H55" stroke="#f0a35c" />
        <path d="M19 22L22.5 35L32 29.5L41.5 35L45 22" />
        <path d="M32 28V45M32 45L27 56M32 45L37 56" />
      </g>
      <circle cx="32" cy="15" r="5.6" fill="#fff" />
    </svg>
  );
}
