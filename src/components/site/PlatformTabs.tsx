import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles, Headphones, Megaphone, TrendingUp, Heart, MessageSquare, Bot, BarChart3, Award } from "lucide-react";
import aiSuite from "@/assets/ai-suite.webp.asset.json";
import contactCenter from "@/assets/contact-center.jpg.asset.json";
import webinars from "@/assets/webinars.jpg.asset.json";
import sales from "@/assets/sales-meeting.jpg.asset.json";
import engagement from "@/assets/engagement.jpg.asset.json";

type Bullet = { title: string; body: string };
type Tab = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bullets: Bullet[];
  image: string;
  alt: string;
  overlays: { label: string; icon: React.ComponentType<{ className?: string }>; pos: string }[];
};

const TABS: Tab[] = [
  {
    id: "collab",
    label: "Collaboration",
    icon: Sparkles,
    image: aiSuite.url,
    alt: "AI productivity suite workspace",
    bullets: [
      { title: "One workspace, less app switching:", body: "Meetings, chat, docs, and tasks live side by side." },
      { title: "AI that drafts with you:", body: "Turn meeting notes into briefs, decks, and follow-ups in seconds." },
      { title: "Async by default:", body: "Share video updates and clips so teams move without another call." },
      { title: "Connected to your stack:", body: "Plays nicely with the tools your team already loves." },
    ],
    overlays: [
      { label: "Drive meeting", icon: Sparkles, pos: "top-6 left-6" },
      { label: "Build slides", icon: Sparkles, pos: "bottom-10 right-10" },
    ],
  },
  {
    id: "support",
    label: "Customer Support",
    icon: Headphones,
    image: contactCenter.url,
    alt: "Customer support agent with AI overlays",
    bullets: [
      { title: "One platform, full context:", body: "Phone, chat, email, SMS, social, and video unified in a single view." },
      { title: "Smarter automation:", body: "Virtual Agent handles multi-intent questions so humans focus on high-value cases." },
      { title: "Better self-service:", body: "Instant answers and proactive resolutions cut friction and drive loyalty." },
      { title: "AI-powered support:", body: "Real-time suggestions, key action highlights, and task automation keep agents sharp." },
      { title: "Get more from your data:", body: "CRM integration, real-time analytics, and conversation insights improve CX." },
    ],
    overlays: [
      { label: "Automatic Q&A", icon: Sparkles, pos: "top-6 left-6" },
      { label: "Meet with an agent", icon: Bot, pos: "top-1/2 right-8" },
      { label: "Automatic call routing", icon: Sparkles, pos: "bottom-20 left-10" },
      { label: "Auto appointment scheduling", icon: Sparkles, pos: "bottom-6 right-8" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    image: webinars.url,
    alt: "Marketing webinar and event experience",
    bullets: [
      { title: "Keep audiences engaged:", body: "Capture leads with branded webinars and events that build pipeline." },
      { title: "Deliver stand-out experiences:", body: "Host polished, interactive events that reflect your brand." },
      { title: "Broader reach and richer insights:", body: "Extend every event with virtual and hybrid options." },
      { title: "Put busywork on auto-pilot with AI:", body: "Automate content, personalize outreach, and analyze performance faster." },
    ],
    overlays: [
      { label: "Live attendees: 4,218", icon: BarChart3, pos: "top-6 left-6" },
      { label: "Marketing", icon: Megaphone, pos: "bottom-6 right-8" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: TrendingUp,
    image: sales.url,
    alt: "Sales rep in a meeting with deal insights",
    bullets: [
      { title: "Make selling easier:", body: "Eliminate admin work so reps can focus on building relationships." },
      { title: "Boost productivity and win rates:", body: "Auto-summarized meetings, suggested follow-ups, and deal insights keep cycles short." },
      { title: "Give RevOps deeper visibility:", body: "See pipeline insights and competitor trends for confident forecasting." },
      { title: "Close with confidence:", body: "Agentic AI flags risks, coaches reps, and automates next steps." },
    ],
    overlays: [
      { label: "Deal Summary", icon: Sparkles, pos: "top-10 left-6" },
    ],
  },
  {
    id: "engagement",
    label: "Employee Engagement",
    icon: Heart,
    image: engagement.url,
    alt: "Remote employees connecting on a video call",
    bullets: [
      { title: "Foster community in hybrid teams:", body: "Company-wide updates, recognition, and social feeds that connect remote employees." },
      { title: "Create immersive experiences:", body: "Host interactive all-hands, learning sessions, and celebrations teams love." },
      { title: "Communicate on your schedule:", body: "Share video updates asynchronously — no extra meetings." },
      { title: "Reinforce culture and recognition:", body: "Celebrate wins, milestones, and initiatives with rich media and live events." },
      { title: "Measure engagement to improve:", body: "Track participation analytics from Events, Clips, and Workvivo." },
    ],
    overlays: [
      { label: "Say hi to Eric!", icon: MessageSquare, pos: "top-6 left-6" },
      { label: "Welcome to the team!", icon: Award, pos: "bottom-10 left-10" },
      { label: "Excited to have you!", icon: Heart, pos: "top-1/2 right-8" },
    ],
  },
];

export function PlatformTabs() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % TABS.length), 4500);
    return () => clearInterval(id);
  }, [paused]);

  const tab = TABS[active];

  return (
    <section
      className="bg-background py-24 sm:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center text-4xl font-semibold leading-tight tracking-tight text-navy sm:text-5xl md:text-6xl"
        >
          One platform.<br />Endless ways to work together.
        </motion.h2>

        {/* Tabs */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          {TABS.map((t, i) => {
            const Icon = t.icon;
            const isActive = i === active;
            return (
              <button
                key={t.id}
                onClick={() => setActive(i)}
                className={`relative inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 sm:text-base ${
                  isActive
                    ? "border-zoom-blue/30 bg-zoom-blue/5 text-zoom-blue shadow-sm"
                    : "border-transparent text-muted-foreground hover:text-navy"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {isActive && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-0 -z-10 rounded-full ring-1 ring-zoom-blue/40"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="mt-14 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id + "-text"}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="order-2 lg:order-1"
            >
              <ul className="space-y-5">
                {tab.bullets.map((b, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + idx * 0.08 }}
                    className="flex gap-3 text-base text-navy/85 sm:text-lg"
                  >
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                    <span>
                      <span className="font-semibold text-navy">{b.title}</span>{" "}
                      <span className="text-navy/75">{b.body}</span>
                    </span>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-10">
                <button className="group inline-flex items-center gap-2 rounded-full bg-zoom-blue px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-zoom-blue-hover hover:shadow-xl hover:-translate-y-0.5">
                  Explore products
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>

            <motion.div
              key={tab.id + "-img"}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="order-1 lg:order-2"
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-3xl bg-muted shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] hover-premium-card">
                <img
                  src={tab.image}
                  alt={tab.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                {tab.overlays.map((o, idx) => {
                  const Icon = o.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.25 + idx * 0.12 }}
                      className={`absolute ${o.pos} flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-xs font-medium text-navy shadow-lg backdrop-blur-md sm:text-sm`}
                    >
                      <Icon className="h-3.5 w-3.5 text-zoom-blue" />
                      {o.label}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}