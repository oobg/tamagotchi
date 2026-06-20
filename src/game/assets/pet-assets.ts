export const PET_ASSET_BASE = "assets/pets" as const;

export interface PetSpriteSheetConfig {
    key: string;
    path: string;
    metadataPath: string;
    frameWidth: number;
    frameHeight: number;
}

export const PET_SPRITE_SHEETS: Record<string, PetSpriteSheetConfig> = {
    default: {
        key: "pet-default",
        path: `${PET_ASSET_BASE}/default/sprite-sheet.png`,
        metadataPath: `${PET_ASSET_BASE}/default/metadata.json`,
        frameWidth: 32,
        frameHeight: 32,
    },
    topema: {
        key: "pet-topema",
        path: `${PET_ASSET_BASE}/topema/sprite-sheet.png`,
        metadataPath: `${PET_ASSET_BASE}/topema/metadata.json`,
        frameWidth: 280,
        frameHeight: 300,
    },
};

export const ROOM_ASSET_BASE = "assets/rooms" as const;

export const ROOM_BACKGROUNDS: Record<string, { key: string; path: string }> = {
    default: {
        key: "room-default",
        path: `${ROOM_ASSET_BASE}/default/bg.png`,
    },
};
