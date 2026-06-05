import { world, system, BlockPermutation, ItemStack } from '@minecraft/server';
import { NearbearEvents, ReduceDurability } from 'woodset/NearbearEvents';

NearbearEvents.registerBehaviourByEvent("custom_log", {
    item_tag: "minecraft:is_axe",
    onInteract(e, p) {
        const { block, player, itemStack } = e;
        const { stripped, strip_sound } = p;

        if (stripped && strip_sound) {
            const oldStates = block.permutation.getAllStates();
            let newPermutation = BlockPermutation.resolve(stripped);

            for (const [stateName, stateValue] of Object.entries(oldStates)) {
                try {
                    newPermutation = newPermutation.withState(stateName, stateValue);
                } catch (err) {
                }
            }

            block.dimension.playSound(strip_sound, block.center(), { pitch: 0.8 });
            ReduceDurability(player, itemStack, 1, "Mainhand");

            block.setPermutation(newPermutation);
        }
    }
});