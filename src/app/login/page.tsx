import { SkyBackground } from "@/components/sky/SkyBackground";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <>
      <SkyBackground />
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-6 px-6">
        <div className="text-center">
          <span className="inline-block animate-float text-5xl" aria-hidden>
            💌
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Until I&apos;m Home</h1>
          <p className="mt-1 text-ink-soft">This little world belongs to two people.</p>
        </div>
        <LoginForm />
      </main>
    </>
  );
}
