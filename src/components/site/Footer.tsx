import { Logo } from "./Logo";

export function Footer() {
  const cols = [
    { h: "Product", items: ["Meetings", "Chat", "Phone", "Mail & Calendar", "Scheduler", "Whiteboard"] },
    { h: "Solutions", items: ["Education", "Healthcare", "Government", "Financial Services", "Retail"] },
    { h: "Resources", items: ["Blog", "Developer", "Marketplace", "Trust Center", "Customers"] },
    { h: "Company", items: ["About", "Careers", "Newsroom", "Investors", "Contact"] },
  ];
  return (
    <footer className="bg-navy-deep text-white/80">
      <div className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Logo className="text-white" />
          <p className="text-sm mt-4 text-white/60">One platform to connect.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h5 className="font-bold text-white mb-4">{c.h}</h5>
            <ul className="space-y-2 text-sm">
              {c.items.map((i) => (
                <li key={i}><a className="hover:text-white" href="#">{i}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © 2026 Zoom · Designed with care.
      </div>
    </footer>
  );
}
