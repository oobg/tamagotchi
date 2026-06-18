import type { PetStage } from "../types";
import { STAGE_DURATION_MINUTES, STAGE_ORDER } from "./constants";

export function computeStage(ageMinutes: number): PetStage {
    let elapsed = 0;
    for (const stage of STAGE_ORDER) {
        elapsed += STAGE_DURATION_MINUTES[stage];
        if (ageMinutes < elapsed) return stage;
    }
    return "adult";
}

export function nextStage(stage: PetStage): PetStage | null {
    const idx = STAGE_ORDER.indexOf(stage);
    if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
    return STAGE_ORDER[idx + 1];
}

export function stageProgress(ageMinutes: number, stage: PetStage): number {
    if (stage === "adult") return 1;
    let start = 0;
    for (const s of STAGE_ORDER) {
        if (s === stage) break;
        start += STAGE_DURATION_MINUTES[s];
    }
    const duration = STAGE_DURATION_MINUTES[stage];
    const within = Math.max(0, ageMinutes - start);
    return Math.min(1, within / duration);
}
