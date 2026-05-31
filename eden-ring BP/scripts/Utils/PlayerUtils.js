import { world } from "@minecraft/server";
import { EdenRing } from "../constants/EdenRing";
export default class PlayerUtils {
    constructor(player) {
        this.player = player;
        this.dimension = player.dimension;
        this.location = player.location;
    }
    teleportingToEdenRing() {
        // Need to be 5 secs
        const isInPortal = this.dimension.getBlock(this.location)?.typeId === EdenRing.portal;
        if (isInPortal) {
            const time = this.player.getDynamicProperty('eden_ring:time_teleporting') || 0;
            if (time >= 100) {
            }
            else
                this.player.setDynamicProperty('', time + 1);
        }
        else {
        }
    }
    teleportToEdenRing() {
        const { location: loc, dimension: dim } = this.player;
        if (dim.id === 'minecraft:overworld' || dim.id === 'minecraft:nether' || dim.id === 'minecraft:the_end') {
            this.player.teleport(this.player.location, { dimension: world.getDimension(EdenRing.dimension) });
        }
        else {
            this.player.teleport(this.player.location, { dimension: world.getDimension('overworld') });
        }
    }
}
