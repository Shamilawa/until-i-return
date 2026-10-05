"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Role } from "@/lib/config";

type Tab = { href: string; label: string; icon: ReactNode; authorOnly?: boolean };

const TABS: Tab[] = [
  {
    href: "/",
    label: "Home",
    icon: <path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10M10 19.5v-5h4v5" />,
  },
  {
    href: "/letters",
    label: "Letters",
    icon: <path d="M3.5 6.5h17v11h-17zM3.5 7l8.5 6.5L20.5 7" />,
  },
  {
    href: "/admin",
    label: "Write",
    authorOnly: true,
    icon: <path d="M4 20l1-4.5L16.5 4l3.5 3.5L8.5 19 4 20zM14 6.5l3.5 3.5" />,
  },
];

export function TabBar({ role }: { role: Role }) {
  const pathname = usePathname();
  const tabs = TABS.filter((tab) => !tab.authorOnly || role === "author");

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <ul className="card mx-auto flex max-w-md items-stretch justify-around p-1.5">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl font-display text-xs transition-colors ${
                  active ? "bg-white/90 text-rose-deep shadow-soft" : "text-ink-soft"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {tab.icon}
                </svg>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
