import { world, system } from '@minecraft/server';
import { TaskScheduler } from "woodset/TaskScheduler";


system.beforeEvents.startup.subscribe((init) => {
    init.blockComponentRegistry.registerCustomComponent("edenring:button_config", {
        onPlayerInteract(e, p) {
            const { block, player, dimension } = e;
            const { on_sound, off_sound } = p.params;

            const permutation = block.permutation;
            const state = permutation.getState("edenring:button_pressed_bit");

            if (state === true) return;

            block.setPermutation(block.permutation.withState("edenring:button_pressed_bit", true));

            if (on_sound) block.dimension.playSound(on_sound, block.center(), { pitch: 1.25 });

            TaskScheduler.schedule(block, "edenring:button_active", 30, { sound: off_sound });

        }
    });
});

TaskScheduler.register("edenring:button_active", ({ block, data }) => {
    if (block) {
        block.setPermutation(block.permutation.withState("edenring:button_pressed_bit", false));
        if (data.sound) block.dimension.playSound(data.sound, block.center());
    }
});


world.afterEvents.playerBreakBlock.subscribe((e) => {
    const { block, brokenBlockPermutation } = e;

    if (brokenBlockPermutation.hasTag("active_button")) {
        TaskScheduler.cancel(block);
    }
});