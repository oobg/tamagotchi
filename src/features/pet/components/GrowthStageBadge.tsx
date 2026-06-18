"use client";

import { usePetStore } from "@/stores/pet-store";
import { stageProgress } from "@/features/pet/logic/growth";

const STAGE_LABEL: Record<string, string> = {
    egg: "알",
    baby: "베이비",
    child: "차일드",
    teen: "틴",
    adult: "어덜트",
};

export function GrowthStageBadge() {
    const pet = usePetStore((s) => s.pet);
    const ageMinutes = (Date.now() - pet.bornAt) / 60_000;
    const progress = stageProgress(ageMinutes, pet.stage);

    return (
        <div className="flex items-center gap-3 rounded-md border border-white/20 bg-white/5 px-3 py-2">
            <span className="text-xs uppercase tracking-widest text-white/60">
                Stage
            </span>
            <span className="font-semibold">{STAGE_LABEL[pet.stage]}</span>
            <div className="ml-auto h-2 w-24 overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full bg-cyan-400 transition-[width]"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                />
            </div>
        </div>
    );
}
