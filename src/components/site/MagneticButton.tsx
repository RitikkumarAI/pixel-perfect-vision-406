import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

export function MagneticButton({
  children,
  className = "",
  as = "a",
  href,
  to,
}: {
  children: ReactNode;
  className?: string;
  as?: "a" | "button";
  href?: string;
  to?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 14 });
  const sy = useSpring(y, { stiffness: 220, damping: 14 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * 18);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 12);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className="inline-block"
    >
      {as === "a" ? (
        <a href={href ?? to ?? "#"} className={className}>
          {children}
        </a>
      ) : (
        <button className={className}>{children}</button>
      )}
    </motion.div>
  );
}
