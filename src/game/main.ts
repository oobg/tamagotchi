import { AUTO, Game, Scale } from "phaser";
import { PetRoomScene } from "./scenes/PetRoomScene";

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 480,
    height: 480,
    parent: "game-container",
    backgroundColor: "#18181b",
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
