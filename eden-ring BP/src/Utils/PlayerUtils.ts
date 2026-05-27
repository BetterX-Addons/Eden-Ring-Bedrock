import { Player } from "@minecraft/server";

export default class PlayerUtils {
    private player: Player;
    constructor(player: Player) {
        this.player = player;
    }

    teleportToEdenRing() {
        const { location: loc, dimension: dim } = this.player;
        if (dim.id === 'minecraft:overworld') {
            
        }
    }
}