import { useMemo } from "react";

export function Particles({ count = 40, className = "" }: { count?: number; className?: string }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 3,
        delay: Math.random() * 10,
        duration: 12 + Math.random() * 18,
        opacity: 0.2 + Math.random() * 0.6,
      })),
    [count]
  );
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-white particle"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            animationDelay: `-${d.delay}s`,
            animationDuration: `${d.duration}s`,
            boxShadow: "0 0 6px rgba(255,255,255,0.6)",
          }}
        />
      ))}
    </div>
  );
}
