import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import {
  Video,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  PenSquare,
  Layout,
  Film,
  CheckSquare,
  Building2,
  Radio,
  ArrowUpRight,
  Sparkles,
  Monitor,
  UserCheck,
  Users,
  Headphones,
  Bot,
  BarChart3,
  Presentation,
  TrendingUp,
  Leaf,
  Brain,
  StickyNote,
  Code2,
  FileText,
  Table,
  Image as ImageIcon,
  Webhook,
  Boxes,
  AppWindow,
  Store,
  Wrench,
} from "lucide-react";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "All Products — Workplace, AI, Business Services & Developer Tools" },
      {
        name: "description",
        content:
          "Explore every product across Workplace, Business Services, AI, and Developer Ecosystem — built into one AI-first collaboration platform.",
      },
      { property: "og:title", content: "All Products" },
      {
        property: "og:description",
        content: "Meetings, Chat, Phone, AI, SDKs and more — connected on one platform.",
      },
    ],
  }),
  component: Products,
});

type Product = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  tag: string;
  slug: string;
  ai?: boolean;
};

const workplace: Product[] = [
  {
    icon: Video,
    title: "Meetings",
    desc: "Host virtual meetings online with easy-to-use video conferencing software.",
    tag: "Communication",
    slug: "meetings",
  },
  {
    icon: MessageSquare,
    title: "Chat",
    desc: "Connect teams and streamline communication across all your workplace apps with integrated instant messaging.",
    tag: "Communication",
    slug: "chat",
  },
  {
    icon: Phone,
    title: "Phone",
    desc: "Reliable communication starts with a modern cloud phone system that's accessible in an easy-to-use app.",
    tag: "Communication",
    slug: "phone",
  },
  {
    icon: Mail,
    title: "Mail & Calendar",
    desc: "Save time and stay focused using your existing email and calendar service alongside all your workplace apps.",
    tag: "Communication",
    slug: "mail-calendar",
  },
  {
    icon: Calendar,
    title: "Scheduler",
    desc: "Share your availability and book appointments with people outside your organization in minutes, not days.",
    tag: "Communication",
    slug: "scheduler",
  },
  {
    icon: PenSquare,
    title: "Canvas",
    desc: "Get work done together in real time with AI-first documents that adapt to different team and project needs.",
    tag: "Productivity",
    slug: "canvas",
  },
  {
    icon: Layout,
    title: "Whiteboard",
    desc: "Work together on a digital canvas that combines core whiteboard functionality with advanced diagramming tools.",
    tag: "Productivity",
    slug: "whiteboard",
  },
  {
    icon: Film,
    title: "Clips",
    desc: "Record, edit, and share high-quality, short-form screen recordings and video messages.",
    tag: "Productivity",
    slug: "clips",
  },
  {
    icon: CheckSquare,
    title: "Tasks",
    desc: "Track and complete tasks across your workplace with ZoomMate to get more done.",
    tag: "Productivity",
    slug: "tasks",
  },
  {
    icon: Building2,
    title: "Rooms",
    desc: "Bring teams together in flexible spaces for both in-person and remote collaboration with dedicated video conferencing software.",
    tag: "Spaces",
    slug: "rooms",
  },
  {
    icon: Radio,
    title: "Workspace Reservation",
    desc: "Reserve desks and workspaces ahead of time or when they arrive at the office.",
    tag: "Spaces",
    slug: "workspace-reservation",
  },
  {
    icon: Monitor,
    title: "Digital Signage",
    desc: "Inform and engage employees by displaying corporate content on screens in physical office spaces.",
    tag: "Spaces",
    slug: "digital-signage",
  },
  {
    icon: UserCheck,
    title: "Visitor Management",
    desc: "Maintain security while streamlining the process of inviting and managing guests in a physical office space.",
    tag: "Spaces",
    slug: "visitor-management",
  },
  {
    icon: Users,
    title: "Workvivo",
    desc: "Engage employees with a modern platform for communication, recognition, community building, and collaboration.",
    tag: "Employee Experience",
    slug: "workvivo",
  },
];

