import { world, system } from "@minecraft/server";
import ItemUtils from "Utils/ItemUtils";
import PlayerUtils from "Utils/PlayerUtils";

world.afterEvents.itemUseOn.subscribe(e => {
    const { block, itemStack, source } = e;
    new ItemUtils(itemStack, source, block);
    const utils =new ItemUtils(itemStack, source, block);
    utils.flintOpenPortal();
});

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const utils = new PlayerUtils(player);
        utils.waila();
    }
});