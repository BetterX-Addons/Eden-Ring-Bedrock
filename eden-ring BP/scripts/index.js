import { world, system, CommandPermissionLevel } from "@minecraft/server";
import ItemUtils from "./Utils/ItemUtils";
// ==========================================
// CONSTANTS
// ==========================================
import { EdenRing } from "./constants/EdenRing";
// ==========================================
// REGISTRATION
// ==========================================
system.beforeEvents.startup.subscribe(e => {
    // Dev Commands
    const despawnCommand = { name: 'eden_ring:despawn_all', description: "Despawn All Entities", permissionLevel: CommandPermissionLevel.Admin };
    e.customCommandRegistry.registerCommand(despawnCommand, e => {
        system.run(() => {
            const entities = e.sourceEntity?.dimension.getEntities({ excludeTypes: ["minecraft:player"] });
            entities?.forEach(entity => {
                entity.remove();
            });
        });
    });
    // Eden Ring Dimension
    e.dimensionRegistry.registerCustomDimension(EdenRing.dimension);
});
// ==========================================
// TICKING
// ==========================================
system.runInterval(() => {
    for (const player of world.getPlayers()) {
    }
});
// ==========================================
// WORLD EVENTS
// ==========================================
world.afterEvents.itemUse.subscribe(e => {
    const { itemStack: item, source: player } = e;
    const block = player.getBlockFromViewDirection({ maxDistance: 8 })?.block;
    if (!item)
        return;
    const utils = new ItemUtils(item, player, block);
    // Open Portal
    if (item.typeId === 'minecraft:flint_and_steel') {
        utils.flintOpenPortal();
    }
});
