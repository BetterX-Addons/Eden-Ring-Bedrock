import { world, system } from "@minecraft/server";

/** @param {number} playerYRotation */
function getPreciseRotation(playerYRotation) {
    if (playerYRotation < 0) playerYRotation += 360;
    const rotation = Math.round(playerYRotation / 22.5);

    return rotation !== 16 ? rotation : 0;
}

/** @type {import("@minecraft/server").BlockCustomComponent} */
const SignRotationBlockComponent = {
    beforeOnPlayerPlace(event) {
        const { player } = event;
        if (!player) return;

        const blockFace = event.permutationToPlace.getState("minecraft:block_face");
        if (blockFace !== "up") return;

        const playerYRotation = player.getRotation().y;
        const rotation = getPreciseRotation(playerYRotation);

        event.permutationToPlace = event.permutationToPlace.withState("wiki:rotation", rotation);
    },
};

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("edenring:sign_rotation", SignRotationBlockComponent);
});


const HangingSignRotationBlockComponent = {
    beforeOnPlayerPlace(event) {
        const { player } = event;
        if (!player) return;

        const aboveBlock = event.block.above();

        const blockFace = event.permutationToPlace.getState("minecraft:block_face");
        if (blockFace !== "down") return;

        if (aboveBlock.typeId.includes("fence") || aboveBlock.typeId.includes("bars") || aboveBlock.typeId.includes("chain")) {
            event.permutationToPlace = event.permutationToPlace.withState("horizons:fence", true);
        }

        const playerYRotation = player.getRotation().y;
        const rotation = getPreciseRotation(playerYRotation);


        event.permutationToPlace = event.permutationToPlace.withState("wiki:rotation", rotation);
    },
};

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("edenring:hanging_sign_rotation", HangingSignRotationBlockComponent);
});
