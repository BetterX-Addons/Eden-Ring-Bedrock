import { world, system, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, Player } from "@minecraft/server";
import PlayerUtils from "./utils/PlayerUtils";
import EntityUtils from "./utils/EntityUtils";
import ItemUtils from "./utils/ItemUtils";
// ==========================================
// CONSTANTS
// ==========================================
import { EdenRing } from "./constants/EdenRing";
// ==========================================
// COMPONENTS
// ==========================================
import { seedPlantComponent } from "components/SeedPlant";
import { randomPlantComponent } from "components/RandomPlant";
import { grassBlockComponent } from "components/GrassBlock";
import { vineComponent } from "components/VineBlock";
import { slimeBlockComponent } from "components/SlimeBlock";
// ==========================================
// REGISTRATION
// ==========================================
system.beforeEvents.startup.subscribe(e => {
    // ==========================================
    // EDEN RING BLOCK COMPONENTS
    // ==========================================
    e.blockComponentRegistry.registerCustomComponent("edenring:growth", seedPlantComponent);
    e.blockComponentRegistry.registerCustomComponent("edenring:random", randomPlantComponent);
    e.blockComponentRegistry.registerCustomComponent("edenring:bone_meal_vegetation", grassBlockComponent);
    e.blockComponentRegistry.registerCustomComponent("edenring:vine", vineComponent);
    e.blockComponentRegistry.registerCustomComponent("edenring:slime_block", slimeBlockComponent);
    // ==========================================
    // EDEN RING ITEM COMPONENTS
    // ==========================================
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
    const dimensions = ["overworld", "the_end", "nether", "edenring:dimension"]
        .forEach(dimension => {
        for (const entity of world.getDimension(dimension).getEntities()) {
            if (entity instanceof Player) {
                const player = entity;
                const utils = new PlayerUtils(player);
                utils.teleportToEdenRing();
                utils.applyEdenRingGravity();
            }
            const utils = new EntityUtils(entity);
            utils.saveVelocity();
        }
    });
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
