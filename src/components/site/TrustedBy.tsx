import { motion } from "framer-motion";
import { Star } from "lucide-react";

const LOGOS = [
  "Capital One",
  "The New York Times",
  "Walmart",
  "Werner Enterprises",
  "Moffitt Cancer Center",
  "ExxonMobil",
  "ServiceNow",
  "Salesforce",
  "Atlassian",
  "Pfizer",
];

const RATINGS = [
  { score: "4.5/5", stars: 4, reviews: "out of 7.9k+ reviews", source: "Gartner Peer Insights" },
  { score: "4.6/5", stars: 4, reviews: "out of 54.9k+ reviews", source: "G2" },
  { score: "8.5/10", stars: 4, reviews: "out of 5.8k+ reviews", source: "TrustRadius" },
];

export function TrustedBy() {
  const loop = [...LOGOS, ...LOGOS];
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-2xl font-semibold tracking-tight text-navy sm:text-3xl md:text-4xl"
        >
          Trusted by millions. Built for you.
        </motion.h2>

        {/* Marquee */}
        <div className="relative mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            className="flex shrink-0 items-center gap-16 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {loop.map((name, i) => (
              <span
                key={i}
                className="text-2xl font-serif italic text-navy/60 transition-colors hover:text-navy"
                style={{ fontVariant: "small-caps" }}
              >
                {name}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Ratings */}
        <div className="mt-20 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
          {RATINGS.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col items-center px-6 text-center"
            >
              <div className="text-5xl font-bold tracking-tight text-navy sm:text-6xl">{r.score}</div>
              <div className="mt-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-5 w-5 ${s < r.stars ? "fill-navy text-navy" : "fill-muted text-muted"}`}
                  />
                ))}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{r.reviews}</div>
              <div className="mt-5 text-sm font-semibold uppercase tracking-wider text-navy/70">
                {r.source}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}