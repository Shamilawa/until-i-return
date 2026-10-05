"use client";

import { format, parseISO } from "date-fns";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Lightbox } from "./Lightbox";

export type TimelineItem = {
  id: string;
  happenedOn: string;
  title: string;
  caption: string | null;
  location: string | null;
  addedBy: string;
  photoIds: string[];
  /** Divider shown above this entry when it starts a new chapter. */
  chapter: string | null;
  /** Label for the manage link, or null when this person may not change the entry. */
  manageLabel: string | null;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  const [viewing, setViewing] = useState<{ photoIds: string[]; index: number } | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <ol className="relative ml-2 flex flex-col gap-5 border-l-2 border-dashed border-white/90 pb-2 pl-5">
        {items.map((item) => (
          <motion.li
            key={item.id}
            className="relative"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
          >
            {item.chapter && (
              <p className="-ml-9 mb-4 inline-block rounded-full border border-white/90 bg-white/80 px-4 py-1 font-display text-sm font-medium text-ink shadow-soft">
                {item.chapter}
              </p>
            )}
            <span aria-hidden className="absolute -left-[1.85rem] mt-5 h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-deep" />
            <article className="card p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                {format(parseISO(item.happenedOn), "d MMMM yyyy")}
              </p>
              <h2 className="font-display text-xl font-semibold text-ink">{item.title}</h2>
              {item.location && (
                <p className="mt-0.5 text-sm text-ink-soft">
                  <span aria-hidden>📍 </span>
                  {item.location}
                </p>
              )}
              {item.photoIds.length > 0 && (
                <PhotoGrid photoIds={item.photoIds} onOpen={(index) => setViewing({ photoIds: item.photoIds, index })} />
              )}
              {item.caption && <p className="mt-3 whitespace-pre-line leading-7 text-ink">{item.caption}</p>}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-ink-soft">Added by {item.addedBy}</p>
                {item.manageLabel && (
                  <Link href={`/story/${item.id}`} className="-my-2 flex min-h-11 items-center px-2 text-sm font-semibold text-rose-deep">
                    {item.manageLabel}
                  </Link>
                )}
              </div>
            </article>
          </motion.li>
        ))}
      </ol>

      <AnimatePresence>
        {viewing && <Lightbox photoIds={viewing.photoIds} startIndex={viewing.index} onClose={() => setViewing(null)} />}
      </AnimatePresence>
    </MotionConfig>
  );
}

function PhotoGrid({ photoIds, onOpen }: { photoIds: string[]; onOpen: (index: number) => void }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {photoIds.map((id, i) => {
        // An odd one out leads the grid at full width.
        const wide = i === 0 && photoIds.length % 2 === 1;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`Open photo ${i + 1} of ${photoIds.length}`}
            className={`overflow-hidden rounded-2xl bg-white/60 transition-transform active:scale-[0.97] ${
              wide ? "col-span-2 aspect-4/3" : "aspect-square"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/photos/${id}`} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        );
      })}
    </div>
  );
}
