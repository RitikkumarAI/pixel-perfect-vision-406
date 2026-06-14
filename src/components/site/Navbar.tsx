import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  ChevronDown,
  Sparkles,
  Video,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  PenSquare,
  Layout,
  Film,
  Globe2,
  Building2,
  GraduationCap,
  HeartPulse,
  Factory,
  ShoppingBag,
  Headset,
  Radio,
  Code2,
  Plug,
  FileText,
  Presentation,
  Sheet,
  StickyNote,
  Grid3x3,
  Mic2,
  ChevronRight,
  X,
  Users,
  Bot
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../../hooks/useAuth";
import { useWorkspaces } from "../../hooks/useWorkspace";

type MenuKey = "products" | "ai" | "solutions" | "meet" | "launcher" | null;

const navItem =
  "px-3 py-2 text-[15px] font-medium text-white/90 hover:text-white inline-flex items-center gap-1 rounded-md transition-colors";

export function Navbar() {
  const [open, setOpen] = useState<MenuKey>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const { isAuthenticated, logout } = useAuth();
  const { activeWorkspace } = useWorkspaces();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const enter = (k: MenuKey) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(k);
  };
  const leave = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(null), 120);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy-deep/90 backdrop-blur-xl border-b border-white/5"
          : "bg-navy-deep/70 backdrop-blur-md"
      }`}
      onMouseLeave={leave}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-6">
        <Link to="/" className="text-white shrink-0">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <button
            className={navItem}
            onMouseEnter={() => enter("products")}
            onClick={() => setOpen(open === "products" ? null : "products")}
          >
            Products <ChevronDown className="w-4 h-4" />
          </button>
          <button
            className={navItem}
            onMouseEnter={() => enter("ai")}
            onClick={() => setOpen(open === "ai" ? null : "ai")}
          >
            <Sparkles className="w-4 h-4 text-blue-300" /> AI{" "}
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            className={navItem}
            onMouseEnter={() => enter("solutions")}
            onClick={() => setOpen(open === "solutions" ? null : "solutions")}
          >
            Solutions <ChevronDown className="w-4 h-4" />
          </button>
          <Link to="/pricing" className={navItem} onMouseEnter={() => setOpen(null)}>
            Pricing
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button className="p-2 text-white/90 hover:text-white" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          <button
            className={navItem}
            onMouseEnter={() => enter("meet")}
            onClick={() => setOpen(open === "meet" ? null : "meet")}
          >
            Meet <ChevronDown className="w-4 h-4" />
          </button>
          
          {isAuthenticated ? (
            <>
              <button onClick={logout} className={navItem}>Log Out</button>
              <Link
                to="/"
                className="ml-2 px-4 py-2 rounded-full text-[14px] font-semibold bg-white text-navy-deep hover:bg-white/90 transition"
              >
                {activeWorkspace ? `Dashboard (${activeWorkspace.name})` : 'Dashboard'}
              </Link>
            </>
          ) : (
            <>
              <Link to="/signin" className={navItem}>Sign In</Link>
              <a className={navItem} href="#">Support</a>
              <Link
                to="/contact-sales"
                className="ml-2 px-4 py-2 rounded-full text-[14px] font-semibold bg-white text-navy-deep hover:bg-white/90 transition"
              >
                Contact Sales
              </Link>
              <Link
                to="/signin"
                className="px-4 py-2 rounded-full text-[14px] font-semibold bg-zoom-blue text-white hover:bg-zoom-blue-hover transition shadow-[0_0_0_0_rgba(96,165,250,0.6)] hover:shadow-[0_0_24px_0_rgba(96,165,250,0.5)]"
              >
                Sign Up Free
              </Link>
            </>
          )}

          <button
            className="ml-1 p-2 text-white/90 hover:text-white"
            aria-label="App launcher"
            onMouseEnter={() => enter("launcher")}
            onClick={() => setOpen(open === "launcher" ? null : "launcher")}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open === "products" && (
          <MegaPanel onMouseEnter={() => enter("products")} onClose={() => setOpen(null)}>
            <ProductsMega />
          </MegaPanel>
        )}
        {open === "ai" && (
          <MegaPanel onMouseEnter={() => enter("ai")} onClose={() => setOpen(null)}>
            <AIMega />
          </MegaPanel>
        )}
        {open === "solutions" && (
          <MegaPanel onMouseEnter={() => enter("solutions")} onClose={() => setOpen(null)}>
            <SolutionsMega />
          </MegaPanel>
        )}
        {open === "meet" && (
          <SmallDropdown onMouseEnter={() => enter("meet")}>
            <a className="dd-item" href="#">Join a meeting</a>
            <a className="dd-item" href="#">Host a meeting</a>
            <a className="dd-item" href="#">Download app</a>
          </SmallDropdown>
        )}
        {open === "launcher" && (
          <LauncherPanel onMouseEnter={() => enter("launcher")} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>

      <style>{`
        .dd-item { display:block; padding: 10px 16px; color:#0b1024; font-weight:500; font-size:15px; }
        .dd-item:hover { color: var(--zoom-blue); }
      `}</style>
    </header>
  );
}

function MegaPanel({
  children,
  onMouseEnter,
  onClose,
}: {
  children: React.ReactNode;
  onMouseEnter: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
      className="absolute left-4 right-4 top-[68px] mx-auto max-w-[1280px] bg-white text-ink rounded-3xl shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] border border-black/5 overflow-hidden"
      onMouseEnter={onMouseEnter}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
      {children}
    </motion.div>
  );
}

function SmallDropdown({
  children,
  onMouseEnter,
}: {
  children: React.ReactNode;
  onMouseEnter: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      onMouseEnter={onMouseEnter}
      className="absolute right-[260px] top-[60px] w-56 bg-white rounded-2xl py-2 shadow-xl border border-black/5"
    >
      {children}
    </motion.div>
  );
}

function ProductsMega() {
  const cats = [
    { label: "Zoom Workplace", active: true },
    { label: "Zoom Business Services" },
    { label: "Zoom AI" },
    { label: "Developers" },
    { label: "Apps and Integrations" },
  ];
  const items = [
    { icon: Video, label: "Meetings", featured: true },
    { icon: Globe2, label: "Hub" },
    { icon: MessageSquare, label: "Chat" },
    { icon: Film, label: "Video Management" },
    { icon: Phone, label: "Phone" },
    { icon: Building2, label: "Rooms" },
    { icon: Mail, label: "Mail & Calendar" },
    { icon: Calendar, label: "Workspace Reservation" },
    { icon: Calendar, label: "Scheduler" },
    { icon: Radio, label: "Digital Signage" },
    { icon: PenSquare, label: "Canvas" },
    { icon: Headset, label: "Visitor Management" },
    { icon: Layout, label: "Whiteboard" },
    { icon: Mic2, label: "Workvivo" },
    { icon: Film, label: "Clips" },
  ];
  return (
    <div className="grid grid-cols-[260px_1fr_360px] gap-8 p-8">
      <ul className="space-y-1">
        {cats.map((c) => (
          <li key={c.label}>
            <button
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-semibold transition ${
                c.active ? "bg-blue-50 text-ink" : "hover:bg-black/[0.03]"
              }`}
            >
              {c.label}
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>
          </li>
        ))}
      </ul>
      <div>
        <h3 className="text-2xl font-bold">Zoom Workplace</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          Collaboration tools in an AI-first work platform.{" "}
          <a className="text-zoom-blue underline">Learn more</a>
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-black/5 pt-4">
          {items.map((it, i) => (
            <a
              key={i}
              href="#"
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                it.featured ? "ring-1 ring-zoom-blue/60" : "hover:bg-black/[0.03]"
              }`}
            >
              <span className="w-9 h-9 rounded-lg bg-zoom-blue text-white grid place-items-center shadow-sm group-hover:scale-110 transition">
                <it.icon className="w-4 h-4" />
              </span>
              <span className="font-semibold text-[15px]">{it.label}</span>
            </a>
          ))}
        </div>
      </div>
      <MegaPromoCard />
    </div>
  );
}

function AIMega() {
  const main = [
    { icon: Sparkles, label: "ZoomMate", featured: true },
    { icon: Code2, label: "API Services" },
    { icon: StickyNote, label: "My Notes" },
  ];
  const suite = [
    { icon: FileText, label: "Docs", link: "/docs/new" },
    { icon: Users, label: "Chat", link: "/chat" },
    { icon: Bot, label: "AI Agents", link: "/agents" },
    { icon: Calendar, label: "Scheduling", link: "/scheduling" },
    { icon: Video, label: "Videos", link: "/video" },
    { icon: Sheet, label: "Sheets" },
    { icon: Presentation, label: "Slides" },
    { icon: FileText, label: "Tasks", link: "/tasks" },
  ];
  return (
    <div className="grid grid-cols-[260px_1fr_360px] gap-8 p-8">
      <ul className="space-y-1">
        <li>
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-semibold bg-blue-50">
            AI at Zoom <ChevronRight className="w-4 h-4 opacity-60" />
          </button>
        </li>
        <li>
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-semibold hover:bg-black/[0.03]">
            AI Resources <ChevronRight className="w-4 h-4 opacity-60" />
          </button>
        </li>
      </ul>
      <div>
        <h3 className="text-2xl font-bold">AI at Zoom</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          AI that turns conversations into action.{" "}
          <a className="text-zoom-blue underline">Learn more</a>
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-black/5 pt-4">
          {main.map((it, i) => (
            <a
              key={i}
              href="#"
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                it.featured ? "ring-1 ring-zoom-blue/60" : "hover:bg-black/[0.03]"
              }`}
            >
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white grid place-items-center">
                <it.icon className="w-4 h-4" />
              </span>
              <span className="font-semibold text-[15px]">{it.label}</span>
            </a>
          ))}
        </div>
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-md bg-gradient-to-br from-fuchsia-500 to-indigo-500 grid place-items-center">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <h4 className="font-bold text-[17px]">AI Productivity Suite</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Turn inspired discussions into impressive deliverables.{" "}
            <a className="text-zoom-blue underline">Learn more</a>
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {suite.map((it, i) => (
              <a key={i} href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/[0.03]">
                <span className="w-8 h-8 rounded-lg bg-zoom-blue text-white grid place-items-center">
                  <it.icon className="w-4 h-4" />
                </span>
                <span className="font-semibold text-[15px]">{it.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <MegaPromoCard />
    </div>
  );
}

function SolutionsMega() {
  const Col = ({
    title,
    sub,
    items,
    extraTitle,
    extra,
  }: {
    title: string;
    sub?: string;
    items: string[];
    extraTitle?: string;
    extra?: string[];
  }) => (
    <div>
      <h4 className="text-[17px] font-bold flex items-center justify-between border-b border-black/10 pb-3">
        {title} <ChevronRight className="w-4 h-4 opacity-60" />
      </h4>
      {sub && <div className="text-xs uppercase tracking-wider text-muted-foreground mt-4">{sub}</div>}
      <ul className="mt-3 space-y-2.5">
        {items.map((i) => (
          <li key={i}>
            <a href="#" className="text-[15px] font-medium hover:text-zoom-blue">
              {i}
            </a>
          </li>
        ))}
      </ul>
      {extraTitle && (
        <div className="mt-6">
          <h5 className="text-[17px] font-bold mb-3">{extraTitle}</h5>
          <ul className="space-y-2.5">
            {extra!.map((i) => (
              <li key={i}>
                <a href="#" className="text-[15px] font-medium hover:text-zoom-blue">
                  {i}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
  return (
    <div className="grid grid-cols-4 gap-8 p-8">
      <Col
        title="By industry"
        items={[
          "Education",
          "Financial Services",
          "Government",
          "Healthcare",
          "Manufacturing",
          "Retail",
          "Frontline",
          "Broadcast",
        ]}
      />
      <Col
        title="By audience"
        items={["Small and midsize business"]}
        extraTitle="Enterprise"
        extra={[
          "Information Technology",
          "Customer Experience",
          "Sales and Revenue",
          "Facilities",
          "Marketing and Events",
        ]}
      />
      <Col
        title="For Developer"
        sub="Build"
        items={["Video SDK", "Co-Browse", "API Services"]}
        extraTitle="Integrate"
        extra={["Zoom Marketplace", "MCP", "Realtime Media Streams", "APIs", "Zoom Apps", "Meeting SDK"]}
      />
      <Col
        title="For partners"
        items={[
          "Partner Solutions",
          "Find a Partner",
          "Become a Partner",
          "Partner Portal",
          "Partner Learning Center",
        ]}
      />
    </div>
  );
}

function MegaPromoCard() {
  return (
    <div className="rounded-2xl border border-black/5 bg-gradient-to-br from-slate-50 to-blue-50/40 p-5">
      <div className="rounded-xl overflow-hidden bg-navy-deep aspect-[16/10] grid place-items-center text-white/80 text-sm">
        <div className="text-center px-4">
          <div className="text-xs uppercase tracking-widest text-white/60 mb-2">Featured</div>
          <div className="font-semibold">Q3 Campaign Planning</div>
        </div>
      </div>
      <div className="mt-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-zoom-blue text-xs font-semibold">
          🚀 NEW
        </span>
        <h5 className="mt-2 font-bold">My Notes, your AI note taker</h5>
        <p className="text-sm text-muted-foreground mt-1">
          Automatically captures, summarizes, and extracts action items from any meeting.
        </p>
        <a className="text-zoom-blue text-sm font-semibold inline-block mt-2 underline">
          Learn more
        </a>
      </div>
    </div>
  );
}

function LauncherPanel({
  onMouseEnter,
  onClose,
}: {
  onMouseEnter: () => void;
  onClose: () => void;
}) {
  const workplace = [
    { icon: Video, label: "Meetings" },
    { icon: MessageSquare, label: "Chat" },
    { icon: Phone, label: "Phone" },
    { icon: Mail, label: "Mail & Calendar" },
    { icon: Calendar, label: "Scheduler" },
    { icon: Layout, label: "Whiteboard" },
    { icon: Film, label: "Clips" },
    { icon: Globe2, label: "Marketplace" },
  ];
  const services = [
    { icon: Headset, label: "Contact Center" },
    { icon: Sparkles, label: "CX Insights" },
    { icon: Mic2, label: "Virtual Agent" },
    { icon: Calendar, label: "Webinars & Events" },
    { icon: Sparkles, label: "Revenue Accelerator" },
    { icon: Building2, label: "Workforce Engagement" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: -8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 20, y: -8 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
      className="absolute right-6 top-[68px] w-[420px] bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden"
    >
      <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/5">
        <X className="w-4 h-4" />
      </button>
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg">Zoom Workplace</h4>
          <Link to="/products" onClick={onClose} className="text-zoom-blue text-sm font-semibold hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {workplace.map((i) => (
            <a key={i.label} href="#" className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition">
              <span className="w-10 h-10 rounded-lg bg-zoom-blue text-white grid place-items-center"><i.icon className="w-5 h-5" /></span>
              <span className="text-xs font-semibold text-center leading-tight">{i.label}</span>
            </a>
          ))}
        </div>
        <h4 className="font-bold text-lg mt-6">Business Services</h4>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {services.map((i) => (
            <a key={i.label} href="#" className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition">
              <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white grid place-items-center"><i.icon className="w-5 h-5" /></span>
              <span className="text-xs font-semibold text-center leading-tight">{i.label}</span>
            </a>
          ))}
        </div>
        <Link to="/contact-sales" className="mt-6 block text-center py-3 rounded-full bg-zoom-blue text-white font-semibold hover:bg-zoom-blue-hover">
          Contact Sales
        </Link>
      </div>
    </motion.div>
  );
}
