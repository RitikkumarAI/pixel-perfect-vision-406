import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Key, Apple } from "lucide-react";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/signin")({
  component: SignInPage,
  head: () => ({
    meta: [
      { title: "Sign In" },
      { name: "description", content: "Sign in to your account." },
    ],
  }),
});

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [banner, setBanner] = useState(true);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white text-ink flex flex-col">
      {/* Top bar */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-black/5">
        <Link to="/" className="text-zoom-blue">
          <Logo />
        </Link>
        <nav className="flex items-center gap-6 text-[15px]">
          <span className="text-ink/80">
            New here?{" "}
            <a className="text-zoom-blue font-semibold hover:underline" href="#">
              Sign Up Free
            </a>
          </span>
          <a className="text-zoom-blue font-semibold hover:underline" href="#">Support</a>
          <button className="text-zoom-blue font-semibold inline-flex items-center gap-1">
            English <span className="text-xs">▾</span>
          </button>
        </nav>
      </header>

      {banner && (
        <div className="bg-blue-50/60 border-b border-blue-100 px-8 py-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-ink/80">
            <span className="inline-grid place-items-center w-5 h-5 rounded-full bg-zoom-blue text-white text-[11px]">i</span>
            You may stay signed in longer on this device.{" "}
            <a className="text-zoom-blue font-semibold hover:underline" href="#">Learn more</a>
          </div>
          <button onClick={() => setBanner(false)} className="text-ink/50 hover:text-ink">✕</button>
        </div>
      )}

      {/* Body */}
      <main className="flex-1 grid lg:grid-cols-2">
        {/* Left promo */}
        <div className="hidden lg:flex items-center justify-center bg-slate-50 p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative w-full max-w-[560px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white"
          >
            <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4), transparent 40%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.5), transparent 50%)",
            }} />
            <motion.div
              animate={{ rotate: [0, 6, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -left-16 w-72 h-72 rounded-full bg-cyan-300/30 blur-2xl"
            />
            <div className="relative h-full p-10 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="font-black tracking-wide text-2xl">VISION CRAFT</div>
                <div className="rounded-full w-20 h-20 grid place-items-center border-2 border-cyan-200/70 text-cyan-100 text-[11px] text-center leading-tight font-semibold">
                  APAC<br />11 June<br />2026
                </div>
              </div>
              <div>
                <div className="font-black text-5xl leading-[1.05] tracking-tight italic">
                  Creator<br />Remix
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold">Reboot your virtual events.</div>
                <div className="text-lg font-semibold mb-5">Pump up the human connection.</div>
                <button className="px-5 py-2 rounded-md bg-cyan-300 text-blue-900 font-semibold hover:bg-cyan-200 transition">
                  Register now
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right form */}
        <div className="flex items-start justify-center p-8 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[440px] mt-8"
          >
            <h1 className="text-[40px] font-bold text-center mb-8">Sign in</h1>

            <form onSubmit={handleSignIn}>
              <label className="block mb-4">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or phone number"
                  className="w-full px-4 py-3.5 rounded-md border border-black/20 text-[15px] focus:outline-none focus:border-zoom-blue focus:ring-2 focus:ring-zoom-blue/20 transition"
                  required
                />
              </label>
              
              <label className="block mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3.5 rounded-md border border-black/20 text-[15px] focus:outline-none focus:border-zoom-blue focus:ring-2 focus:ring-zoom-blue/20 transition"
                  required
                />
              </label>
              
              {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

              <button type="submit" className="w-full mt-4 py-3.5 rounded-md bg-zoom-blue text-white font-semibold text-[16px] hover:bg-zoom-blue-hover active:scale-[0.99] transition">
                Sign In
              </button>
            </form>

            <div className="relative my-7 text-center text-sm text-ink/60">
              <span className="bg-white px-3 relative z-10">Or sign in with</span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-black/10" />
            </div>

            <div className="grid grid-cols-5 gap-3">
              {[
                { label: "SSO", icon: <Key className="w-5 h-5" /> },
                { label: "Apple", icon: <Apple className="w-5 h-5" /> },
                { label: "Google", icon: <GoogleG /> },
                { label: "Facebook", icon: <FacebookF /> },
                { label: "Microsoft", icon: <MicrosoftSquares /> },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={(e) => {
                    if (p.label === "SSO") {
                      e.preventDefault();
                      window.location.href = "http://localhost:5005/api/v1/auth/saml";
                    }
                  }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <span className="w-14 h-14 rounded-2xl border border-black/10 grid place-items-center shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all bg-white">
                    {p.icon}
                  </span>
                  <span className="text-[13px] text-ink/80">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="text-center mt-10">
              <a href="#" className="text-zoom-blue font-semibold hover:underline text-[15px]">
                Forgot email?
              </a>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-[13px]">
              <a className="text-zoom-blue hover:underline" href="#">Help</a>
              <a className="text-zoom-blue hover:underline" href="#">Terms</a>
              <a className="text-zoom-blue hover:underline" href="#">Privacy</a>
            </div>

            <p className="text-center text-xs text-ink/60 mt-6 leading-relaxed">
              This site is protected by reCAPTCHA and the Google{" "}
              <a className="text-zoom-blue hover:underline" href="#">Privacy Policy</a> and{" "}
              <a className="text-zoom-blue hover:underline" href="#">Terms of Service</a> apply.
            </p>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-black/5 py-4 text-center text-xs text-ink/60">
        Built by <span className="font-semibold text-ink">Infinite Technologies</span>
      </footer>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/>
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/>
      <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6z"/>
      <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.6 9.4 5.9 12 5.9z"/>
    </svg>
  );
}

function FacebookF() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path fill="#1877F2" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/>
    </svg>
  );
}

function MicrosoftSquares() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <rect x="2" y="2" width="9" height="9" fill="#F25022"/>
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00"/>
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF"/>
      <rect x="13" y="13" width="9" height="9" fill="#FFB900"/>
    </svg>
  );
}