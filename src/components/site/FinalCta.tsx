import { motion } from "framer-motion";

export function FinalCta() {
  return (
    <section className="bg-background px-4 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-balance text-4xl font-bold leading-tight text-navy-deep md:text-6xl">
          See what we can do for your business
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#"
            className="inline-flex h-12 items-center rounded-full bg-zoom-blue px-7 font-semibold text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(37,99,235,0.7)]"
          >
            Get started today
          </a>
          <a
            href="/pricing"
            className="inline-flex h-12 items-center rounded-full bg-zoom-blue/10 px-7 font-semibold text-navy-deep transition hover:-translate-y-0.5 hover:bg-zoom-blue/15"
          >
            Find your plan
          </a>
        </div>
      </motion.div>
    </section>
  );
}