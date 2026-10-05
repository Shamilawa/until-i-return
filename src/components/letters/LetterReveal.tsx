"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { openLetter } from "@/server/actions";
import { WaxSeal } from "./Envelope";

type Props = {
  letterId: string;
  /** True the first time: shows the sealed envelope and plays the opening. */
  sealed: boolean;
  children: ReactNode;
};

type Stage = "sealed" | "opening" | "open";

export function LetterReveal({ letterId, sealed, children }: Props) {
  // Opening marks the letter read, which re-renders this page with sealed=false;
  // remember how it started so the entrance animation does not change midway.
  const [wasSealed] = useState(sealed);
  const [stage, setStage] = useState<Stage>(wasSealed ? "sealed" : "open");

  function breakSeal() {
    if (stage !== "sealed") return;
    setStage("opening");
    void openLetter(letterId);
    setTimeout(() => setStage("open"), 1500);
  }

  return (
    <AnimatePresence mode="wait">
      {stage === "open" ? (
        <motion.div
          key="letter"
          initial={wasSealed ?{ opacity: 0, y: 40, scale: 0.94 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 20 }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="envelope"
          className="flex min-h-[60vh] flex-col items-center justify-center gap-6"
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            onClick={breakSeal}
            aria-label="Open the letter"
            className="w-full max-w-72 cursor-pointer rounded-3xl p-2 focus-visible:outline-2 focus-visible:outline-rose-deep"
          >
            <OpeningEnvelope opening={stage === "opening"} />
          </button>
          <p className="font-display text-lg text-ink">
            {stage === "opening" ? "Opening…" : "Tap the seal to open 💌"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OpeningEnvelope({ opening }: { opening: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 240 220"
      className="w-full overflow-visible"
      animate={opening ? { y: 0 } : { y: [0, -6, 0] }}
      transition={opening ? { duration: 0.2 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* glow */}
      <ellipse cx="120" cy="150" rx="110" ry="70" fill="#f2b63c" opacity="0.18" />
      {/* back of the envelope */}
      <rect x="20" y="80" width="200" height="120" rx="12" fill="#f6e3c3" stroke="#e2cca8" strokeWidth="2" />
      {/* opened flap, standing up behind the letter */}
      <motion.path
        d="M22 84 L218 84 L120 16 Z"
        fill="#fbe9cd"
        stroke="#e2cca8"
        strokeWidth="2"
        strokeLinejoin="round"
        style={{ transformOrigin: "120px 84px", transformBox: "view-box" }}
        initial={false}
        animate={opening ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
        transition={{ delay: 0.45, duration: 0.25, ease: "easeOut" }}
      />
      {/* the letter rising out */}
      <motion.g
        initial={false}
        animate={opening ? { y: -70, opacity: 1 } : { y: 0, opacity: 0 }}
        transition={{ delay: 0.55, type: "spring", stiffness: 120, damping: 14 }}
      >
        <rect x="44" y="92" width="152" height="96" rx="6" fill="#fffdf8" stroke="#e9d9bd" strokeWidth="1.5" />
        <path d="M60 114h120M60 132h120M60 150h80" stroke="#e3cfae" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      {/* front pocket */}
      <path d="M20 92 L120 160 L220 92 L220 188 Q220 200 208 200 L32 200 Q20 200 20 188 Z" fill="#fff5e2" stroke="#e2cca8" strokeWidth="2" strokeLinejoin="round" />
      {/* closed flap: folds away, then the opened flap above takes over */}
      <motion.path
        d="M22 84 L218 84 L120 152 Z"
        fill="#fbe9cd"
        stroke="#e2cca8"
        strokeWidth="2"
        strokeLinejoin="round"
        style={{ transformOrigin: "120px 84px", transformBox: "view-box" }}
        initial={false}
        animate={opening ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.25, ease: "easeIn" }}
      />
      {/* wax seal pops off */}
      <motion.g
        initial={false}
        animate={opening ? { scale: 1.6, opacity: 0, rotate: 25 } : { scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: "120px 146px", transformBox: "view-box" }}
      >
        <g transform="translate(120 146) scale(1.9)">
          <WaxSeal cx={0} cy={0} />
        </g>
      </motion.g>
    </motion.svg>
  );
}
