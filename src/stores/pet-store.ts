"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PetState } from "@/features/pet/types";
import { applyTimeDecay } from "@/features/pet/logic/apply-time-decay";
import { clampStat } from "@/features/pet/logic/clamp";
import { HEAL_RECOVERY_THRESHOLD } from "@/features/pet/logic/constants";
import { EventBus } from "@/game/EventBus";

export type PetActionEvent = "eating" | "playing" | "cleaning" | "healing" | "toilet";

const INITIAL_STATS = {
    hunger: 70,
    happiness: 70,
    energy: 90,
    hygiene: 80,
    health: 100,
} as const;

function createInitialPet(now: number, generation = 1): PetState {
    return {
        id: `pet-${now}`,
        name: "토페마",
        stage: "egg",
        ...INITIAL_STATS,
        careMissCount: 0,
        poopCount: 0,
        isSleeping: false,
        isSick: false,
        bornAt: now,
        lastUpdatedAt: now,
        generation,
    };
}

interface PetActions {
    tick: () => void;
    syncTime: () => void;
    feed: () => void;
    play: () => void;
    sleep: () => void;
    wake: () => void;
    clean: () => void;
    heal: () => void;
    toilet: () => void;
    resetPet: () => void;
    renamePet: (name: string) => void;
}

export type PetStore = { pet: PetState } & PetActions;

function mutate(state: PetStore, mutator: (pet: PetState) => PetState): PetStore {
    const now = Date.now();
    const decayed = applyTimeDecay(state.pet, now);
    return { ...state, pet: mutator(decayed) };
}

export const usePetStore = create<PetStore>()(
    persist(
        (set) => ({
            pet: createInitialPet(Date.now()),

            tick: () => set((state) => ({ pet: applyTimeDecay(state.pet, Date.now()) })),

            syncTime: () => set((state) => ({ pet: applyTimeDecay(state.pet, Date.now()) })),

            feed: () => {
                set((state) =>
                    mutate(state, (pet) => ({
                        ...pet,
                        hunger: clampStat(pet.hunger + 30),
                        happiness: clampStat(pet.happiness + 5),
                    })),
                );
                EventBus.emit("pet:action", "eating" satisfies PetActionEvent);
            },

            play: () => {
                set((state) =>
                    mutate(state, (pet) => ({
                        ...pet,
                        happiness: clampStat(pet.happiness + 25),
                        energy: clampStat(pet.energy - 15),
                        hygiene: clampStat(pet.hygiene - 5),
                    })),
                );
                EventBus.emit("pet:action", "playing" satisfies PetActionEvent);
            },

            sleep: () => set((state) => mutate(state, (pet) => ({ ...pet, isSleeping: true }))),

            wake: () => set((state) => mutate(state, (pet) => ({ ...pet, isSleeping: false }))),

            clean: () => {
                set((state) =>
                    mutate(state, (pet) => ({
                        ...pet,
                        hygiene: clampStat(pet.hygiene + 35),
                        poopCount: Math.max(0, pet.poopCount - 1),
                    })),
                );
                EventBus.emit("pet:action", "cleaning" satisfies PetActionEvent);
            },

            heal: () => {
                set((state) =>
                    mutate(state, (pet) => {
                        const health = clampStat(pet.health + 30);
                        return {
                            ...pet,
                            health,
                            isSick: health >= HEAL_RECOVERY_THRESHOLD ? false : pet.isSick,
                        };
                    }),
                );
                EventBus.emit("pet:action", "healing" satisfies PetActionEvent);
            },

            toilet: () => {
                set((state) =>
                    mutate(state, (pet) => ({
                        ...pet,
                        poopCount: 0,
                        hygiene: clampStat(pet.hygiene + 10),
                    })),
                );
                EventBus.emit("pet:action", "toilet" satisfies PetActionEvent);
            },

            resetPet: () =>
                set((state) => ({
                    ...state,
                    pet: createInitialPet(Date.now(), state.pet.generation + 1),
                })),

            renamePet: (name) => set((state) => ({ pet: { ...state.pet, name } })),
        }),
        {
            name: "tamagotchi-pet-v1",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ pet: state.pet }),
            onRehydrateStorage: () => (state) => {
                if (state) state.syncTime();
            },
        },
    ),
);
