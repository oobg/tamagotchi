"use client";

import { usePetStore } from "@/stores/pet-store";

export function PetActionPanel() {
    const isSleeping = usePetStore((s) => s.pet.isSleeping);
    const { feed, play, sleep, wake, clean, heal, toilet, resetPet } = usePetStore.getState();

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-white/15 bg-black/40 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/60">
                Actions
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <ActionButton label="🍖 Feed" onClick={feed} disabled={isSleeping} />
                <ActionButton label="🎾 Play" onClick={play} disabled={isSleeping} />
                {isSleeping ? (
                    <ActionButton label="🌞 Wake" onClick={wake} />
                ) : (
                    <ActionButton label="😴 Sleep" onClick={sleep} />
                )}
                <ActionButton label="🧼 Clean" onClick={clean} />
                <ActionButton label="💊 Heal" onClick={heal} />
                <ActionButton label="🚽 Toilet" onClick={toilet} />
                <ActionButton label="♻️ Reset" onClick={resetPet} tone="danger" />
            </div>
        </div>
    );
}

function ActionButton({
    label,
    onClick,
    disabled,
    tone = "default",
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    tone?: "default" | "danger";
}) {
    const base =
        "rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";
    const palette =
        tone === "danger"
            ? "border-rose-500/40 text-rose-200 hover:bg-rose-500/10"
            : "border-white/20 text-white hover:bg-white/10";
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${palette}`}
        >
            {label}
        </button>
    );
}
