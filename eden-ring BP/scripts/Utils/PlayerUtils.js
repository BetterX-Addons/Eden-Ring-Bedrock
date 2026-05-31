import { world } from "@minecraft/server";
import { EdenRing } from "../constants/EdenRing";
export default class PlayerUtils {
    constructor(player) {
        this.player = player;
        this.dimension = player.dimension;
        this.location = player.location;
    }
    teleportToEdenRing() {
        const isInPortal = this.dimension.getEntities({ type: EdenRing.portal, location: this.location, maxDistance: 1 });
        if (isInPortal.length > 0) {
            const recentlyTeleported = this.player.getDynamicProperty(EdenRing.recently_teleported);
            if (recentlyTeleported)
                return;
            else
                this.player.teleport(this.location, { dimension: world.getDimension(EdenRing.dimension) });
        }
        else {
            this.player.setDynamicProperty(EdenRing.recently_teleported, false);
        }
    }
}
