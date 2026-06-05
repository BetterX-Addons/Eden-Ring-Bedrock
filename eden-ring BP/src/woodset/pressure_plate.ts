import { world, system } from '@minecraft/server';
import { NearbearEvents } from "woodset/NearbearEvents";

const PRESSURE_TAG = "edenring:pressure_plate";

NearbearEvents.registerBehaviourByEvent(PRESSURE_TAG, {

    onPassingIn(e, p) {
        const { block } = e;
        const permutation = block.permutation;
        const state = permutation.getState(PRESSURE_TAG);

        if (state === "on") return; // Ya activa

        block.setPermutation(permutation.withState(PRESSURE_TAG, "on"));
        block.dimension.playSound("click_on.wooden_pressure_plate", block.center());
    },

    onPassingOut(e, p) {
        const { block } = e;
        const permutation = block.permutation;
        const state = permutation.getState(PRESSURE_TAG);

        if (state !== "on") return;

        block.setPermutation(permutation.withState(PRESSURE_TAG, "wait"));
    }
});


system.beforeEvents.startup.subscribe((init) => {
    init.blockComponentRegistry.registerCustomComponent("edenring:pressure_plate_setting", {
        onTick(e, p) {
            const { block, dimension } = e;
            const permutation = block.permutation;
            const state = permutation.getState(PRESSURE_TAG);

            if (state !== "wait") return;

            // 🔍 Comprobamos si hay entidades encima
            const center = block.center();
            const entities = dimension.getEntities({
                maxDistance: 0.6,
                location: center
            });

            if (entities.length > 0) {
                block.setPermutation(permutation.withState(PRESSURE_TAG, "on"));
                return;
            }

            block.setPermutation(permutation.withState(PRESSURE_TAG, "off"));
            dimension.playSound("click_off.wooden_pressure_plate", center);
        }
    });
});