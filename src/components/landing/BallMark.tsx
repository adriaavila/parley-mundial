export function BallMark({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="32" cy="32" r="21.5" fill="var(--lime)" />
      <g
        fill="var(--bg-0)"
        stroke="var(--bg-0)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="32,24 39.6,29.5 36.7,38.5 27.3,38.5 24.4,29.5" />
        <path d="M32 24V12.5M39.6 29.5l11-3.8M36.7 38.5l7.6 10.4M27.3 38.5l-7.6 10.4M24.4 29.5l-11-3.8" />
        <polygon points="32,12.5 27.4,14 27.4,9 36.6,9 36.6,14" />
        <polygon points="50.6,25.7 47,28.8 44.3,24.6 51.8,18.9 54.6,22.9" />
        <polygon points="44.3,48.9 40.6,45.9 44.6,43.2 50.1,49.4 46.7,52.6" />
        <polygon points="19.7,48.9 23.4,45.9 19.4,43.2 13.9,49.4 17.3,52.6" />
        <polygon points="13.4,25.7 17,28.8 19.7,24.6 12.2,18.9 9.4,22.9" />
      </g>
    </svg>
  );
}
