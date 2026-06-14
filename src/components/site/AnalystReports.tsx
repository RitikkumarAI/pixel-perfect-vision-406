import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import gartner from "@/assets/gartner-card.jpg";
import contactCenter from "@/assets/contact-center.jpg";
import forrester from "@/assets/forrester-card.jpg";

type Report = {
  image: string;
  alt: string;
  title: React.ReactNode;
  cta: string;
  accent?: string;
};

const REPORTS: Report[] = [
  {
    image: gartner,
    alt: "Gartner Magic Quadrant leader badge",
    title: (
      <>
        A Leader in the <span className="text-zoom-blue">Gartner® Magic Quadrant™</span> for UCaaS, Worldwide
      </>
    ),
    cta: "Read the report",
  },
  {
    image: contactCenter,
    alt: "Customer support professional with headset",
    title: <>Recognized in the 2026 Gartner Voice of the Customer for CCaaS</>,
    cta: "Explore the report",
  },
  {
    image: forrester,
    alt: "Forrester Wave analyst graphic",
    title: <>The Forrester Wave™: Unified Communications as a Service Platforms</>,
    cta: "Read Forrester report",
  },
];

export function AnalystReports() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {REPORTS.map((r, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative aspect-square overflow-hidden rounded-3xl bg-muted shadow-[0_10px_40px_-15px_rgba(15,23,42,0.25)] transition-shadow duration-500 group-hover:shadow-[0_25px_60px_-15px_rgba(37,99,235,0.45)]"
              >
                <img
                  src={r.image}
                  alt={r.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-7 pt-20">
                  <h3 className="text-xl font-semibold leading-snug text-white sm:text-2xl">
                    {r.title}
                  </h3>
                </div>
              </motion.div>
              <div className="mt-6">
                <button className="group/btn inline-flex items-center gap-2 rounded-full bg-zoom-blue px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-zoom-blue-hover hover:shadow-lg hover:-translate-y-0.5">
                  {r.cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}