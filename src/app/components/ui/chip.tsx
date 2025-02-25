export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 rounded-full bg-gray-200 text-sm">
      {children}
    </span>
  );
}
