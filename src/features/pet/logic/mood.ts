import type { PetMood, PetState } from "../types";
import { CRITICAL_THRESHOLD } from "./constants";

const HAPPY_THRESHOLD = 80;
const DIRTY_THRESHOLD = 25;

export function deriveMood(pet: PetState): PetMood {
    if (pet.isSleeping) return "sleeping";
    if (pet.isSick) return "sick";
    if (pet.hunger <= CRITICAL_THRESHOLD) return "hungry";
    if (pet.hygiene <= DIRTY_THRESHOLD || pet.poopCount > 0) return "dirty";
    if (pet.happiness >= HAPPY_THRESHOLD) return "happy";
    return "idle";
}
