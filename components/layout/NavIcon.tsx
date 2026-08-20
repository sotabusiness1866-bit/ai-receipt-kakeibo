const PATHS: Record<string, string> = {
  home: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10",
  receipt:
    "M7 3h10a1 1 0 011 1v16l-2.5-1.5L13 20l-2.5-1.5L8 20l-2.5-1.5L3 20V4a1 1 0 011-1zM8 8h8M8 12h8M8 16h5",
  chart: "M4 20V10m6 10V4m6 16v-7M3 20h18",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-4 4-6 8-6s8 2 8 6",
};

export function NavIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const d = PATHS[name] ?? PATHS.home;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
