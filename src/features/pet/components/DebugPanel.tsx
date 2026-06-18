"use client";

import { useState } from "react";
import { usePetStore } from "@/stores/pet-store";

export function DebugPanel() {
    const [open, setOpen] = useState(false);
    const pet = usePetStore((s) => s.pet);
    const syncTime = usePetStore((s) => s.syncTime);

    return (
        <div className="rounded-lg border border-white/10 bg-black/30 text-xs">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-2 text-white/60 hover:text-white"
            >
                <span>🛠 Debug</span>
                <span>{open ? "▾" : "▸"}</span>
            </button>
            {open ? (
                <div className="flex flex-col gap-2 border-t border-white/10 px-3 py-2">
                    <button
                        type="button"
                        onClick={syncTime}
                        className="self-start rounded border border-white/20 px-2 py-1 hover:bg-white/10"
                    >
                        force syncTime()
                    </button>
                    <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-snug text-white/70">
                        {JSON.stringify(pet, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div>
    );
}
