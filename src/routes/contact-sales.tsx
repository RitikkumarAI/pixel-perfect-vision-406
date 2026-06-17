import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/contact-sales")({
  head: () => ({
    meta: [
      { title: "Contact Sales | Zoom" },
      {
        name: "description",
        content: "Get in touch with our sales team to find the right plan for your organization.",
      },
      { property: "og:title", content: "Contact Sales | Zoom" },
      {
        property: "og:description",
        content: "Fill out the form to get in touch with a Zoom representative.",
      },
    ],
  }),
  component: ContactSales,
});

function ContactSales() {
  return (
    <div className="bg-background">
      <Navbar />
      <section className="pt-32 pb-24 bg-gradient-to-b from-white to-blue-50/40">
        <div className="max-w-[1280px] mx-auto px-6 grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl font-bold text-ink tracking-tight">Contact Sales</h1>
            <p className="mt-6 text-lg text-ink/80 max-w-md">
              Zoom keeps you and your team connected wherever you are, so you can get more done,
              together.
            </p>
            <p className="mt-4 text-lg text-ink/80 max-w-md">
              Fill out the form to get in touch with one of our representatives.
            </p>
            <h3 className="mt-10 text-xl font-bold">Questions? Give us a call</h3>
            <div className="mt-3 relative max-w-sm">
              <button className="w-full flex items-center justify-between rounded-2xl border border-ink/15 px-5 py-3.5 font-semibold">
                Select your country
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl bg-white border-2 border-emerald-400 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] p-8 md:p-10"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold leading-tight">
                Tell us a bit about
                <br />
                yourself
              </h2>
              <span className="text-xs text-muted-foreground">
                <span className="text-zoom-blue">*</span> Required Information
              </span>
            </div>
            <div className="mt-8 space-y-5">
              <Field label="Email *">
                <input type="email" className="w-full bg-transparent outline-none py-1" />
              </Field>
              <Select label="Nature of inquiry *" placeholder="-- Select an option --" />
              <Select label="Products of interest *" placeholder="-- Select all that apply --" />
              <Select label="Country *" placeholder="United States" />
              <Select label="Employee Count *" placeholder="-- Select an option --" />
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="px-8 py-3 rounded-full bg-zoom-blue text-white font-semibold hover:bg-zoom-blue-hover transition"
              >
                Continue
              </button>
            </div>
          </motion.form>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-xl border border-ink/15 px-4 pt-2 pb-2 focus-within:border-zoom-blue transition">
      <span className="text-xs font-semibold text-zoom-blue">{label}</span>
      {children}
    </label>
  );
}
function Select({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block rounded-xl border border-ink/15 px-4 pt-2 pb-2 focus-within:border-zoom-blue transition">
      <span className="text-xs font-semibold text-zoom-blue">{label}</span>
      <div className="flex items-center justify-between">
        <span className="text-ink/60">{placeholder}</span>
        <ChevronDown className="w-4 h-4 text-ink/50" />
      </div>
    </label>
  );
}
