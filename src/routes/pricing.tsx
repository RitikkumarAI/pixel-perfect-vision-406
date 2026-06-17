import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Phone, Calendar, PenSquare, Film, Users, Sparkles, StickyNote,
  Presentation, Table, FileText, Image as ImageIcon, Radio, Headphones,
  TrendingUp, Check, Minus, ChevronDown, ChevronLeft, ChevronRight,
  Database, Shield, BarChart3, Plug,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useBilling } from "@/hooks/useBilling";
import { useWorkspaces } from "@/hooks/useWorkspace";
import { useAnalytics } from "@/hooks/useAnalytics";
import toast from "react-hot-toast";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Plans for every team" },
      { name: "description", content: "Choose a plan that fits your workflow. Compare Workspace, AI, Phone, and Business Services pricing side by side." },
      { property: "og:title", content: "Pricing — Plans for every team" },
      { property: "og:description", content: "Compare plans, features, and add-ons across the entire platform." },
    ],
  }),
  component: PricingPage,
});

type Plan = {
  name: string;
  tag: string;
  desc: string;
  monthly: number | "Free" | "Custom";
  cta: string;
  highlights: string[];
  popular?: boolean;
};

type Category = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "Workspace" | "AI" | "AI Productivity Suite" | "Business Services";
  intro: string;
  plans: Plan[];
  compare: { label: string; values: (string | boolean)[] }[];
};

