import { Scene } from "phaser";
import { usePetStore } from "@/stores/pet-store";
import type { PetActionEvent } from "@/stores/pet-store";
import type { PetMood, PetStage, PetState } from "@/features/pet/types";
import { deriveMood } from "@/features/pet/logic/mood";
import { EventBus } from "../EventBus";
import {
    TOPEMA_FRAME_HEIGHT,
    TOPEMA_FRAME_WIDTH,
    TOPEMA_SHEETS,
} from "../assets/topema-frames";
import { PET_ANIM_DEFS, PET_ANIM_KEY, moodAnimKey } from "../animations/pet-animations";

const STAGE_SCALE: Record<PetStage, number> = {
    egg: 0.22,
    baby: 0.28,
    child: 0.34,
    teen: 0.39,
    adult: 0.45,
};

const MOOD_LABEL: Record<PetMood, string> = {
    idle: "...",
    happy: "♪",
    hungry: "!",
    sick: "x_x",
    sleeping: "Z",
    dirty: "~",
};

const INITIAL_SHEET_KEY = TOPEMA_SHEETS.idle.key;

export class PetRoomScene extends Scene {
    private petSprite!: Phaser.GameObjects.Sprite;
    private petBubble!: Phaser.GameObjects.Text;
    private nameText!: Phaser.GameObjects.Text;
    private stageText!: Phaser.GameObjects.Text;
    private moodText!: Phaser.GameObjects.Text;
    private poopGroup!: Phaser.GameObjects.Group;
    private unsubscribe?: () => void;
    private baseY = 0;
    private actionPlaying = false;
    private onAction = (action: PetActionEvent) => this.playAction(action);

    constructor() {
        super("PetRoomScene");
    }

    preload() {
        for (const meta of Object.values(TOPEMA_SHEETS)) {
            this.load.image(meta.key, meta.path);
        }
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width, height, 0x18181b).setOrigin(0, 0);
        this.add.rectangle(0, height * 0.7, width, height * 0.3, 0x27272a).setOrigin(0, 0);

        for (const meta of Object.values(TOPEMA_SHEETS)) {
            const tex = this.textures.get(meta.key);
            for (let i = 0; i < meta.frames.length; i += 1) {
                const name = String(i);
                if (tex.has(name)) continue;
                const { x, y } = meta.frames[i];
                tex.add(name, 0, x, y, TOPEMA_FRAME_WIDTH, TOPEMA_FRAME_HEIGHT);
            }
        }

        for (const def of PET_ANIM_DEFS) {
            if (this.anims.exists(def.key)) continue;
            this.anims.create({
                key: def.key,
                frames: this.anims.generateFrameNumbers(def.sheetKey, { frames: def.frames }),
                frameRate: def.frameRate,
                repeat: def.repeat,
            });
        }

        const centerX = width / 2;
        const floorY = height * 0.7;
        this.baseY = floorY - 20;

        this.petSprite = this.add
            .sprite(centerX, this.baseY, INITIAL_SHEET_KEY, 0)
            .setOrigin(0.5, 0.95);

        this.petBubble = this.add
            .text(centerX, floorY - 240, "", {
                fontFamily: "monospace",
                fontSize: "22px",
                color: "#ffffff",
            })
            .setOrigin(0.5);

        this.nameText = this.add
            .text(centerX, 28, "", {
                fontFamily: "monospace",
                fontSize: "18px",
                color: "#fafafa",
            })
            .setOrigin(0.5);
        this.stageText = this.add
            .text(centerX, 54, "", {
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

        EventBus.on("pet:action", this.onAction);

        this.events.once("shutdown", () => {
            this.unsubscribe?.();
            EventBus.off("pet:action", this.onAction);
        });

        EventBus.emit("current-scene-ready", this);
    }

    private playAction(action: PetActionEvent) {
        if (!this.petSprite) return;
        this.actionPlaying = true;
        const animKey = PET_ANIM_KEY[action];
        this.petSprite.play(animKey);
        this.petSprite.once("animationcomplete", () => {
            this.actionPlaying = false;
            this.applyPetState(usePetStore.getState().pet);
        });
    }

    private applyPetState(pet: PetState) {
        if (!this.petSprite) return;

        const mood = deriveMood(pet);
        const animKey = moodAnimKey(mood);
        const scale = STAGE_SCALE[pet.stage];

        this.petSprite.setScale(scale);

        if (!this.actionPlaying && this.petSprite.anims.currentAnim?.key !== animKey) {
            this.petSprite.play(animKey);
        }

        this.nameText.setText(`${pet.name}  (gen ${pet.generation})`);
        this.stageText.setText(`stage: ${pet.stage}`);
        this.moodText.setText(
            `mood: ${mood}   anim-key: ${animKey}` + (pet.isSick ? "   [SICK]" : ""),
        );
        this.petBubble.setText(MOOD_LABEL[mood]);

        this.petSprite.y = this.baseY;
        this.petSprite.setAlpha(mood === "sleeping" ? 0.7 : 1);

        this.renderPoops(pet.poopCount);
    }

    private renderPoops(count: number) {
        this.poopGroup.clear(true, true);
        const baseX = this.scale.width / 2 + 110;
        const y = this.scale.height * 0.7 - 10;
        for (let i = 0; i < Math.min(count, 5); i += 1) {
            const dot = this.add.circle(baseX + i * 22, y, 8, 0x6b7280);
            this.poopGroup.add(dot);
        }
    }
}
