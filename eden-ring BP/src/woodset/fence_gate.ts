import { world, system, BlockPermutation } from "@minecraft/server";



system.beforeEvents.startup.subscribe((init) => {
    init.blockComponentRegistry.registerCustomComponent("edenring:fence_gate_config", {
        onPlayerInteract(e, p) {
            const { block, player } = e;
            const { open_sound, close_sound } = p.params;

            const interactionSide = getRelativePlayerSide(block, player);



            const openBitValue = block.permutation.getState("edenring:open_bit");
            let toggle = !openBitValue;
            block.setPermutation(block.permutation.withState("edenring:open_bit", toggle));
            block.setPermutation(block.permutation.withState("minecraft:cardinal_direction", interactionSide));
            if (openBitValue && close_sound && open_sound) {
                block.dimension.playSound(close_sound, block.location);
            } else if (open_sound) {
                block.dimension.playSound(open_sound, block.location);

            }
        },
        onRedstoneUpdate(e, p) {
            const { block, powerLevel, previousPowerLevel } = e;
            const { open_sound, close_sound } = p.params;

            if (powerLevel === 0 && previousPowerLevel === 0) return;

            const openBitValue = block.permutation.getState("edenring:open_bit");
            if (powerLevel === 0 && openBitValue === false) return;
            if (powerLevel >= 1 && openBitValue === true) return;

            let toggle = !openBitValue;
            block.setPermutation(block.permutation.withState("edenring:open_bit", toggle));

            if (openBitValue && close_sound && open_sound) {
                block.dimension.playSound(close_sound, block.location);
            } else {
                block.dimension.playSound(open_sound, block.location);

            }
        }

    });
});



/**
 * Determina de qué lado del bloque está el jugador, basándose en la alineación del bloque.
 * @param {Block} block - El bloque interactuado.
 * @param {Player} player - El jugador que interactúa.
 * @returns {string} "north", "south", "east" o "west".
 */
function getRelativePlayerSide(block, player) {
    const direction = block.permutation.getState("minecraft:cardinal_direction");
    const playerPos = player.location;
    const blockCenter = block.center();

    if (direction === "north" || direction === "south") {
        return (playerPos.z < blockCenter.z) ? "south" : "north";
    }

    if (direction === "east" || direction === "west") {
        return (playerPos.x < blockCenter.x) ? "east" : "west";
    }

    return "unknown";
}