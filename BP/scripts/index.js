import { world, system } from "@minecraft/server";
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        player.sendMessage('a');
    }
});
