import { world, system, BlockPermutation } from "@minecraft/server";
import { NearbearEvents } from "woodset/NearbearEvents";

const adjacentFunction = {
    Down: b => b.above(),
    Up: b => b.below()
};

system.beforeEvents.startup.subscribe((init) => {
    init.blockComponentRegistry.registerCustomComponent("edenring:slab_config", {
        beforeOnPlayerPlace(e, p) {
            const { block, permutationToPlace, face, player } = e;


            if (face !== "Down" && face !== "Up") return;

            const slabBlock = adjacentFunction[face](block);
            const slabBit = slabBlock.permutation.getState("minecraft:vertical_half");
            const slabFullBit = slabBlock.permutation.getState("edenring:block_bit");


            const toPlaceId = permutationToPlace.type.id;
            const blockid = slabBlock.typeId;

            if (
                (face === "Down" && slabBit === 'top' && toPlaceId === blockid) ||
                (face === "Up" && slabBit === 'bottom' && toPlaceId === blockid) && slabFullBit == false
            ) {
                e.cancel = true;
            }
        }
    });
});

NearbearEvents.registerBehaviourByEvent("edenring:slab", {
    customFilter: (itemStack, block, face) => {
        if (itemStack.typeId === block.typeId) {
            const slabBit = block.permutation.getState("minecraft:vertical_half");
            const slabFullBit = block.permutation.getState("edenring:block_bit");
            if (
                (face === "Down" && slabBit === 'top') ||
                (face === "Up" && slabBit === 'bottom') && slabFullBit == false
            ) {
                return true;
            }
        }
        return false;
    },
    onInteract(e, p) {
        const { block, player, itemStack } = e;
        const { placing_sound } = p;

        block.setPermutation(block.permutation.withState("edenring:block_bit", true));

        if (placing_sound) {
            block.dimension.playSound(placing_sound, block.center());
        }


        if (player.getGameMode() === "Survival") {
            if (itemStack) {
                if (itemStack.amount > 1) {
                    itemStack.amount -= 1;
                    inv.setItem(slot, itemStack);
                } else {
                    inv.setItem(slot, undefined);
                }
            }
        }


    }
});



