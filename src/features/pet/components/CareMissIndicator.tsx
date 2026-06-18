"use client";

import { usePetStore } from "@/stores/pet-store";

export function CareMissIndicator() {
    const careMissCount = usePetStore((s) => s.pet.careMissCount);
    const level =
        careMissCount === 0
            ? "good"
            : careMissCount < 3
              ? "warn"
              : "bad";

    const color =
        level === "good"
            ? "text-emerald-400"
            : level === "warn"
              ? "text-amber-400"
              : "text-rose-400";

    return (
        <div className="flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-2">
            <span className="text-xs uppercase tracking-widest text-white/60">
                Care Miss
            </span>
            <span className={`font-mono text-base ${color}`}>{careMissCount}</span>
        </div>
    );
}
