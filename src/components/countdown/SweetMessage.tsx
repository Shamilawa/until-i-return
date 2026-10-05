"use client";

import { AnimatePresence, motion } from "motion/react";
import { useNow } from "@/lib/use-now";

const ROTATE_MS = 8000;

export function SweetMessage({ messages }: { messages: string[] }) {
  const now = useNow();
  if (messages.length === 0) return null;
  const index = now === null ? 0 : Math.floor(now / ROTATE_MS) % messages.length;

  return (
    <div className="flex min-h-14 items-center justify-center px-4 text-center" aria-live="off">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          className="font-display text-lg text-ink"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5 }}
        >
          “{messages[index]}”
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
