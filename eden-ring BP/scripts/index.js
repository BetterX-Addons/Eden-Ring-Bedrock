import { world, system, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus } from "@minecraft/server";
import PlayerUtils from "./Utils/PlayerUtils";
import ItemUtils from "./Utils/ItemUtils";
// ==========================================
// CONSTANTS
// ==========================================
import { EdenRing } from "./constants/EdenRing";
// ==========================================
// REGISTRATION
// ==========================================
system.beforeEvents.startup.subscribe(e => {
    // ==========================================
    // DEV COMMANDS
    // ==========================================
    // Despawn Command
    const despawnCommand = { name: 'edenring:despawn_all', description: "Despawn All Entities", permissionLevel: CommandPermissionLevel.Admin };
    e.customCommandRegistry.registerCommand(despawnCommand, e => {
        system.run(() => {
            const entities = e.sourceEntity?.dimension.getEntities({ excludeTypes: ["minecraft:player"] });
            entities?.forEach(entity => {
                entity.remove();
            });
        });
    });
    // Teleport to Dimension
    const dimensionEnums = ["overworld", "nether", "the_end", EdenRing.dimension];
    const teleportCommand = { name: 'edenring:teleport_to', description: "Teleport to another dimension", permissionLevel: CommandPermissionLevel.Admin, mandatoryParameters: [{ type: CustomCommandParamType.Enum, name: EdenRing.dimension }] };
    e.customCommandRegistry.registerEnum(EdenRing.dimension, dimensionEnums);
    e.customCommandRegistry.registerCommand(teleportCommand, switchDimensionsCommand);
    function switchDimensionsCommand(origin, dimensionId) {
        const entity = origin.sourceEntity;
        if (!entity)
            return { status: CustomCommandStatus.Failure, message: "No entity found" };
        system.run(() => {
            entity.teleport(entity.location, { dimension: world.getDimension(dimensionId) });
        });
        return {
            status: CustomCommandStatus.Success,
            message: `Teleported to ${dimensionId}`,
        };
    }
    // Eden Ring Dimension
    e.dimensionRegistry.registerCustomDimension(EdenRing.dimension);
});
// ==========================================
// TICKING
// ==========================================
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const utils = new PlayerUtils(player);
        utils.teleportToEdenRing();
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
