"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = { photoIds: string[]; startIndex: number; onClose: () => void };

const SWIPE_DISTANCE = 60;

/** Full-screen photo viewer: swipe or use the arrows, tap the backdrop or Esc to close. */
export function Lightbox({ photoIds, startIndex, onClose }: Props) {
  const [[index, direction], setPosition] = useState<[number, number]>([startIndex, 0]);
  const many = photoIds.length > 1;

  const step = useCallback(
    (by: number) => setPosition(([i]) => [(i + by + photoIds.length) % photoIds.length, by]),
    [photoIds.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, step]);

  // Rendered into <body> so the glassy cards' backdrop filter cannot trap the fixed overlay.
  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${photoIds.length}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1638]/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.img
          key={photoIds[index]}
          src={`/api/photos/${photoIds[index]}`}
          alt=""
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d * 120, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d * -120, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          drag={many ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(_, info) => {
            if (info.offset.x < -SWIPE_DISTANCE) step(1);
            else if (info.offset.x > SWIPE_DISTANCE) step(-1);
          }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[82dvh] max-w-[94vw] touch-pan-y rounded-2xl object-contain shadow-soft"
          draggable={false}
        />
      </AnimatePresence>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-2xl text-white"
      >
        ×
      </button>

      {many && (
        <>
          <Arrow side="left" onClick={() => step(-1)} />
          <Arrow side="right" onClick={() => step(1)} />
          <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex gap-2" aria-hidden>
            {photoIds.map((id, i) => (
              <span key={id} className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/35"}`} />
            ))}
          </div>
        </>
      )}
    </motion.div>,
    document.body,
  );
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-2xl text-white ${
        side === "left" ? "left-2" : "right-2"
      }`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