const business: Product[] = [
  {
    icon: Headphones,
    title: "Contact Center",
    desc: "Deliver seamless, highly personalized customer care on one familiar platform with AI-first cloud contact center software.",
    tag: "Sales",
    slug: "contact-center",
  },
  {
    icon: Bot,
    title: "Virtual Agent",
    desc: "Streamline support operations through AI-driven virtual assistance and personalized interactions.",
    tag: "Sales",
    slug: "virtual-agent",
  },
  {
    icon: BarChart3,
    title: "Workforce Engagement",
    desc: "Optimize customer service by staffing your contact center with the right number of agents at the right times.",
    tag: "Sales",
    slug: "workforce-engagement",
  },
  {
    icon: Presentation,
    title: "Webinars & Events",
    desc: "Host professional webinars and events at any scale with custom branding, production tools, and built-in analytics that drive real results.",
    tag: "Sales",
    slug: "webinars-events",
  },
  {
    icon: TrendingUp,
    title: "Revenue Accelerator",
    desc: "Surface insights from Zoom Meetings and Zoom Phone customer interactions.",
    tag: "Sales",
    slug: "revenue-accelerator",
  },
  {
    icon: Leaf,
    title: "Bonsai",
    desc: "Bring projects, clients, and billing into one integrated, easy-to-use platform.",
    tag: "Business Management",
    slug: "bonsai",
  },
  {
    icon: Brain,
    title: "BrightHire",
    desc: "Maximize hiring efficiency with AI that elevates every search, kickoff, interview, and decision — and provides groundbreaking insights to continuously optimize your talent strategy.",
    tag: "Employee Experience",
    slug: "brighthire",
  },
];

const ai: Product[] = [
  {
    icon: Sparkles,
    title: "ZoomMate",
    desc: "Powerful AI that searches, automates, and actually completes action items — available on the web or inside Zoom Workplace.",
    tag: "AI",
    slug: "zoommate",
    ai: true,
  },
  {
    icon: StickyNote,
    title: "My Notes",
    desc: "Capture, organize, and summarize every meeting automatically with this AI-powered note taker — built right into Zoom and working across all platforms.",
    tag: "AI",
    slug: "my-notes",
    ai: true,
  },
  {
    icon: Code2,
    title: "API Services",
    desc: "Build intelligent apps with enterprise-grade APIs for speech, vision, and language — no infrastructure needed.",
    tag: "AI",
    slug: "api-services",
    ai: true,
  },
  {
    icon: Sparkles,
    title: "AI Productivity Suite",
    desc: "Turn every call into a deliverable with docs, sheets, and slides built automatically from your meeting content.",
    tag: "AI",
    slug: "ai-productivity-suite",
    ai: true,
  },
  {
    icon: PenSquare,
    title: "Canvas",
    desc: "AI-first documents that adapt to your team and shape themselves around the work.",
    tag: "AI",
    slug: "canvas-ai",
    ai: true,
  },
  {
    icon: ImageIcon,
    title: "Slides",
    desc: "Generate beautiful, on-brand presentations from a single prompt or meeting recap.",
    tag: "AI",
    slug: "slides",
    ai: true,
  },
  {
    icon: Table,
    title: "Sheets",
    desc: "Smart spreadsheets that summarize, forecast, and reshape data conversationally.",
    tag: "AI",
    slug: "sheets",
    ai: true,
  },
  {
    icon: FileText,
    title: "Paper",
    desc: "Lightweight AI-native documents for fast drafting, sharing, and decisions.",
    tag: "AI",
    slug: "paper",
    ai: true,
  },
];

