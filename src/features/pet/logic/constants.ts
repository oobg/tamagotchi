import type { PetStage } from "../types";

export const DECAY_PER_MINUTE = {
    hunger: 1.2,
    happiness: 0.8,
    hygiene: 0.6,
    energyAwake: 0.7,
    energyAsleep: -2.0,
} as const;

export const CRITICAL_THRESHOLD = 15;
export const HEALTH_DROP_PER_CRITICAL_MINUTE = 0.4;
export const CARE_MISS_THRESHOLD_MINUTES = 5;
export const SICK_HEALTH_THRESHOLD = 25;
export const HEAL_RECOVERY_THRESHOLD = 70;

export const POOP_INTERVAL_MINUTES = 8;
export const POOP_HYGIENE_PENALTY_PER_MINUTE = 0.5;

export const STAGE_DURATION_MINUTES: Record<PetStage, number> = {
    egg: 1,
    baby: 5,
    child: 10,
    teen: 15,
    adult: Number.POSITIVE_INFINITY,
};

export const STAGE_ORDER: PetStage[] = ["egg", "baby", "child", "teen", "adult"];
