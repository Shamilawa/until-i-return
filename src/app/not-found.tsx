import Link from "next/link";
import { SkyBackground } from "@/components/sky/SkyBackground";

export default function NotFound() {
  return (
    <>
      <SkyBackground />
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="animate-float text-6xl" aria-hidden>
          ☁️
        </span>
        <h1 className="font-display text-2xl font-semibold text-ink">Nothing but clouds here</h1>
        <p className="text-ink-soft">This page doesn&apos;t exist, or isn&apos;t ready to be opened yet.</p>
        <Link href="/" className="btn btn-primary">
          Back home
        </Link>
      </main>
    </>
  );
}
