import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import {
  Brain,
  Building2,
  Calendar,
  Headphones,
  LayoutGrid,
  NotebookPen,
  Phone,
  Sparkles,
  Users,
  Video,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import brighthireAsset from "@/assets/brighthire.webp.asset.json";
import virtualAgentAsset from "@/assets/virtual-agent.jpg.asset.json";
import contactCenterAsset from "@/assets/contact-center.jpg.asset.json";
import meetingsAsset from "@/assets/meetings.jpg.asset.json";
import myNotesAsset from "@/assets/my-notes-hp-card.webp.asset.json";
import zoommateAsset from "@/assets/zoommate.webp.asset.json";
import aiSuiteAsset from "@/assets/ai-suite.webp.asset.json";
import phoneAsset from "@/assets/phone.jpg.asset.json";
import webinarsAsset from "@/assets/webinars.jpg.asset.json";
import bonsaiAsset from "@/assets/bonsai.webp.asset.json";
import roomsAsset from "@/assets/rooms.jpg.asset.json";

type Card = {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  image: string;
  alt: string;
};

const CARDS: Card[] = [
  { id: "brighthire", title: "BrightHire", icon: Brain, image: brighthireAsset.url, alt: "BrightHire recruiting workspace" },
  { id: "virtual-agent", title: "Virtual Agent", icon: MessageCircle, image: virtualAgentAsset.url, alt: "Virtual Agent card with a person on a phone" },
  { id: "contact-center", title: "Contact Center", icon: Headphones, image: contactCenterAsset.url, alt: "Contact Center support agent" },
  { id: "meetings", title: "Meetings", icon: Video, image: meetingsAsset.url, alt: "Meetings collaboration interface" },
  { id: "my-notes", title: "My Notes", icon: NotebookPen, image: myNotesAsset.url, alt: "My Notes transcript card" },
  { id: "zoommate", title: "ZoomMate", icon: Sparkles, image: zoommateAsset.url, alt: "ZoomMate AI teammate card" },
  { id: "ai-productivity-suite", title: "AI Productivity Suite", icon: LayoutGrid, image: aiSuiteAsset.url, alt: "AI productivity suite apps" },
  { id: "phone", title: "Phone", icon: Phone, image: phoneAsset.url, alt: "Phone dialer product card" },
  { id: "webinars", title: "Webinars", icon: Calendar, image: webinarsAsset.url, alt: "Webinars event product card" },
  { id: "bonsai", title: "Bonsai", icon: Sparkles, image: bonsaiAsset.url, alt: "Bonsai workflow interface" },
  { id: "rooms", title: "Rooms", icon: Building2, image: roomsAsset.url, alt: "Zoom Rooms conference room" },
];

function cardDistance(index: number, selectedIndex: number) {
  const direct = Math.abs(index - selectedIndex);
  return Math.min(direct, CARDS.length - direct);
}

export function ShowcaseCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: true,
    skipSnaps: false,
    containScroll: false,
    duration: 28,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isHoveringRef = useRef(false);
  const [, force] = useState(0);

  const syncSelected = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    syncSelected();
    emblaApi.on("select", syncSelected);
    emblaApi.on("reInit", syncSelected);
    return () => {
      emblaApi.off("select", syncSelected);
      emblaApi.off("reInit", syncSelected);
    };
  }, [emblaApi, syncSelected]);

  useEffect(() => {
    if (!emblaApi) return;
    const timer = window.setInterval(() => {
      if (!isHoveringRef.current) emblaApi.scrollNext();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [emblaApi]);

  const cards = useMemo(() => CARDS, []);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    <section id="product-carousel" className="relative z-20 -mt-[176px] overflow-hidden px-0 pb-18 md:-mt-[196px] md:pb-22 lg:-mt-[214px] lg:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="mx-auto max-w-[1920px]"
        onMouseEnter={() => { isHoveringRef.current = true; force((n) => n + 1); }}
        onMouseLeave={() => { isHoveringRef.current = false; force((n) => n + 1); }}
      >
        <div ref={emblaRef} className="overflow-hidden px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="-ml-4 flex items-end md:-ml-5 lg:-ml-6">
            {cards.map((card, index) => {
              const distance = cardDistance(index, selectedIndex);
              const scale = distance === 0 ? 1 : distance === 1 ? 0.982 : distance === 2 ? 0.965 : 0.945;
              const translateY = distance === 0 ? 0 : distance === 1 ? 10 : distance === 2 ? 18 : 22;
              const rotateY = index < selectedIndex ? -5 : 5;

              return (
                <div key={card.id} className="min-w-0 shrink-0 grow-0 basis-[288px] pl-4 sm:basis-[296px] md:pl-5 lg:basis-[300px] lg:pl-6">
                  <article
                    className="group relative h-[414px] overflow-hidden rounded-[28px] shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] ring-1 ring-black/6 transition-transform duration-500 ease-out sm:h-[426px] lg:h-[430px]"
                    style={{
                      transform: `perspective(1500px) translateY(${translateY}px) scale(${scale}) rotateY(${distance === 0 ? 0 : rotateY}deg)`,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <img src={card.image} alt={card.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,18,59,0.12)_0%,rgba(4,18,59,0.02)_26%,rgba(4,18,59,0.0)_45%,rgba(0,0,0,0.08)_100%)]" />
                    <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/12" />
                    <span className="sr-only">{card.title}</span>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            aria-label="Previous"
            onClick={scrollPrev}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-navy-deep shadow-[0_8px_24px_-8px_rgba(15,23,42,0.3)] ring-1 ring-black/5 transition hover:scale-105 hover:shadow-[0_12px_28px_-8px_rgba(15,23,42,0.45)]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {cards.map((c, i) => (
              <button
                key={c.id}
                aria-label={`Go to ${c.title}`}
                onClick={() => scrollTo(i)}
                className="group/dot p-1"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    i === selectedIndex ? "h-2 w-6 bg-zoom-blue" : "h-2 w-2 bg-slate-300 group-hover/dot:bg-slate-400"
                  }`}
                />
              </button>
            ))}
          </div>
          <button
            aria-label="Next"
            onClick={scrollNext}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-navy-deep shadow-[0_8px_24px_-8px_rgba(15,23,42,0.3)] ring-1 ring-black/5 transition hover:scale-105 hover:shadow-[0_12px_28px_-8px_rgba(15,23,42,0.45)]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}