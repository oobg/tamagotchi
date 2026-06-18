import type { PetMood } from "@/features/pet/types";

export const PET_ANIM_KEY = {
    idle: "pet-idle",
    happy: "pet-happy",
    hungry: "pet-hungry",
    sick: "pet-sick",
    sleeping: "pet-sleeping",
    dirty: "pet-dirty",
    eating: "pet-eating",
    playing: "pet-playing",
} as const;

export type PetAnimKey = (typeof PET_ANIM_KEY)[keyof typeof PET_ANIM_KEY];

export interface PetAnimDefinition {
    key: PetAnimKey;
    frames: number[];
    frameRate: number;
    repeat: number;
}

export const PET_ANIM_DEFS: PetAnimDefinition[] = [
    { key: PET_ANIM_KEY.idle, frames: [0, 1], frameRate: 2, repeat: -1 },
    { key: PET_ANIM_KEY.happy, frames: [2, 3], frameRate: 6, repeat: -1 },
    { key: PET_ANIM_KEY.hungry, frames: [4, 5], frameRate: 3, repeat: -1 },
    { key: PET_ANIM_KEY.sick, frames: [6, 7], frameRate: 2, repeat: -1 },
    { key: PET_ANIM_KEY.sleeping, frames: [8, 9], frameRate: 1, repeat: -1 },
    { key: PET_ANIM_KEY.dirty, frames: [10, 11], frameRate: 3, repeat: -1 },
    { key: PET_ANIM_KEY.eating, frames: [12, 13, 14], frameRate: 8, repeat: -1 },
    { key: PET_ANIM_KEY.playing, frames: [15, 16, 17], frameRate: 8, repeat: -1 },
];

export function moodAnimKey(mood: PetMood): PetAnimKey {
    return PET_ANIM_KEY[mood];
}