const CATEGORIES: Category[] = [
  {
    id: "workspace",
    name: "Workspace",
    icon: Video,
    group: "Workspace",
    intro: "Meetings, chat, and collaboration for every team size.",
    plans: [
      { name: "Starter", tag: "Workspace", desc: "For individuals getting started.", monthly: "Free", cta: "Sign up free",
        highlights: ["40 min meetings", "Up to 100 participants", "Team chat", "5 GB cloud storage"] },
      { name: "Professional", tag: "Workspace", desc: "Everything a small team needs.", monthly: 12, cta: "Buy now", popular: true,
        highlights: ["30 hour meetings", "Up to 300 participants", "Cloud recording", "AI meeting notes", "10 GB storage"] },
      { name: "Business", tag: "Workspace", desc: "For growing organizations.", monthly: 18, cta: "Buy now",
        highlights: ["Up to 500 participants", "Single sign-on", "Managed domains", "Recording transcripts", "Unlimited whiteboards"] },
      { name: "Enterprise", tag: "Workspace", desc: "Scalable platform with advanced controls.", monthly: "Custom", cta: "Contact sales",
        highlights: ["1,000+ participants", "Unlimited storage", "Dedicated support", "Workflow automation", "Advanced analytics"] },
    ],
    compare: [
      { label: "Max participants", values: ["100", "300", "500", "1,000+"] },
      { label: "Meeting length", values: ["40 min", "30 hours", "30 hours", "Unlimited"] },
      { label: "Cloud storage", values: ["—", "10 GB", "10 GB", "Unlimited"] },
      { label: "AI meeting notes", values: [false, true, true, true] },
      { label: "Cloud recording", values: [false, true, true, true] },
      { label: "Single sign-on", values: [false, false, true, true] },
      { label: "Workflow automation", values: [false, false, true, true] },
      { label: "Dedicated support", values: [false, false, false, true] },
      { label: "API access", values: [false, true, true, true] },
      { label: "Advanced analytics", values: [false, false, true, true] },
    ],
  },
  {
    id: "phone",
    name: "Phone",
    icon: Phone,
    group: "Workspace",
    intro: "Cloud calling that scales with your team.",
    plans: [
      { name: "Basic Calling", tag: "Phone", desc: "Pay-as-you-go calling.", monthly: 8, cta: "Buy now",
        highlights: ["Domestic calling", "Voicemail", "Call recording (3 months)", "Mobile + desktop apps"] },
      { name: "Professional", tag: "Phone", desc: "Unlimited regional calling.", monthly: 15, cta: "Buy now", popular: true,
        highlights: ["Unlimited domestic", "Virtual numbers", "Call recording (1 year)", "Voicemail transcripts"] },
      { name: "Enterprise", tag: "Phone", desc: "Global calling with advanced controls.", monthly: "Custom", cta: "Contact sales",
        highlights: ["Unlimited international", "Advanced analytics", "SLA + priority support", "PBX integrations"] },
    ],
    compare: [
      { label: "Domestic calling", values: ["Metered", "Unlimited", "Unlimited"] },
      { label: "International calling", values: ["—", "Add-on", "Unlimited"] },
      { label: "Virtual numbers", values: [false, true, true] },
      { label: "Call recording", values: ["3 months", "1 year", "Unlimited"] },
      { label: "Voicemail transcripts", values: [false, true, true] },
      { label: "Analytics", values: ["Basic", "Standard", "Advanced"] },
    ],
  },
  { id: "scheduler", name: "Scheduler", icon: Calendar, group: "Workspace",
    intro: "Smart scheduling that fits any calendar.",
    plans: [
      { name: "Basic", tag: "Scheduler", desc: "Personal scheduling.", monthly: "Free", cta: "Sign up free",
        highlights: ["1 booking page", "Calendar sync", "Email reminders"] },
      { name: "Pro", tag: "Scheduler", desc: "For busy individuals.", monthly: 9, cta: "Buy now", popular: true,
        highlights: ["Unlimited booking pages", "Group events", "Payments", "Branding"] },
      { name: "Team", tag: "Scheduler", desc: "Coordinate across teams.", monthly: 14, cta: "Buy now",
        highlights: ["Round-robin", "Routing forms", "Workflows", "Admin controls"] },
    ],
    compare: [
      { label: "Booking pages", values: ["1", "Unlimited", "Unlimited"] },
      { label: "Group events", values: [false, true, true] },
      { label: "Payments", values: [false, true, true] },
      { label: "Round-robin", values: [false, false, true] },
    ],
  },
  { id: "whiteboard", name: "Whiteboard", icon: PenSquare, group: "Workspace",
    intro: "Visual collaboration that travels with the meeting.",
    plans: [
      { name: "Basic", tag: "Whiteboard", desc: "Up to 3 editable boards.", monthly: "Free", cta: "Sign up free", highlights: ["3 boards", "Real-time editing", "Templates"] },
      { name: "Plus", tag: "Whiteboard", desc: "Unlimited boards.", monthly: 7, cta: "Buy now", popular: true, highlights: ["Unlimited boards", "Version history", "Export to PDF"] },
      { name: "Business", tag: "Whiteboard", desc: "For org-wide use.", monthly: 12, cta: "Buy now", highlights: ["Admin controls", "Audit logs", "Permissions"] },
    ],
    compare: [
      { label: "Boards", values: ["3", "Unlimited", "Unlimited"] },
      { label: "Version history", values: [false, true, true] },
      { label: "Admin controls", values: [false, false, true] },
    ],
  },
  { id: "clips", name: "Clips", icon: Film, group: "Workspace",
    intro: "Short async videos for everything.",
    plans: [
      { name: "Basic", tag: "Clips", desc: "Up to 5 recordings.", monthly: "Free", cta: "Sign up free", highlights: ["5 clips", "2-min limit", "Personal library"] },
      { name: "Plus", tag: "Clips", desc: "Unlimited recordings.", monthly: 6, cta: "Buy now", popular: true, highlights: ["Unlimited clips", "4K video", "Custom branding"] },
    ],
    compare: [
      { label: "Recordings", values: ["5", "Unlimited"] },
      { label: "Resolution", values: ["720p", "4K"] },
      { label: "Custom branding", values: [false, true] },
    ],
  },
  { id: "workvivo", name: "Workvivo", icon: Users, group: "Workspace",
    intro: "Employee experience platform.",
    plans: [
      { name: "Business", tag: "Workvivo", desc: "Connect every employee.", monthly: 4, cta: "Buy now", popular: true,
        highlights: ["News feed", "Spaces", "Podcasts", "Insights"] },
      { name: "Enterprise", tag: "Workvivo", desc: "Advanced controls.", monthly: "Custom", cta: "Contact sales",
        highlights: ["SSO", "Advanced analytics", "Custom integrations"] },
    ],
    compare: [
      { label: "Spaces", values: ["Unlimited", "Unlimited"] },
      { label: "Podcasts", values: [true, true] },
      { label: "Advanced analytics", values: [false, true] },
    ],
  },
  { id: "ai-assistant", name: "AI Assistant", icon: Sparkles, group: "AI",
    intro: "Your AI teammate across the workspace.",
    plans: [
      { name: "Basic", tag: "AI", desc: "Limited assistant access.", monthly: "Free", cta: "Coming soon", highlights: ["Meeting summaries", "20 queries/mo"] },
      { name: "Pro", tag: "AI", desc: "Agentic workspace.", monthly: 20, cta: "Buy now", popular: true,
        highlights: ["Unlimited summaries", "2,200 AI credits", "Agentic search", "Deep research"] },
    ],
    compare: [
      { label: "AI credits", values: ["None", "2,200/mo"] },
      { label: "Agentic search", values: [false, true] },
      { label: "Deep research", values: [false, true] },
    ],
  },
  { id: "ai-notes", name: "AI Notes", icon: StickyNote, group: "AI",
    intro: "AI note-taking for any meeting.",
    plans: [
      { name: "Basic", tag: "AI Notes", desc: "3 notes per month.", monthly: "Free", cta: "Sign up free", highlights: ["3 notes/mo", "Speaker attribution"] },
      { name: "Plus", tag: "AI Notes", desc: "Unlimited notes.", monthly: 10, cta: "Buy now", popular: true, highlights: ["Unlimited notes", "Third-party platforms", "Slack export"] },
    ],
    compare: [
      { label: "Notes/month", values: ["3", "Unlimited"] },
      { label: "Third-party meetings", values: [false, true] },
    ],
  },
  { id: "slides", name: "Slides", icon: Presentation, group: "AI Productivity Suite", intro: "AI-generated decks.",
    plans: [
      { name: "Basic", tag: "Slides", desc: "Personal use.", monthly: "Free", cta: "Sign up free", highlights: ["5 decks/mo", "Templates"] },
      { name: "Pro", tag: "Slides", desc: "Unlimited decks.", monthly: 8, cta: "Buy now", popular: true, highlights: ["Unlimited", "Brand kit", "Export PPT"] },
    ],
    compare: [{ label: "Decks/mo", values: ["5", "Unlimited"] }, { label: "Brand kit", values: [false, true] }],
  },
  { id: "sheets", name: "Sheets", icon: Table, group: "AI Productivity Suite", intro: "AI-powered spreadsheets.",
    plans: [
      { name: "Basic", tag: "Sheets", desc: "Personal use.", monthly: "Free", cta: "Sign up free", highlights: ["Up to 10k rows", "Templates"] },
      { name: "Pro", tag: "Sheets", desc: "For analysts.", monthly: 9, cta: "Buy now", popular: true, highlights: ["1M rows", "AI formulas", "Data connectors"] },
    ],
    compare: [{ label: "Row limit", values: ["10k", "1M"] }, { label: "AI formulas", values: [false, true] }],
  },
  { id: "docs", name: "Docs", icon: FileText, group: "AI Productivity Suite", intro: "Collaborative docs with AI.",
    plans: [
      { name: "Basic", tag: "Docs", desc: "Personal docs.", monthly: "Free", cta: "Sign up free", highlights: ["Unlimited docs", "Templates"] },
      { name: "Pro", tag: "Docs", desc: "For teams.", monthly: 7, cta: "Buy now", popular: true, highlights: ["AI writing", "Versioning", "Permissions"] },
    ],
    compare: [{ label: "AI writing", values: [false, true] }, { label: "Permissions", values: [false, true] }],
  },
  { id: "canvas", name: "Canvas", icon: ImageIcon, group: "AI Productivity Suite", intro: "AI design canvas.",
    plans: [
      { name: "Basic", tag: "Canvas", desc: "Limited.", monthly: "Free", cta: "Sign up free", highlights: ["10 designs/mo"] },
      { name: "Pro", tag: "Canvas", desc: "Unlimited.", monthly: 10, cta: "Buy now", popular: true, highlights: ["Unlimited", "Brand kit", "Export SVG/PNG"] },
    ],
    compare: [{ label: "Designs/mo", values: ["10", "Unlimited"] }, { label: "Brand kit", values: [false, true] }],
  },
  { id: "webinars", name: "Webinars", icon: Radio, group: "Business Services", intro: "Engaging events at scale.",
    plans: [
      { name: "500", tag: "Webinars", desc: "Up to 500 attendees.", monthly: 79, cta: "Buy now", highlights: ["Q&A", "Polling", "Reports"] },
      { name: "1,000", tag: "Webinars", desc: "Up to 1,000 attendees.", monthly: 340, cta: "Buy now", popular: true, highlights: ["Streaming", "Branding", "Analytics"] },
      { name: "Enterprise", tag: "Webinars", desc: "10k+ attendees.", monthly: "Custom", cta: "Contact sales", highlights: ["Production studio", "Dedicated PM"] },
    ],
    compare: [{ label: "Attendees", values: ["500", "1,000", "10k+"] }, { label: "Streaming", values: [false, true, true] }],
  },
  { id: "contact-center", name: "Contact Center", icon: Headphones, group: "Business Services", intro: "Omnichannel CCaaS.",
    plans: [
      { name: "Essentials", tag: "Contact Center", desc: "Voice + chat.", monthly: 69, cta: "Buy now", highlights: ["Voice", "Chat", "Routing"] },
      { name: "Premium", tag: "Contact Center", desc: "Full omnichannel.", monthly: 99, cta: "Buy now", popular: true, highlights: ["Email", "SMS", "Social", "QA"] },
      { name: "Elite", tag: "Contact Center", desc: "AI-powered.", monthly: "Custom", cta: "Contact sales", highlights: ["AI agents", "WFM", "Speech analytics"] },
    ],
    compare: [{ label: "Channels", values: ["Voice/Chat", "All", "All + AI"] }, { label: "WFM", values: [false, false, true] }],
  },
  { id: "revenue-accelerator", name: "Revenue Accelerator", icon: TrendingUp, group: "Business Services", intro: "Conversation intelligence for sales.",
    plans: [
      { name: "Pro", tag: "Revenue", desc: "Coaching + insights.", monthly: 50, cta: "Buy now", popular: true, highlights: ["Call analysis", "Scorecards", "Playbooks"] },
      { name: "Enterprise", tag: "Revenue", desc: "Forecasting + CRM.", monthly: "Custom", cta: "Contact sales", highlights: ["Deal forecasting", "CRM sync", "Custom models"] },
    ],
    compare: [{ label: "Forecasting", values: [false, true] }, { label: "CRM sync", values: ["Basic", "Advanced"] }],
  },
];

