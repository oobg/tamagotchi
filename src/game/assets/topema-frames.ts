// 토페마 8개 sprite sheet의 12프레임 위치 (500×500 균일 격자).
// 후처리 스크립트(scripts/repack-topema-sheets.py)로 매 프레임의 머리(노란
// 동그라미) 가로 중심을 cell 정가운데에 정렬했기 때문에 frame 간 좌우 흔들림이
// 없다. 시트마다 모양/크기 차이 없이 4 cols × 3 rows × 500px 격자.

export const TOPEMA_FRAME_WIDTH = 500;
export const TOPEMA_FRAME_HEIGHT = 500;

export interface TopemaFrameRect {
    x: number;
    y: number;
}

export interface TopemaSheetMeta {
    key: string;
    path: string;
    width: number;
    height: number;
    frames: TopemaFrameRect[];
}

const BASE = "assets/pets/topema" as const;
const COLS = 4;
const ROWS = 3;

const UNIFORM_FRAMES: TopemaFrameRect[] = (() => {
    const out: TopemaFrameRect[] = [];
    for (let r = 0; r < ROWS; r += 1) {
        for (let c = 0; c < COLS; c += 1) {
            out.push({ x: c * TOPEMA_FRAME_WIDTH, y: r * TOPEMA_FRAME_HEIGHT });
        }
    }
    return out;
})();

function sheet(mood: string): TopemaSheetMeta {
    return {
        key: `topema-${mood}`,
        path: `${BASE}/sheet-${mood}.png`,
        width: TOPEMA_FRAME_WIDTH * COLS,
        height: TOPEMA_FRAME_HEIGHT * ROWS,
        frames: UNIFORM_FRAMES,
    };
}

export const TOPEMA_SHEETS = {
    idle: sheet("idle"),
    happy: sheet("happy"),
    hungry: sheet("hungry"),
    sick: sheet("sick"),
    sleeping: sheet("sleeping"),
    dirty: sheet("dirty"),
    eating: sheet("eating"),
    playing: sheet("playing"),
    cleaning: sheet("cleaning"),
    healing: sheet("healing"),
    toilet: sheet("toilet"),
} as const satisfies Record<string, TopemaSheetMeta>;

export type TopemaSheetName = keyof typeof TOPEMA_SHEETS;