const developer: Product[] = [
  {
    icon: Code2,
    title: "Video SDK",
    desc: "Build fully customizable video-based applications with Zoom.",
    tag: "Developer",
    slug: "video-sdk",
  },
  {
    icon: Code2,
    title: "Meeting SDK",
    desc: "Display the familiar Zoom experience in your app or website.",
    tag: "Developer",
    slug: "meeting-sdk",
  },
  {
    icon: Code2,
    title: "APIs",
    desc: "Discover a variety of APIs to allow developers to interface with Zoom products.",
    tag: "Developer",
    slug: "apis",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    desc: "Securely integrate with Zoom APIs and webhooks.",
    tag: "Developer",
    slug: "webhooks",
  },
  {
    icon: Wrench,
    title: "Developer Solutions",
    desc: "An open platform for developers to build Zoom apps and integrations.",
    tag: "Developer",
    slug: "developer-solutions",
  },
  {
    icon: Boxes,
    title: "Zoom Apps",
    desc: "Build web apps in Zoom with collaborative and immersive models and client APIs.",
    tag: "Developer",
    slug: "zoom-apps",
  },
  {
    icon: Store,
    title: "App Marketplace",
    desc: "Explore thousands of apps that work with or within Zoom.",
    tag: "Developer",
    slug: "app-marketplace",
  },
  {
    icon: AppWindow,
    title: "Embedded Experiences",
    desc: "Drop ready-made meeting and chat surfaces directly into your product.",
    tag: "Developer",
    slug: "embedded",
  },
];

function Card({ p, index, ai }: { p: Product; index: number; ai?: boolean }) {
  return (
    <motion.a
      href={`#${p.slug}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className={[
        "group relative flex flex-col min-h-[280px] p-7 rounded-3xl border border-[#ECECEC] transition-all duration-300",
        "hover:shadow-[0_24px_60px_-20px_rgba(15,23,42,0.18)] hover:border-zoom-blue/30",
        ai ? "bg-gradient-to-br from-[#F7F7F7] via-white to-blue-50/60" : "bg-[#F7F7F7]",
      ].join(" ")}
    >
      {ai && (
        <span className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zoom-blue border border-blue-100">
          <Sparkles className="w-3 h-3" /> AI
        </span>
      )}
      <span
        className={[
          "w-12 h-12 rounded-2xl grid place-items-center text-white shadow-sm",
          ai ? "bg-gradient-to-br from-zoom-blue via-indigo-500 to-fuchsia-500" : "bg-zoom-blue",
        ].join(" ")}
      >
        <p.icon className="w-5 h-5" />
      </span>
      <h3 className="mt-5 text-xl font-bold text-ink leading-snug">{p.title}</h3>
      <p className="mt-2 text-[15px] text-muted-foreground leading-relaxed">{p.desc}</p>
      <div className="mt-auto pt-6 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{p.tag}</span>
        <span className="w-8 h-8 rounded-full grid place-items-center text-ink/60 group-hover:bg-zoom-blue group-hover:text-white group-hover:translate-x-1 transition-all">
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>
    </motion.a>
  );
}

function Section({
  id,
  title,
  subtitle,
  items,
  ai,
}: {
  id: string;
  title: string;
  subtitle: string;
  items: Product[];
  ai?: boolean;
}) {
  return (
    <section id={id} className="py-16 md:py-20">
      <div className="max-w-[1320px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-ink tracking-tight">{title}</h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-3xl">
            {subtitle}{" "}
            <a className="text-zoom-blue font-medium hover:underline cursor-pointer">Learn more</a>
          </p>
        </motion.div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((p, i) => (
            <Card key={p.slug} p={p} index={i} ai={ai} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Products() {
  return (
    <div className="bg-white">
      <Navbar />

      <div className="pt-28" />
      <Section
        id="workplace"
        title="Workplace products"
        subtitle="Connect smarter with tools built into an AI-first collaboration platform."
        items={workplace}
      />
      <Section
        id="business"
        title="Business Services products"
        subtitle="Deliver personalized and seamless customer experiences."
        items={business}
      />
      <Section
        id="ai-products"
        title="Zoom AI"
        subtitle="Get more done with built-in AI that helps you move work forward."
        items={ai}
        ai
      />
      <Section
        id="developer"
        title="Developer Ecosystem platform and tools"
        subtitle="Enable seamless workflows with Zoom's developer platform and tools."
        items={developer}
      />
      <Footer />
    </div>
  );
}
