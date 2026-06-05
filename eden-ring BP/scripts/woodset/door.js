import { system, BlockPermutation, ItemStack } from "@minecraft/server";
import { canSupport } from 'woodset/solidityUtils';
const RelativeCardinalDirection = {
    north: { east: 'east', west: 'west' },
    south: { east: 'west', west: 'east' },
    east: { east: 'south', west: 'north' },
    west: { east: 'north', west: 'south' }
};
const adjacentFunction = {
    north: b => b.north(),
    south: b => b.south(),
    east: b => b.east(),
    west: b => b.west()
};
system.beforeEvents.startup.subscribe((init) => {
    init.blockComponentRegistry.registerCustomComponent("edenring:door_config", {
        beforeOnPlayerPlace(e, p) {
            const { block, permutationToPlace, dimension } = e;
            const topBlock = block.above();
            let hingeFlag = false;
            if (!topBlock.isAir) {
                e.cancel = true;
                return;
            }
            const rotation = permutationToPlace.getState("minecraft:cardinal_direction");
            const eastDir = RelativeCardinalDirection[rotation].east;
            const eastBlock = adjacentFunction[eastDir](block);
            const eastAboveBlock = eastBlock.above();
            const westDir = RelativeCardinalDirection[rotation].west;
            const westBlock = adjacentFunction[westDir](block);
            const westAboveBlock = westBlock.above();
            if ((westBlock.typeId == permutationToPlace.type.id || westAboveBlock.typeId == permutationToPlace.type.id)) {
                e.permutationToPlace = permutationToPlace.withState("edenring:door_hinge_bit", true);
                hingeFlag = true;
            }
            if ((canSupport(eastBlock, "east") || canSupport(eastAboveBlock, "east"))
                && (eastBlock.typeId !== permutationToPlace.type.id || eastAboveBlock.typeId !== permutationToPlace.type.id)) {
                e.permutationToPlace = permutationToPlace.withState("edenring:door_hinge_bit", true);
                hingeFlag = true;
            }
            // SPAWN TOP BLOCK
            system.runTimeout(() => {
                topBlock.setPermutation(BlockPermutation.resolve(block.typeId));
                topBlock.setPermutation(topBlock.permutation.withState("edenring:upper_block_bit", true).withState("minecraft:cardinal_direction", rotation).withState("edenring:door_hinge_bit", hingeFlag));
            });
        },
        onPlayerInteract(e, p) {
            setGateOpenState(e.block, p.params);
        },
        // Break Event
        onPlayerBreak(e) {
            const { block, brokenBlockPermutation, dimension, player } = e;
            const topBlock = block.above();
            const bottomBlock = block.below();
            const isUpper = brokenBlockPermutation.getState("edenring:upper_block_bit");
            if (isUpper) {
                if (bottomBlock.typeId === brokenBlockPermutation.type.id) {
                    const { x, y, z } = bottomBlock.location;
                    dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`);
                }
            }
            else {
                if (topBlock.typeId === brokenBlockPermutation.type.id) {
                    const { x, y, z } = topBlock.location;
                    dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`);
                }
            }
            if (player.getGameMode() != "Creative") {
                dimension.spawnItem(new ItemStack(brokenBlockPermutation.type.id, 1), block.center());
            }
            ;
        },
        onRedstoneUpdate(e, p) {
            const { block, powerLevel, previousPowerLevel } = e;
            if (powerLevel === 0 && previousPowerLevel === 0)
                return;
            const permutation = block.permutation;
            const isUpper = permutation.getState("edenring:upper_block_bit");
            const currentOpen = permutation.getState("edenring:open_bit");
            const counterpart = isUpper ? block.below() : block.above();
            const counterpartPower = counterpart ? counterpart.getRedstonePower() : 0;
            const shouldBeOpen = (powerLevel > 0 || counterpartPower > 0);
            // 4. Ejecutar cambios solo si el estado deseado es diferente al actual
            if (shouldBeOpen !== currentOpen) {
                setGateOpenState(block, p.params);
            }
        }
    });
});
/**
 * Cambia el estado de apertura de una compuerta de dos bloques (tipo puerta o portón).
 * @param {Block} block - El bloque base o superior de la compuerta.
 * @param {object} params - Parámetros del comportamiento (puede incluir open_sound, close_sound, etc.).
 * @param {boolean} [forceState] - Si se define, fuerza abrir (true) o cerrar (false). Si se omite, alterna automáticamente.
 */
export function setGateOpenState(block, params = {}) {
    if (!block)
        return;
    const topBlock = block.above();
    const bottomBlock = block.below();
    const { open_sound, close_sound } = params;
    const permutation = block.permutation;
    const isUpper = permutation.getState("edenring:upper_block_bit");
    const currentOpen = permutation.getState("edenring:open_bit");
    // Determinar nuevo estado
    const newState = !currentOpen;
    // Si ya está en ese estado, no hacer nada
    if (currentOpen === newState)
        return;
    // Actualizar bloque actual
    block.setPermutation(permutation.withState("edenring:open_bit", newState));
    // Actualizar contraparte (arriba o abajo)
    const counterpart = isUpper ? bottomBlock : topBlock;
    if (counterpart) {
        try {
            counterpart.setPermutation(counterpart.permutation.withState("edenring:open_bit", newState));
        }
        catch { }
    }
    // Reproducir sonido
    const soundToPlay = newState ? open_sound : close_sound;
    if (soundToPlay)
        block.dimension.playSound(soundToPlay, block.location);
}
