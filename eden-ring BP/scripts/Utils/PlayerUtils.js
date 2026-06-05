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
        const jumpFlag = this.player.getDynamicProperty('edenring:jump_flag');
        if (this.player.isJumping && !jumpFlag) {
            this.player.setDynamicProperty('edenring:jump_flag', true);
            this.player.applyImpulse({ x: 0, y: 0.1, z: 0 });
        }
        if (this.player.isOnGround) {
            this.player.setDynamicProperty('edenring:jump_flag', false);
        }
        if (this.player.isFalling) {
            this.player.applyImpulse({ x: 0, y: 0.03, z: 0 });
        }
    }
}
