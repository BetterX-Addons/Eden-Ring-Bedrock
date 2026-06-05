import { world, system, BlockPermutation } from "@minecraft/server";

system.beforeEvents.startup.subscribe((init) => {
    init.blockComponentRegistry.registerCustomComponent("betterend:trapdoor_config", {
        onPlayerInteract(e, p) {
            const { block, } = e;
            const { open_sound, close_sound } = p.params;

            const openBitValue = block.permutation.getState("betterend:open_bit");
            let toggle = !openBitValue;
            block.setPermutation(block.permutation.withState("betterend:open_bit", toggle));

            if (openBitValue && close_sound && open_sound) {
                block.dimension.playSound(close_sound, block.location);
            } else {
                block.dimension.playSound(open_sound, block.location);

            }
        },
        onRedstoneUpdate(e, p) {
            const { block, powerLevel, previousPowerLevel } = e;
            const { open_sound, close_sound } = p.params;
            
            if (powerLevel === 0 && previousPowerLevel === 0) return;

            const openBitValue = block.permutation.getState("betterend:open_bit");
            if (powerLevel === 0 && openBitValue === false) return;
            if (powerLevel >= 1 && openBitValue === true) return;


            let toggle = !openBitValue;
            block.setPermutation(block.permutation.withState("betterend:open_bit", toggle));




            if (openBitValue && close_sound && open_sound) {
                block.dimension.playSound(close_sound, block.location);
            } else {
                block.dimension.playSound(open_sound, block.location);

            }
        }

    });
});
