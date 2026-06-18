import { Scene } from "phaser";
import { usePetStore } from "@/stores/pet-store";
import type { PetMood, PetStage, PetState } from "@/features/pet/types";
import { deriveMood } from "@/features/pet/logic/mood";
import { EventBus } from "../EventBus";

const STAGE_SIZE: Record<PetStage, number> = {
    egg: 50,
    baby: 70,
    child: 90,
    teen: 110,
    adult: 130,
};

const MOOD_COLOR: Record<PetMood, number> = {
    idle: 0xfacc15,
    happy: 0xf472b6,
    hungry: 0xfb923c,
    sick: 0x84cc16,
    sleeping: 0x60a5fa,
    dirty: 0x78716c,
};

const MOOD_LABEL: Record<PetMood, string> = {
    idle: "...",
    happy: "♪",
    hungry: "!",
    sick: "x_x",
    sleeping: "Z",
    dirty: "~",
};

export class PetRoomScene extends Scene {
    private petBody!: Phaser.GameObjects.Arc;
    private petBubble!: Phaser.GameObjects.Text;
    private nameText!: Phaser.GameObjects.Text;
    private stageText!: Phaser.GameObjects.Text;
    private moodText!: Phaser.GameObjects.Text;
    private poopGroup!: Phaser.GameObjects.Group;
    private unsubscribe?: () => void;
    private bounceTween?: Phaser.Tweens.Tween;

    constructor() {
        super("PetRoomScene");
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width, height, 0x18181b).setOrigin(0, 0);
        this.add.rectangle(0, height * 0.7, width, height * 0.3, 0x27272a).setOrigin(0, 0);
        this.add
            .text(width / 2, 24, "PET ROOM (placeholder)", {
                fontFamily: "monospace",
                fontSize: "14px",
                color: "#71717a",
            })
            .setOrigin(0.5, 0);

        const centerX = width / 2;
        const floorY = height * 0.7;

        this.petBody = this.add.circle(centerX, floorY - 50, 50, 0xfacc15);
        this.petBubble = this.add
            .text(centerX, floorY - 130, "", {
                fontFamily: "monospace",
                fontSize: "20px",
                color: "#ffffff",
            })
            .setOrigin(0.5);

        this.nameText = this.add
            .text(centerX, 60, "", {
                fontFamily: "monospace",
                fontSize: "18px",
                color: "#fafafa",
            })
            .setOrigin(0.5);
        this.stageText = this.add
            .text(centerX, 86, "", {
                fontFamily: "monospace",
                fontSize: "13px",
                color: "#a1a1aa",
            })
            .setOrigin(0.5);
        this.moodText = this.add
            .text(centerX, floorY + 20, "", {
                fontFamily: "monospace",
                fontSize: "13px",
                color: "#d4d4d8",
            })
            .setOrigin(0.5, 0);

        this.poopGroup = this.add.group();

        this.applyPetState(usePetStore.getState().pet);
        this.unsubscribe = usePetStore.subscribe((state) => {
            this.applyPetState(state.pet);
        });

        EventBus.emit("current-scene-ready", this);
    }

    shutdown() {
        this.unsubscribe?.();
        this.bounceTween?.stop();
    }

    private applyPetState(pet: PetState) {
        if (!this.petBody) return;

        const mood = deriveMood(pet);
        const size = STAGE_SIZE[pet.stage];
        const color = MOOD_COLOR[mood];

        this.petBody.setRadius(size / 2);
        this.petBody.setFillStyle(color);

        this.nameText.setText(`${pet.name}  (gen ${pet.generation})`);
        this.stageText.setText(`stage: ${pet.stage}`);
        this.moodText.setText(
            `mood: ${mood}   anim-key: pet-${mood}` + (pet.isSick ? "   [SICK]" : ""),
        );
        this.petBubble.setText(MOOD_LABEL[mood]);

        this.bounceTween?.stop();
        if (mood === "sleeping") {
            this.petBody.setAlpha(0.7);
            this.bounceTween = undefined;
        } else {
            this.petBody.setAlpha(1);
            this.bounceTween = this.tweens.add({
                targets: this.petBody,
                y: this.petBody.y - 6,
                duration: mood === "happy" ? 220 : 600,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut",
            });
        }

        this.renderPoops(pet.poopCount);
    }

    private renderPoops(count: number) {
        this.poopGroup.clear(true, true);
        const baseX = this.scale.width / 2 + 80;
        const y = this.scale.height * 0.7 - 10;
        for (let i = 0; i < Math.min(count, 5); i += 1) {
            const dot = this.add.circle(baseX + i * 22, y, 8, 0x6b7280);
            this.poopGroup.add(dot);
        }
    }
}
