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
    idle: "",
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
        // LCD 화면 안에서 펫이 중앙에 보이도록. 위·아래 HTML 오버레이를 피해
        // 살짝 아래쪽에 자리를 잡아 펫 위로 mood 말풍선이 들어올 공간을 둔다.
        this.baseY = height * 0.78;

        this.petSprite = this.add
            .sprite(centerX, this.baseY, INITIAL_SHEET_KEY, 0)
            .setOrigin(0.5, 0.95);

        this.petBubble = this.add
            .text(centerX, this.baseY - 110, "", {
                fontFamily: "monospace",
                fontSize: "18px",
                color: "#1f2c14",
            })
            .setOrigin(0.5);

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

        this.petBubble.setText(MOOD_LABEL[mood]);

        this.petSprite.y = this.baseY;
        this.petSprite.setAlpha(mood === "sleeping" ? 0.7 : 1);

        this.renderPoops(pet.poopCount);
    }

    private renderPoops(count: number) {
        this.poopGroup.clear(true, true);
        const baseX = this.scale.width / 2 + 50;
        const y = this.baseY - 4;
        for (let i = 0; i < Math.min(count, 5); i += 1) {
            const dot = this.add.circle(baseX + i * 12, y, 4, 0x4a3322);
            this.poopGroup.add(dot);
        }
    }
}
