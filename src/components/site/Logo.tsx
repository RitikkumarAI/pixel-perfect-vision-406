export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold text-2xl tracking-tight ${className}`}>
      zoom<span className="text-zoom-blue">•</span>
    </span>
  );
}
