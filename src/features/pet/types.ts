export type PetStage = "egg" | "baby" | "child" | "teen" | "adult";

export type PetMood = "idle" | "happy" | "hungry" | "sick" | "sleeping" | "dirty";

export interface PetState {
    id: string;
    name: string;
    stage: PetStage;
    hunger: number;
    happiness: number;
    energy: number;
    hygiene: number;
    health: number;
    careMissCount: number;
    poopCount: number;
    isSleeping: boolean;
    isSick: boolean;
    bornAt: number;
    lastUpdatedAt: number;
    generation: number;
}
