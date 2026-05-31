import { Dimension, Player, Vector3, world } from "@minecraft/server";
import { EdenRing } from "../constants/EdenRing";

export default class PlayerUtils {
    private player: Player;
    private dimension: Dimension;
    private location: Vector3;
    constructor(player: Player) {
        this.player = player;
        this.dimension = player.dimension;
        this.location = player.location;
    }

    public teleportToEdenRing() {
        const isInPortal = this.dimension.getEntities({ type: EdenRing.portal, location: this.location, maxDistance: 1 });
        if (isInPortal.length > 0) {
            const recentlyTeleported = this.player.getDynamicProperty(EdenRing.recently_teleported) as boolean;
            if (recentlyTeleported) return;
            else this.player.teleport(this.location, { dimension: world.getDimension(EdenRing.dimension) });
        } else {
            this.player.setDynamicProperty(EdenRing.recently_teleported, false);
        }
    }
}