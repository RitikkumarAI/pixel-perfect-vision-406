import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import notesAsset from "@/assets/my-notes-hp-card.webp.asset.json";
import aiAsset from "@/assets/ai-suite.webp.asset.json";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

function ArrowChip() {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-navy-deep shadow-md transition group-hover:scale-110">
      <ArrowUpRight className="h-5 w-5" />
    </span>
  );
}

export function NewsImpact() {
  return (
    <section className="bg-background px-4 py-20 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-zoom-blue">
            <span className="h-1.5 w-1.5 rounded-full bg-zoom-blue" />
            What's new
          </div>
          <h2 className="text-balance text-4xl font-bold text-navy-deep md:text-6xl">
            Making news, making impact
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3 md:grid-rows-2">
          {/* Card 1 — tall left */}
          <motion.a
            href="#"
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -6 }}
            className="group relative row-span-2 flex min-h-[520px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e6bff] to-[#0a3fb3] p-8 text-white shadow-lg transition-shadow hover:shadow-2xl"
          >
            <div>
              <h3 className="text-2xl font-bold leading-tight md:text-3xl">
                Meet the new AI note taker
              </h3>
              <p className="mt-4 max-w-sm text-white/85">
                Capture insights from your conversations on calls, in person, and across third-party platforms.
              </p>
            </div>
            <div className="relative mt-8">
              <img src={notesAsset.url} alt="AI note taker preview" className="w-full rounded-xl object-cover" />
              <div className="absolute bottom-4 right-4"><ArrowChip /></div>
            </div>
          </motion.a>

          {/* Card 2 — tall center */}
          <motion.a
            href="#"
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -6 }}
            className="group relative row-span-2 flex min-h-[520px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#2d7bff] to-[#0b3ea8] p-8 text-white shadow-lg transition-shadow hover:shadow-2xl"
          >
            <div>
              <h3 className="text-2xl font-bold leading-tight md:text-3xl">
                Award-winning engineering, science & technology
              </h3>
              <p className="mt-4 max-w-sm text-white/85">
                From remote work to live broadcast, our platform is changing how the world connects.
              </p>
            </div>
            <div className="relative mt-8 grid place-items-center">
              <div className="grid h-44 w-44 place-items-center rounded-full bg-white/10 backdrop-blur-sm">
                <span className="text-6xl">🏆</span>
              </div>
              <div className="absolute bottom-0 right-0"><ArrowChip /></div>
            </div>
          </motion.a>

          {/* Card 3 — right top */}
          <motion.a
            href="#"
            custom={2}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -6 }}
            className="group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e6bff] to-[#1239a8] p-7 text-white shadow-lg transition-shadow hover:shadow-2xl"
          >
            <h3 className="text-xl font-bold leading-tight md:text-2xl">
              Accessible AI: include AI tools for every business
            </h3>
            <div className="mt-4 flex items-end justify-between">
              <p className="max-w-xs text-sm text-white/85">
                Leadership discusses how AI is made available at no extra cost.
              </p>
              <ArrowChip />
            </div>
          </motion.a>

          {/* Card 4 — right bottom */}
          <motion.a
            href="#"
            custom={3}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -6 }}
            className="group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#2873ff] to-[#0e3fa6] p-7 text-white shadow-lg transition-shadow hover:shadow-2xl"
          >
            <h3 className="text-xl font-bold leading-tight md:text-2xl">
              A new AI app built for frontline workers
            </h3>
            <div className="mt-4 flex items-end justify-between">
              <p className="max-w-xs text-sm text-white/85">
                Scheduling, updates, chat, push-to-talk, tasks, and more.
              </p>
              <ArrowChip />
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}