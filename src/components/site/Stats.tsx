import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function Counter({ to, suffix = "", duration = 1.8 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const sv = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const [val, setVal] = useState(0);
  useEffect(() => { if (inView) mv.set(to); }, [inView, to, mv]);
  useEffect(() => sv.on("change", (v) => setVal(v)), [sv]);
  return <span ref={ref}>{Math.round(val).toLocaleString()}{suffix}</span>;
}

export function Stats() {
  const items = [
    { v: 300, s: "M+", label: "Daily meeting participants" },
    { v: 99, s: "%", label: "Customer satisfaction" },
    { v: 200, s: "+", label: "Countries supported" },
    { v: 1, s: "B+", label: "Minutes hosted weekly" },
  ];
  return (
    <section className="py-24 bg-navy-deep text-white relative overflow-hidden">
      <div className="absolute inset-0 hero-mesh opacity-30" />
      <div className="relative max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Built for teams of every shape and size
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((it, i) => (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="text-5xl md:text-6xl font-bold shimmer-text">
                <Counter to={it.v} suffix={it.s} />
              </div>
              <div className="mt-2 text-sm text-white/70">{it.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
