import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { MagneticButton } from "./MagneticButton";
import { useMeeting } from "../../hooks/useMeeting";

export function Hero() {
  const { createMeeting, isLoading } = useMeeting();

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0c1f66_0%,#18307f_14%,#2648b1_52%,#6f81db_84%,#f6f8ff_100%)] pt-24 text-white md:pt-28">
      <div className="absolute inset-x-0 top-[72px] z-10 mx-auto hidden max-w-[1320px] px-6 lg:block">
        <div className="flex items-center justify-center rounded-[20px] bg-white/10 px-6 py-3 text-center text-[17px] font-medium text-white/92 ring-1 ring-white/10 backdrop-blur-sm">
          <span>Introducing ZoomMate, your AI teammate.</span>
          <button
            onClick={() => createMeeting("Instant Team Meeting")}
            disabled={isLoading}
            className="ml-6 rounded-full bg-[linear-gradient(90deg,#2f72ff_0%,#ff4a84_100%)] px-5 py-1.5 font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {isLoading ? "Starting Secure Room..." : "Start an Instant Meeting"}
          </button>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1260px] px-6 pb-[188px] pt-[120px] text-center md:pb-[208px] md:pt-[138px] lg:pb-[228px] lg:pt-[152px]">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="mx-auto max-w-[980px] text-[48px] font-bold leading-[0.94] tracking-tight md:text-[76px] lg:text-[88px]"
        >
          <span>Connect conversations</span>
          <br />
          <span>to real progress</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mx-auto mt-6 max-w-[820px] text-base text-white/86 md:text-[18px]"
        >
          Bring meetings, notes, calls, and workflows into one polished workspace built to move
          teams from discussion to action.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <MagneticButton
            href="#product-carousel"
            className="inline-block rounded-[18px] bg-navy-deep px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_16px_40px_-18px_rgba(0,0,0,0.6)]"
          >
            Explore products
          </MagneticButton>
          <MagneticButton
            href="/pricing"
            className="inline-block rounded-[18px] bg-white px-7 py-3.5 text-[15px] font-semibold text-navy-deep shadow-[0_12px_30px_-20px_rgba(7,18,58,0.45)]"
          >
            Find your plan
          </MagneticButton>
        </motion.div>
        <div className="mt-14 flex flex-col items-center gap-1 text-xs text-white/64 md:mt-16">
          <span className="tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 scroll-cue" />
        </div>
      </div>
    </section>
  );
}
