import Markdown from "react-markdown";
import { PEOPLE } from "@/lib/config";

type Props = {
  title: string;
  body: string;
  /** Shown above the title, e.g. the day it was delivered. */
  dateLabel?: string;
  photoSrc?: string | null;
};

/** A letter on textured paper. Used for her view and for the author's live preview. */
export function PaperCard({ title, body, dateLabel, photoSrc }: Props) {
  return (
    <article className="paper">
      {dateLabel && <p className="mb-1 text-right text-sm italic opacity-70">{dateLabel}</p>}
      <h1 className="mb-4 font-display text-2xl font-semibold">{title}</h1>
      {photoSrc && (
        // Served by an authenticated route, so next/image optimisation is not used.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoSrc}
          alt=""
          className="mb-5 w-full -rotate-1 rounded-lg border-8 border-white object-cover shadow-soft"
        />
      )}
      <div className="letter-body">
        <Markdown>{body}</Markdown>
      </div>
      <p className="mt-6 text-right font-display text-lg">
        Yours always,
        <br />
        {PEOPLE.author.name} <span aria-hidden>♥</span>
      </p>
    </article>
  );
}