const SIDEBAR_GROUPS = [
  { label: "Workspace", ids: ["workspace", "phone", "scheduler", "whiteboard", "clips", "workvivo"] },
  { label: "AI", ids: ["ai-assistant", "ai-notes"] },
  { label: "AI Productivity Suite", ids: ["slides", "sheets", "docs", "canvas"] },
  { label: "Business Services", ids: ["webinars", "contact-center", "revenue-accelerator"] },
];

const ADDONS = [
  { icon: Sparkles, title: "AI Credit Pack", desc: "Extra AI credits for workflows and research.", price: "From $25" },
  { icon: Database, title: "Extra Storage", desc: "Add 1 TB of recording + file storage.", price: "$10/mo" },
  { icon: BarChart3, title: "Premium Analytics", desc: "Deep dashboards across products.", price: "$15/mo" },
  { icon: Shield, title: "Advanced Security", desc: "DLP, eDiscovery, and audit logs.", price: "$20/mo" },
  { icon: Users, title: "Large Meetings", desc: "Expand to 1,000 participants per call.", price: "$50/mo" },
  { icon: Radio, title: "Webinars Add-on", desc: "Add webinar capacity to any plan.", price: "From $79/mo" },
  { icon: Plug, title: "App Integrations", desc: "Premium connectors to your stack.", price: "$8/mo" },
];

