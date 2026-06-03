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
    applyEdenRingGravity() {
        if (this.dimension.id !== "edenring:dimension")
            return;
        if (this.player.isJumping) {
            this.applyImpulseFromOrigin(0, 0.5, 0);
        }
        if (this.player.isFalling) {
            this.applyImpulseFromOrigin(0, 0.2, 0);
        }
    }
    applyImpulseFromOrigin(x, y, z) {
        const { x: ox, y: oy, z: oz } = this.location;
        this.player.applyImpulse({
            x: ox + x, y: oy + y, z: oz + z
        });
    }
}
