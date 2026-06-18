"use client";

import { useEffect, useRef } from "react";
import { type IRefPhaserGame, PhaserGame } from "./PhaserGame";
import { usePetStore } from "@/stores/pet-store";
import { PetStatusPanel } from "@/features/pet/components/PetStatusPanel";
import { PetActionPanel } from "@/features/pet/components/PetActionPanel";
import { GrowthStageBadge } from "@/features/pet/components/GrowthStageBadge";
import { CareMissIndicator } from "@/features/pet/components/CareMissIndicator";
import { DebugPanel } from "@/features/pet/components/DebugPanel";

const TICK_INTERVAL_MS = 1000;

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    useEffect(() => {
        const { syncTime, tick } = usePetStore.getState();
        syncTime();
        const interval = window.setInterval(tick, TICK_INTERVAL_MS);
        const onVisibility = () => {
            if (!document.hidden) syncTime();
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, []);

    return (
        <div className="flex h-full w-full flex-col items-stretch gap-4 p-4 sm:flex-row">
            <section className="flex flex-1 items-center justify-center rounded-lg border border-white/10 bg-black/40">
                <PhaserGame ref={phaserRef} />
            </section>

            <aside className="flex w-full max-w-sm flex-col gap-3">
                <div className="flex gap-2">
                    <GrowthStageBadge />
                    <CareMissIndicator />
                </div>
                <PetStatusPanel />
                <PetActionPanel />
                <DebugPanel />
            </aside>
        </div>
    );
}

export default App;
