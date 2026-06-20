import { Scene } from "phaser";
import { usePetStore } from "@/stores/pet-store";
import type { PetMood, PetStage, PetState } from "@/features/pet/types";
import { deriveMood } from "@/features/pet/logic/mood";
import { EventBus } from "../EventBus";
import { PET_SPRITE_SHEETS } from "../assets/pet-assets";
import { PET_ANIM_DEFS, moodAnimKey } from "../animations/pet-animations";

const STAGE_SCALE: Record<PetStage, number> = {
    egg: 0.4,
    baby: 0.5,
    child: 0.6,
    teen: 0.7,
    adult: 0.8,
};

const MOOD_LABEL: Record<PetMood, string> = {
    idle: "...",
    happy: "♪",
    hungry: "!",
    sick: "x_x",
    sleeping: "Z",
    dirty: "~",
};

const TOPEMA_SHEET = PET_SPRITE_SHEETS.topema;

// 원본 PNG가 균일한 4×3 격자가 아니라 캐릭터 중심이 (251,205) 부터 좌우 ~313, 상하 ~321 간격으로 흩어져 있음.
// 픽셀 centroid을 측정해서 각 캐릭터를 280×300 프레임 중앙에 맞춤.
const TOPEMA_FRAME_WIDTH = 280;
const TOPEMA_FRAME_HEIGHT = 300;
const TOPEMA_COL_X = [111, 431, 740, 1050];
const TOPEMA_ROW_Y = [55, 378, 697];

export class PetRoomScene extends Scene {
    private petSprite!: Phaser.GameObjects.Sprite;
    private petBubble!: Phaser.GameObjects.Text;
    private nameText!: Phaser.GameObjects.Text;
    private stageText!: Phaser.GameObjects.Text;
    private moodText!: Phaser.GameObjects.Text;
    private poopGroup!: Phaser.GameObjects.Group;
    private unsubscribe?: () => void;
    private baseY = 0;

    constructor() {
        super("PetRoomScene");
    }

    preload() {
        this.load.image(TOPEMA_SHEET.key, TOPEMA_SHEET.path);
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width, height, 0x18181b).setOrigin(0, 0);
        this.add.rectangle(0, height * 0.7, width, height * 0.3, 0x27272a).setOrigin(0, 0);

        const tex = this.textures.get(TOPEMA_SHEET.key);
        for (let row = 0; row < TOPEMA_ROW_Y.length; row += 1) {
            for (let col = 0; col < TOPEMA_COL_X.length; col += 1) {
                const index = row * TOPEMA_COL_X.length + col;
                const name = String(index);
                if (tex.has(name)) continue;
                tex.add(
                    name,
                    0,
                    TOPEMA_COL_X[col],
                    TOPEMA_ROW_Y[row],
                    TOPEMA_FRAME_WIDTH,
                    TOPEMA_FRAME_HEIGHT,
                );
            }
        }

        const centerX = width / 2;
        const floorY = height * 0.7;
        this.baseY = floorY - 20;

        this.petSprite = this.add
            .sprite(centerX, this.baseY, TOPEMA_SHEET.key, 0)
            .setOrigin(0.5, 0.95);

        const totalFrames = TOPEMA_ROW_Y.length * TOPEMA_COL_X.length;
        for (const def of PET_ANIM_DEFS) {
            if (this.anims.exists(def.key)) continue;
            const safeFrames = def.frames.filter((f) => f < totalFrames);
            if (safeFrames.length === 0) continue;
            this.anims.create({
                key: def.key,
                frames: this.anims.generateFrameNumbers(TOPEMA_SHEET.key, { frames: safeFrames }),
                frameRate: def.frameRate,
                repeat: def.repeat,
            });
        }

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

        this.events.once("shutdown", () => {
            this.unsubscribe?.();
        });

        EventBus.emit("current-scene-ready", this);
    }

    private applyPetState(pet: PetState) {
        if (!this.petSprite) return;

        const mood = deriveMood(pet);
        const animKey = moodAnimKey(mood);
        const scale = STAGE_SCALE[pet.stage];

        this.petSprite.setScale(scale);
        if (this.petSprite.anims.currentAnim?.key !== animKey) {
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
