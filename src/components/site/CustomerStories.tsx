import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import salesAsset from "@/assets/sales-meeting.jpg.asset.json";
import engagementAsset from "@/assets/engagement.jpg.asset.json";
import meetingsAsset from "@/assets/meetings.jpg.asset.json";
import contactCenterAsset from "@/assets/contact-center.jpg.asset.json";
import roomsAsset from "@/assets/rooms.jpg.asset.json";

type Story = {
  id: string;
  brand: string;
  image: string;
  title: string;
  quote: string;
  author: string;
  role: string;
};

const STORIES: Story[] = [
  {
    id: "northwind",
    brand: "Northwind Athletics",
    image: engagementAsset.url,
    title: "Northwind Athletics expands the fan and employee experience",
    quote: "Our platform lets us stay close to fans and our teams without compromising on the production quality our brand stands for.",
    author: "Jordan Avery",
    role: "Chief Revenue Officer",
  },
  {
    id: "lumen",
    brand: "Lumen Wellness",
    image: meetingsAsset.url,
    title: "Lumen Wellness scales mental health support with video SDKs",
    quote: "The flexibility of the SDK helped us deliver a real-world quality session inside a mobile-first product.",
    author: "Priya Sharma",
    role: "Founder & CEO",
  },
  {
    id: "atlas",
    brand: "Atlas Retail",
    image: contactCenterAsset.url,
    title: "Atlas Retail cut call abandonment by 90%",
    quote: "We replaced a stack of disconnected tools with one workflow — every call, transcript, and follow-up lives in one place.",
    author: "Marcus Lee",
    role: "Member Care QA Specialist",
  },
  {
    id: "vanta",
    brand: "Vanta Financial",
    image: salesAsset.url,
    title: "A connected, collaborative workforce drives innovation at Vanta",
    quote: "We're people-centered and highly collaborative — the platform reflects the culture we want to build.",
    author: "Noor Patel",
    role: "VP, Tech Talent Acquisition",
  },
  {
    id: "harbor",
    brand: "Harbor Studios",
    image: roomsAsset.url,
    title: "Harbor Studios unifies hybrid production rooms",
    quote: "Every room feels the same — creatives walk in and start working, no setup, no friction.",
    author: "Sam Rivera",
    role: "Head of Production Tech",
  },
];

export function CustomerStories() {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (hovering) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % STORIES.length), 4000);
    return () => window.clearInterval(t);
  }, [hovering]);

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
            Customer stories
          </div>
          <h2 className="text-balance text-4xl font-bold text-navy-deep md:text-6xl">
            Businesses achieve more together
          </h2>
        </motion.div>

        <div
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="flex h-[460px] gap-3 md:h-[560px]"
        >
          {STORIES.map((s, i) => {
            const isActive = i === active;
            return (
              <motion.button
                key={s.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                layout
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-3xl text-left focus:outline-none"
                style={{ flex: isActive ? "1 1 0%" : "0 0 110px" }}
              >
                <motion.img
                  src={s.image}
                  alt={s.brand}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={false}
                  animate={{ scale: isActive ? 1.02 : 1.1 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.div
                      key="active"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, delay: 0.15 }}
                      className="relative z-10 flex h-full flex-col justify-between p-6 text-white md:p-10"
                    >
                      <div className="text-sm font-semibold uppercase tracking-wider text-white/80">
                        {s.brand}
                      </div>
                      <div className="max-w-2xl space-y-5">
                        <h3 className="text-2xl font-bold leading-tight md:text-4xl">
                          {s.title}
                        </h3>
                        <p className="hidden text-white/85 md:block">"{s.quote}"</p>
                        <p className="text-sm text-white/70">
                          — <span className="font-semibold text-white">{s.author}</span>, {s.role}
                        </p>
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-navy-deep transition group-hover:scale-105">
                          <ArrowUpRight className="h-5 w-5" />
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="inactive"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-x-0 bottom-0 z-10 p-4 text-center text-xs font-semibold uppercase tracking-wider text-white/90"
                    >
                      {s.brand.split(" ")[0]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}