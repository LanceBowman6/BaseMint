"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function BottomNav<T extends string>({
  items,
  active,
  onChange,
}: {
  items: readonly { id: T; label: string; icon: LucideIcon }[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-cyan-200/15 bg-[#06101d]/95 px-3 py-2 backdrop-blur sm:max-w-2xl">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "flex h-12 flex-col items-center justify-center rounded-lg text-[10px] font-bold transition",
                selected ? "bg-base-blue text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              <Icon className="mb-1 h-4 w-4" />
              <span className="truncate">{item.label === "My Collection" ? "Collection" : item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
