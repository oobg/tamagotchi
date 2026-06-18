"use client";

import { usePetStore } from "@/stores/pet-store";

const ROWS: Array<{
    key: "hunger" | "happiness" | "energy" | "hygiene" | "health";
    label: string;
    color: string;
}> = [
    { key: "hunger", label: "배고픔", color: "bg-orange-400" },
    { key: "happiness", label: "행복", color: "bg-pink-400" },
    { key: "energy", label: "활력", color: "bg-yellow-400" },
    { key: "hygiene", label: "청결", color: "bg-sky-400" },
    { key: "health", label: "건강", color: "bg-emerald-400" },
];

export function PetStatusPanel() {
    const pet = usePetStore((s) => s.pet);

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-white/15 bg-black/40 p-4">
            <header className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">{pet.name}</h2>
                <span className="text-xs text-white/50">
                    {pet.generation}세대 · {pet.id}
                </span>
            </header>

            <div className="flex flex-col gap-2">
                {ROWS.map((row) => (
                    <StatBar
                        key={row.key}
                        label={row.label}
                        value={pet[row.key]}
                        color={row.color}
                    />
                ))}
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
                <Tag active={pet.isSleeping} label="😴 자는 중" />
                <Tag active={pet.isSick} label="🤒 아파요" tone="bad" />
                <Tag active={pet.poopCount > 0} label={`💩 × ${pet.poopCount}`} tone="bad" />
            </div>
        </div>
    );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
    const display = Math.round(value);
    return (
        <div className="flex items-center gap-3">
            <span className="w-20 text-sm text-white/70">{label}</span>
            <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                    className={`h-full ${color} transition-[width] duration-300`}
                    style={{ width: `${display}%` }}
                />
            </div>
            <span className="w-10 text-right font-mono text-sm">{display}</span>
        </div>
    );
}

function Tag({
    active,
    label,
    tone = "neutral",
}: {
    active: boolean;
    label: string;
    tone?: "neutral" | "bad";
}) {
    if (!active) return null;
    const bg = tone === "bad" ? "bg-rose-500/20 text-rose-200" : "bg-white/10 text-white/80";
    return <span className={`rounded px-2 py-0.5 ${bg}`}>{label}</span>;
}
