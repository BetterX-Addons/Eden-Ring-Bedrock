import { Player } from "@minecraft/server";

export default class PlayerUtils {
    private player: Player;
    constructor(player: Player) {
        this.player = player;
    }

    waila() {
        const block = this.player.getBlockFromViewDirection({ maxDistance: 8 })?.block;
        if (block) {
            const states = JSON.stringify(block.permutation.getAllStates());
            const typeId = block.typeId;
            const tags = JSON.stringify(block.getTags());
            this.player.onScreenDisplay.setActionBar(`TypeId: ${typeId}\nStates: ${states}\nTags: ${tags}`);
        }
    }

    teleportToEdenRing() {
        const { location: loc, dimension: dim } = this.player;
        if (dim.id === 'minecraft:overworld') {
            
        }
    }
}