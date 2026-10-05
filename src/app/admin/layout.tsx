import Link from "next/link";
import { SkyBackground } from "@/components/sky/SkyBackground";
import { TabBar } from "@/components/ui/TabBar";
import { requireAuthor } from "@/server/session";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAuthor();
  return (
    <>
      <SkyBackground />
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <nav className="flex gap-2" aria-label="Admin">
          <Link href="/admin" className="btn btn-soft flex-1">
            Letters
          </Link>
          <Link href="/admin/settings" className="btn btn-soft flex-1">
            Settings
          </Link>
        </nav>
        {children}
      </main>
      <TabBar role="author" />
    </>
  );
}
