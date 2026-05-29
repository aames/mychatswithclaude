type Props = {
  className?: string;
};

// 11 rounded rays of slightly varying lengths, evenly rotated.
// Length variations give it a hand-drawn, organic feel rather than a
// symmetric starburst.
const RAYS = [
  44, 40, 44, 42, 45, 41, 44, 43, 45, 40, 44,
] as const;

export function ClaudeLogo({ className }: Props) {
  return (
    <svg
      viewBox="-50 -50 100 100"
      fill="currentColor"
      className={className ?? 'w-6 h-6'}
      aria-hidden
    >
      {RAYS.map((length, i) => {
        const angle = (i * 360) / RAYS.length;
        return (
          <rect
            key={i}
            x="-2.4"
            y={-length}
            width="4.8"
            height={length - 6}
            rx="2.4"
            transform={`rotate(${angle})`}
          />
        );
      })}
    </svg>
  );
}
