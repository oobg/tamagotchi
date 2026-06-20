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
    cleaning: "pet-cleaning",
    healing: "pet-healing",
    toilet: "pet-toilet",
} as const;

export type PetAnimKey = (typeof PET_ANIM_KEY)[keyof typeof PET_ANIM_KEY];

export interface PetAnimDefinition {
    key: PetAnimKey;
    sheetKey: string;
    frames: number[];
    frameRate: number;
    repeat: number;
}

const ALL_FRAMES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// frame rate를 낮춰 한 사이클을 더 길고 차분하게: 무한 반복 mood는 3~4초,
// 일회성 액션은 ~3초로 sprite가 차분하게 흐르도록.
export const PET_ANIM_DEFS: PetAnimDefinition[] = [
    { key: PET_ANIM_KEY.idle,     sheetKey: "topema-idle",     frames: ALL_FRAMES, frameRate: 3, repeat: -1 },
    { key: PET_ANIM_KEY.happy,    sheetKey: "topema-happy",    frames: ALL_FRAMES, frameRate: 5, repeat: -1 },
    { key: PET_ANIM_KEY.hungry,   sheetKey: "topema-hungry",   frames: ALL_FRAMES, frameRate: 4, repeat: -1 },
    { key: PET_ANIM_KEY.sick,     sheetKey: "topema-sick",     frames: ALL_FRAMES, frameRate: 2, repeat: -1 },
    { key: PET_ANIM_KEY.sleeping, sheetKey: "topema-sleeping", frames: ALL_FRAMES, frameRate: 1, repeat: -1 },
    { key: PET_ANIM_KEY.dirty,    sheetKey: "topema-dirty",    frames: ALL_FRAMES, frameRate: 3, repeat: -1 },
    { key: PET_ANIM_KEY.eating,   sheetKey: "topema-eating",   frames: ALL_FRAMES, frameRate: 5, repeat: 0 },
    { key: PET_ANIM_KEY.playing,  sheetKey: "topema-playing",  frames: ALL_FRAMES, frameRate: 5, repeat: 0 },
    { key: PET_ANIM_KEY.cleaning, sheetKey: "topema-cleaning", frames: ALL_FRAMES, frameRate: 5, repeat: 0 },
    { key: PET_ANIM_KEY.healing,  sheetKey: "topema-healing",  frames: ALL_FRAMES, frameRate: 5, repeat: 0 },
    { key: PET_ANIM_KEY.toilet,   sheetKey: "topema-toilet",   frames: ALL_FRAMES, frameRate: 5, repeat: 0 },
];

export function moodAnimKey(mood: PetMood): PetAnimKey {
    return PET_ANIM_KEY[mood];
}
