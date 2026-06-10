import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Video as VideoIcon, Users, MessageSquare, Heart, Share2, Settings, MoreHorizontal, Sparkles } from "lucide-react";

const participants = [
  {
    name: "Marcus Reed",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Aisha Bowman",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Brian Ayers",
    img: "https://images.unsplash.com/photo-1559548331-f9cb98001426?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Owen Hale",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  },
];

const transcript = [
  { speakerIdx: 0, time: "00:04:18", text: "Just a reminder that we still need to follow up on the event options from last week.", bullet: "Follow up on event theme options" },
  { speakerIdx: 1, time: "00:05:02", text: "Yeah, especially the customer story angle — that one had the most pull.", bullet: "Strong interest in customer-story format" },
  { speakerIdx: 2, time: "00:06:41", text: "I can draft a short comparison doc by Friday if that helps the team decide.", bullet: "Draft comparison doc by Friday" },
  { speakerIdx: 3, time: "00:08:12", text: "Great — let's lock the budget and confirm the launch date in the next sync.", bullet: "Lock budget & confirm launch date" },
];

const TOTAL_DURATION = 12000; // ms — full transcript scrub length

function ParticipantTile({ p, active, index }: { p: typeof participants[number]; active: boolean; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-md"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 rounded-md ring-[3px] ring-inset ring-green-400"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
        <motion.img
          src={p.img}
          alt={p.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          animate={
            active
              ? { scale: [1, 1.02, 1.005, 1.015, 1], y: [0, -1, 0.5, -0.5, 0] }
              : { scale: [1, 1.008, 1], y: [0, -0.5, 0] }
          }
          transition={{ duration: active ? 2.2 : 7 + index * 0.6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* subtle shimmer */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)" }}
          animate={{ x: ["-50%", "50%"] }}
          transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute bottom-1.5 left-1.5 z-20 flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm sm:bottom-2 sm:left-2 sm:gap-1.5 sm:px-2 sm:py-1 sm:text-[11px]">
          <Mic className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="truncate max-w-[80px] sm:max-w-none">{p.name}</span>
        </div>

        <motion.div
          aria-hidden
          className="absolute bottom-1.5 right-1.5 z-20 flex items-end gap-[2px] sm:bottom-2 sm:right-2"
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="w-[3px] origin-bottom rounded-full bg-green-400"
              animate={
                active
                  ? { height: [3, 14, 5, 17, 4, 12, 6, 15, 3], opacity: [0.85, 1, 0.9, 1, 0.85] }
                  : { height: 3, opacity: 0.4 }
              }
              transition={{
                duration: 0.85 + i * 0.06,
                repeat: active ? Infinity : 0,
                delay: i * 0.06,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function NotesPanel({ lineIdx, typedChars, bulletsVisible }: { lineIdx: number; typedChars: number; bulletsVisible: number }) {
  const visibleLines = transcript.slice(0, lineIdx + 1);
  return (
    <motion.div
      initial={{ opacity: 0, x: 30, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
      className="relative w-full overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 sm:rounded-2xl"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <div className="text-xs font-medium text-slate-600">My Notes</div>
        <div className="w-10" />
      </div>

      <div className="space-y-3 px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900">[My Note] Q3 Marketing Kickoff</h4>
          <MoreHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
        </div>

        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-[11px]">
          <span>Transcript</span>
          <div className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            <Sparkles className="h-3 w-3 text-indigo-500" />
          </div>
        </div>

        <div className="min-h-[100px] space-y-2.5">
          {visibleLines.map((line, i) => {
            const p = participants[line.speakerIdx];
            const isCurrent = i === visibleLines.length - 1;
            const shown = isCurrent ? line.text.slice(0, typedChars) : line.text;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 sm:text-[11px]">
                  <img src={p.img} alt="" className="h-4 w-4 rounded-full object-cover" />
                  <span className="font-medium text-slate-700">{p.name}</span>
                  <span>{line.time}</span>
                </div>
                <p className="pl-[22px] text-[11px] leading-snug text-slate-600 sm:text-[11.5px]">
                  {shown}
                  {isCurrent && typedChars < line.text.length && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="ml-0.5 -mb-0.5 inline-block h-3 w-[2px] bg-indigo-500"
                    />
                  )}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 rounded-md bg-indigo-50 px-2.5 py-1.5">
          <Sparkles className="h-3 w-3 text-indigo-500" />
          <span className="text-[10px] font-medium text-indigo-700 sm:text-[10.5px]">AI generating notes</span>
          <div className="ml-auto flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1 w-1 rounded-full bg-indigo-500"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <AnimatePresence>
            {transcript.slice(0, bulletsVisible).map((t, i) => (
              <motion.div
                key={t.bullet}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 text-[11px] text-slate-700 sm:text-[11.5px]"
              >
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                <span>{t.bullet}</span>
                {i === bulletsVisible - 1 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-[10px] font-medium text-emerald-600">
                    new
                  </motion.span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export function NotesShowcase() {
  // progress 0..1 across full transcript
  const [progress, setProgress] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const startRef = useRef<number>(performance.now());
  const offsetRef = useRef<number>(0);

  // animation loop
  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      if (!scrubbing) {
        const elapsed = (now - startRef.current + offsetRef.current) % TOTAL_DURATION;
        setProgress(elapsed / TOTAL_DURATION);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrubbing]);

  // derive state from progress
  const { lineIdx, typedChars, bulletsVisible, activeSpeaker, timeLabel } = useMemo(() => {
    const segLen = 1 / transcript.length;
    const rawIdx = Math.min(transcript.length - 1, Math.floor(progress / segLen));
    const within = (progress - rawIdx * segLen) / segLen; // 0..1 within line
    const line = transcript[rawIdx];
    const typeFrac = Math.min(1, within / 0.75); // type during first 75% of segment
    const typed = Math.floor(line.text.length * typeFrac);
    const bullets = rawIdx + (within > 0.8 ? 1 : 0);
    const totalSec = Math.floor((progress * TOTAL_DURATION) / 1000) + 258;
    const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    return {
      lineIdx: rawIdx,
      typedChars: typed,
      bulletsVisible: Math.min(transcript.length, bullets),
      activeSpeaker: line.speakerIdx,
      timeLabel: `00:${mm}:${ss}`,
    };
  }, [progress]);

  const scrubRef = useRef<HTMLDivElement>(null);
  const setFromClientX = (clientX: number) => {
    const el = scrubRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    setProgress(p);
    offsetRef.current = p * TOTAL_DURATION;
    startRef.current = performance.now();
  };

  return (
    <section className="relative w-full bg-background px-4 py-16 sm:px-6 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between"
        >
          <div className="min-w-0">
            <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 bg-clip-text text-4xl font-extrabold leading-none tracking-tight text-transparent sm:text-5xl md:text-6xl">
              My Notes
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Your new AI note taker
            </h2>
          </div>
          <a
            href="#"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#0b5cff] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0a4fd6] sm:text-base"
          >
            Explore My Notes
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] md:rounded-[40px]"
          style={{ background: "linear-gradient(180deg, #cfe7fb 0%, #b6dcf7 45%, #d6ecf9 100%)" }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.9,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(190,222,247,0.35) 0%, rgba(190,222,247,0) 40%, rgba(255,255,255,0.15) 100%)",
            }}
          />

          <div className="relative px-4 py-10 sm:px-8 sm:py-16 md:px-12 md:py-24 lg:py-28">
            <div className="relative mx-auto w-full max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                whileHover={{ y: -4 }}
                className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-xl bg-[#1f2024] shadow-2xl ring-1 ring-black/10 sm:rounded-2xl md:rounded-[20px]"
              >
                <div className="flex items-center justify-between bg-[#2a2b30] px-3 py-1.5 sm:px-4 sm:py-2">
                  <div className="flex gap-1 sm:gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 sm:h-3 sm:w-3" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 sm:h-3 sm:w-3" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 sm:h-3 sm:w-3" />
                  </div>
                  <div className="text-[10px] font-medium text-slate-200 sm:text-xs">ⓘ Q3 Marketing Kickoff</div>
                  <div className="w-8 sm:w-12" />
                </div>

                <div className="grid grid-cols-2 gap-1 bg-black p-1 sm:gap-1.5 sm:p-1.5">
                  {participants.map((p, i) => (
                    <ParticipantTile key={p.name} p={p} active={i === activeSpeaker} index={i} />
                  ))}
                </div>

                {/* Scrubber */}
                <div className="bg-[#1f2024] px-3 pb-2 pt-2 sm:px-4">
                  <div
                    ref={scrubRef}
                    role="slider"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress * 100)}
                    tabIndex={0}
                    className="group relative h-2 cursor-pointer rounded-full bg-white/15"
                    onPointerDown={(e) => {
                      (e.target as HTMLElement).setPointerCapture(e.pointerId);
                      setScrubbing(true);
                      setFromClientX(e.clientX);
                    }}
                    onPointerMove={(e) => scrubbing && setFromClientX(e.clientX)}
                    onPointerUp={() => setScrubbing(false)}
                    onPointerCancel={() => setScrubbing(false)}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500"
                      style={{ width: `${progress * 100}%` }}
                    />
                    <div
                      className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow ring-2 ring-indigo-500"
                      style={{ left: `${progress * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{timeLabel}</span>
                    <span>Drag to scrub</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 bg-[#1f2024] py-2 text-slate-400 sm:gap-5 sm:py-3 md:gap-7">
                  {[Mic, VideoIcon, Users, MessageSquare, Heart, Share2, Settings, MoreHorizontal].map((Icon, i) => (
                    <Icon key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mt-4 w-full max-w-[280px] sm:max-w-[300px] md:absolute md:right-0 md:top-12 md:z-10 md:mt-0 md:max-w-[300px] lg:-right-6 lg:top-16 lg:max-w-[320px]"
              >
                <NotesPanel lineIdx={lineIdx} typedChars={typedChars} bulletsVisible={bulletsVisible} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
