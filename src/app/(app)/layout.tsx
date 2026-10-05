import { SkyBackground } from "@/components/sky/SkyBackground";
import { TabBar } from "@/components/ui/TabBar";
import { requireRole } from "@/server/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const role = await requireRole();
  return (
    <>
      <SkyBackground />
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))]">
        {children}
      </main>
      <TabBar role={role} />
    </>
  );
}
