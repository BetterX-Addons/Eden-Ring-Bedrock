import { world, system } from "@minecraft/server";
import PlayerUtils from "Utils/PlayerUtils";
import ItemUtils from "./Utils/ItemUtils";

// ==========================================
// CONSTANTS
// ==========================================

const EDEN_RING_DIMENSION_ID = "eden_rig:dimension";

// ==========================================
// REGISTRATION
// ==========================================

system.beforeEvents.startup.subscribe(e => {
    e.dimensionRegistry.registerCustomDimension(EDEN_RING_DIMENSION_ID)
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

world.afterEvents.itemStartUseOn.subscribe(e => {
    const { block, itemStack: item, source: player } = e;
    if (!item) return;
    const utils = new ItemUtils(item, player, block);

    // Open Portal
    if (item.typeId === 'minecraft:flint_and_steel') utils.flintOpenPortal();
});