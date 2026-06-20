import { AUTO, Game, Scale } from "phaser";
import { PetRoomScene } from "./scenes/PetRoomScene";

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 480,
    height: 480,
    parent: "game-container",
    backgroundColor: "#18181b",
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