const FAQS = [
  { q: "What is included in each plan?", a: "Every plan includes the core product, mobile + desktop apps, and security baseline. Higher tiers unlock more capacity, AI, admin, and integrations." },
  { q: "How does billing work?", a: "Plans are billed monthly or annually per user. Annual billing saves up to 20%. You can mix products and add-ons on a single invoice." },
  { q: "Can I upgrade later?", a: "Yes — upgrade any time from your admin console. New features unlock immediately and we prorate the difference." },
  { q: "Can I cancel anytime?", a: "Monthly plans can be cancelled at any time. Annual plans renew yearly; you can switch off auto-renew before the next cycle." },
  { q: "What payment methods are accepted?", a: "All major credit cards, PayPal, and invoiced ACH/wire for Business and Enterprise plans." },
  { q: "How secure is the platform?", a: "End-to-end encryption for meetings, SOC 2 Type II, ISO 27001, GDPR and HIPAA-ready configurations on Business and Enterprise plans." },
];

function PricingPage() {
  const [activeId, setActiveId] = useState("workspace");
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [addonIdx, setAddonIdx] = useState(0);

  const { createCheckoutSession, isLoading: isCheckoutLoading } = useBilling();
  const { activeWorkspace } = useWorkspaces();
  const { trackEvent } = useAnalytics();

  const handleCheckout = (planName: string) => {
    trackEvent('checkout_started', { plan: planName, workspaceId: activeWorkspace?.id });
    if (!activeWorkspace) {
      toast.error("Please sign in and select a workspace to purchase a plan.");
      window.location.href = "/signin";
      return;
    }
    createCheckoutSession(activeWorkspace.id, planName.toUpperCase());
  };

  const category = useMemo(() => CATEGORIES.find((c) => c.id === activeWorkspace?.id || c.id === activeId) || CATEGORIES[0], [activeId, activeWorkspace]);
  const factor = annual ? 0.8 : 1;

  const price = (m: Plan["monthly"]) => {
    if (m === "Free") return "Free";
    if (m === "Custom") return "Custom";
    return `$${(m * factor).toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-white text-navy-deep">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-24"
      >
        <section className="mx-auto max-w-[1280px] px-6 pb-20">
          <div className="flex flex-col gap-10 lg:flex-row">
            {/* Sidebar */}
            <aside className="lg:w-[260px] lg:shrink-0">
              <div className="lg:sticky lg:top-24">
                <h2 className="mb-4 text-[15px] font-bold tracking-tight text-navy-deep">Explore pricing</h2>
                <nav className="space-y-6">
                  {SIDEBAR_GROUPS.map((g) => (
                    <div key={g.label}>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-navy-deep/50">{g.label}</div>
                      <ul className="space-y-1">
                        {g.ids.map((id) => {
                          const c = CATEGORIES.find((x) => x.id === id)!;
                          const Icon = c.icon;
                          const active = activeId === id;
                          return (
                            <li key={id}>
                              <button
                                onClick={() => setActiveId(id)}
                                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                                  active
                                    ? "bg-zoom-blue text-white shadow-[0_8px_24px_-12px_rgba(37,99,235,0.6)]"
                                    : "text-navy-deep/80 hover:bg-zoom-blue/5 hover:text-navy-deep"
                                }`}
                              >
                                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-zoom-blue"}`} />
                                {c.name}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                      <h1 className="text-4xl font-black tracking-tight md:text-5xl">{category.name}</h1>
                      <p className="mt-3 max-w-xl text-base text-navy-deep/70">{category.intro}</p>
                    </div>
                    {/* Annual toggle */}
                    <div className="flex items-center gap-3 rounded-full border border-navy-deep/10 bg-white p-1.5 shadow-sm">
                      <button
                        onClick={() => setAnnual(false)}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${!annual ? "bg-zoom-blue text-white" : "text-navy-deep/60"}`}
                      >Monthly</button>
                      <button
                        onClick={() => setAnnual(true)}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${annual ? "bg-zoom-blue text-white" : "text-navy-deep/60"}`}
                      >Annually <span className="ml-1 text-[11px] opacity-80">Save 20%</span></button>
                    </div>
                  </div>

                  {/* Plan cards */}
                  <div className={`mt-10 grid gap-5 ${category.plans.length === 4 ? "md:grid-cols-2 xl:grid-cols-4" : category.plans.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                    {category.plans.map((p, i) => (
                      <motion.div
                        key={p.name}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}
                        whileHover={{ y: -4, scale: 1.015 }}
                        className={`relative flex flex-col rounded-2xl border bg-white p-6 transition ${
                          p.popular ? "border-zoom-blue/40 shadow-[0_24px_60px_-30px_rgba(37,99,235,0.5)]" : "border-navy-deep/10 hover:border-zoom-blue/30 hover:shadow-[0_20px_50px_-30px_rgba(7,18,58,0.3)]"
                        }`}
                      >
                        {p.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-zoom-blue px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                            Most popular
                          </div>
                        )}
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zoom-blue/10">
                          <category.icon className="h-5 w-5 text-zoom-blue" />
                        </div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-navy-deep/50">{p.tag}</div>
                        <h3 className="mt-1 text-2xl font-black tracking-tight">{p.name}</h3>
                        <p className="mt-2 min-h-[40px] text-sm text-navy-deep/70">{p.desc}</p>
                        <div className="mt-4">
                          <div className="text-3xl font-black tracking-tight">{price(p.monthly)}</div>
                          {typeof p.monthly === "number" && (
                            <div className="text-xs text-navy-deep/60">/user per month · billed {annual ? "annually" : "monthly"}</div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (p.cta === "Buy now") {
                              handleCheckout(p.name);
                            } else {
                              window.location.href = p.cta === "Contact sales" ? "/contact-sales" : "/pricing";
                            }
                          }}
                          disabled={isCheckoutLoading && p.cta === "Buy now"}
                          className={`mt-5 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                            p.popular ? "bg-zoom-blue text-white hover:bg-zoom-blue/90" : "bg-zoom-blue/10 text-navy-deep hover:bg-zoom-blue/15"
                          } ${isCheckoutLoading && p.cta === "Buy now" ? "opacity-50 cursor-not-allowed" : ""}`}
                        >{isCheckoutLoading && p.cta === "Buy now" ? "Redirecting to Stripe..." : p.cta}</button>
                        <div className="mt-6 border-t border-navy-deep/10 pt-5">
                          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-navy-deep/70">Highlights</div>
                          <ul className="space-y-2.5 text-sm">
                            {p.highlights.map((h) => (
                              <li key={h} className="flex gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-zoom-blue" />
                                <span className="text-navy-deep/85">{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Comparison table */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    className="mt-16"
                  >
                    <h2 className="text-2xl font-black tracking-tight md:text-3xl">Compare all features</h2>
                    <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-deep/10">
                      <table className="w-full min-w-[640px] text-sm">
                        <thead className="sticky top-0 z-10 bg-white">
                          <tr className="border-b border-navy-deep/10">
                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-navy-deep/60">Feature</th>
                            {category.plans.map((p) => (
                              <th key={p.name} className="px-5 py-4 text-left text-sm font-bold text-navy-deep">{p.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {category.compare.map((row, i) => (
                            <tr key={row.label} className={i % 2 ? "bg-navy-deep/[0.02]" : ""}>
                              <td className="px-5 py-3.5 font-medium text-navy-deep/80">{row.label}</td>
                              {row.values.map((v, j) => (
                                <td key={j} className="px-5 py-3.5 text-navy-deep/80">
                                  {v === true ? <Check className="h-4 w-4 text-zoom-blue" /> : v === false ? <Minus className="h-4 w-4 text-navy-deep/30" /> : v}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>

                  {/* Add-ons carousel */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    className="mt-16"
                  >
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-zoom-blue">All add-ons require a paid base plan</div>
                        <h2 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">Add-ons to {category.name}</h2>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAddonIdx((i) => Math.max(0, i - 1))}
                          className="grid h-10 w-10 place-items-center rounded-full border border-navy-deep/15 transition hover:border-zoom-blue hover:text-zoom-blue"
                        ><ChevronLeft className="h-4 w-4" /></button>
                        <button
                          onClick={() => setAddonIdx((i) => Math.min(ADDONS.length - 3, i + 1))}
                          className="grid h-10 w-10 place-items-center rounded-full border border-navy-deep/15 transition hover:border-zoom-blue hover:text-zoom-blue"
                        ><ChevronRight className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="mt-6 overflow-hidden">
                      <motion.div
                        animate={{ x: `calc(${-addonIdx} * (33.333% + 8px))` }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        className="flex gap-5"
                      >
                        {ADDONS.map((a) => (
                          <div key={a.title} className="w-[calc(100%-0px)] shrink-0 rounded-2xl border border-navy-deep/10 bg-white p-6 transition hover:-translate-y-1 hover:border-zoom-blue/30 hover:shadow-[0_20px_50px_-30px_rgba(7,18,58,0.3)] md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zoom-blue/10">
                              <a.icon className="h-5 w-5 text-zoom-blue" />
                            </div>
                            <h3 className="text-lg font-bold">{a.title}</h3>
                            <p className="mt-1 text-sm text-navy-deep/70">{a.desc}</p>
                            <div className="mt-4 text-lg font-black">{a.price}</div>
                            <button onClick={() => handleCheckout("PRO")} disabled={isCheckoutLoading} className={`mt-4 inline-flex items-center rounded-lg bg-zoom-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-zoom-blue/90 ${isCheckoutLoading ? 'opacity-50' : ''}`}>{isCheckoutLoading ? "Loading..." : "Buy now"}</button>
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* FAQ */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    className="mt-16"
                  >
                    <h2 className="text-2xl font-black tracking-tight md:text-3xl">Frequently asked questions</h2>
                    <div className="mt-6 divide-y divide-navy-deep/10 rounded-2xl border border-navy-deep/10 bg-white">
                      {FAQS.map((f, i) => {
                        const open = openFaq === i;
                        return (
                          <div key={f.q}>
                            <button
                              onClick={() => setOpenFaq(open ? null : i)}
                              className="flex w-full items-center justify-between px-6 py-5 text-left"
                            >
                              <span className="text-base font-semibold text-navy-deep">{f.q}</span>
                              <ChevronDown className={`h-5 w-5 shrink-0 text-navy-deep/60 transition-transform ${open ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence initial={false}>
                              {open && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <p className="px-6 pb-5 text-sm leading-relaxed text-navy-deep/75">{f.a}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>
      </motion.main>
      <Footer />
    </div>
  );
}