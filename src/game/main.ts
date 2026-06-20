import { AUTO, Game, Scale } from "phaser";
import { PetRoomScene } from "./scenes/PetRoomScene";

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    // LCD 내부 비율(256×224)에 맞춰 캔버스를 잡아 letterbox 없이 꽉 차게 한다.
    width: 256,
    height: 224,
    parent: "game-container",
    // 다마고치 셸의 LCD 녹색이 그대로 비치도록 캔버스를 투명으로 둔다.
    transparent: true,
    // pixelArt: 텍스처 보간을 nearest-neighbor로 → sprite scale을 줄여도 hood 끝
    // 같은 얇은 픽셀이 흐려져 잘려보이지 않음.
    pixelArt: true,
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
    },
    scene: [PetRoomScene],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
