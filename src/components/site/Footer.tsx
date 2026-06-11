import { ChevronDown, Download } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  const cols = [
    {
      h: "About",
      items: ["Blog", "Customers", "Our Team", "Careers", "Integrations", "Partners", "Investors"],
    },
    {
      h: "Download",
      items: ["Workplace App", "Rooms App", "Rooms Controller", "Browser Extension", "Outlook Plug-in", "iPhone/iPad App", "Android App"],
    },
    {
      h: "Sales",
      items: ["+1.888.799.9666", "Contact Sales", "Plans & Pricing", "Request a Demo", "Webinars and Events", "Experience Center"],
    },
    {
      h: "Support",
      items: ["Test Connection", "Account", "Support Center", "Learning Center", "Community", "Technical Library", "Feedback"],
    },
  ];
  return (
    <footer className="bg-navy-deep text-white/75">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-20 lg:grid-cols-[280px_1fr]">
        <div>
          <Logo className="text-white" />
          <div className="mt-8 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Download Center</div>
              <div className="text-xs text-white/60">Get the most out of the platform</div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 transition hover:bg-white/10">
              English <ChevronDown className="h-4 w-4" />
            </button>
            <button className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 transition hover:bg-white/10">
              US Dollar $ <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {cols.map((c) => (
            <div key={c.h}>
              <h5 className="mb-5 text-base font-semibold text-white">{c.h}</h5>
              <ul className="space-y-3 text-sm">
                {c.items.map((i) => (
                  <li key={i}>
                    <a
                      className="relative inline-block text-white/70 transition-colors hover:text-white"
                      href="#"
                    >
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/60">
        © 2026 · The website is built by <span className="font-semibold text-white">Infinite Technologies</span>.
      </div>
    </footer>
  );
}
