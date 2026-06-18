import type { PetState } from "../types";
import { clampStat } from "./clamp";
import {
    CARE_MISS_THRESHOLD_MINUTES,
    CRITICAL_THRESHOLD,
    DECAY_PER_MINUTE,
    HEALTH_DROP_PER_CRITICAL_MINUTE,
    POOP_HYGIENE_PENALTY_PER_MINUTE,
    POOP_INTERVAL_MINUTES,
    SICK_HEALTH_THRESHOLD,
} from "./constants";
import { computeStage } from "./growth";

const MS_PER_MINUTE = 60_000;

export function applyTimeDecay(pet: PetState, now: number): PetState {
    const elapsedMs = Math.max(0, now - pet.lastUpdatedAt);
    if (elapsedMs <= 0) return pet;

    const minutes = elapsedMs / MS_PER_MINUTE;
    const sleeping = pet.isSleeping;

    let hunger = pet.hunger - DECAY_PER_MINUTE.hunger * minutes;
    let happiness = pet.happiness - DECAY_PER_MINUTE.happiness * minutes;
    let hygiene = pet.hygiene - DECAY_PER_MINUTE.hygiene * minutes;
    let energy = sleeping
        ? pet.energy - DECAY_PER_MINUTE.energyAsleep * minutes
        : pet.energy - DECAY_PER_MINUTE.energyAwake * minutes;

    const newPoops = Math.floor(minutes / POOP_INTERVAL_MINUTES);
    const poopCount = pet.poopCount + newPoops;
    hygiene -= POOP_HYGIENE_PENALTY_PER_MINUTE * minutes * Math.max(1, poopCount);

    hunger = clampStat(hunger);
    happiness = clampStat(happiness);
    hygiene = clampStat(hygiene);
    energy = clampStat(energy);

    const criticalCount = [hunger, happiness, hygiene].filter(
        (v) => v <= CRITICAL_THRESHOLD,
    ).length;
    let health = pet.health;
    if (criticalCount > 0) {
        health -= HEALTH_DROP_PER_CRITICAL_MINUTE * criticalCount * minutes;
    }
    health = clampStat(health);

    let careMissCount = pet.careMissCount;
    if (
        criticalCount >= 2 &&
        minutes >= CARE_MISS_THRESHOLD_MINUTES / 2
    ) {
        careMissCount += Math.floor(minutes / CARE_MISS_THRESHOLD_MINUTES) + 1;
    } else if (criticalCount >= 1) {
        careMissCount += Math.floor(minutes / CARE_MISS_THRESHOLD_MINUTES);
    }

    const isSick = pet.isSick || health <= SICK_HEALTH_THRESHOLD;

    const ageMinutes = (now - pet.bornAt) / MS_PER_MINUTE;
    const stage = computeStage(ageMinutes);

    return {
        ...pet,
        hunger,
        happiness,
        hygiene,
        energy,
        health,
        careMissCount,
        poopCount,
        isSick,
        stage,
        lastUpdatedAt: now,
    };
}
