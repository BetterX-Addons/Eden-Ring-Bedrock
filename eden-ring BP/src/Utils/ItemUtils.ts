import {
  Block,
  Entity,
  ItemStack,
  Vector3,
  Direction,
} from "@minecraft/server";

export default class ItemUtils {
    private itemStack: ItemStack;
    private source?: Entity;
    private block?: Block;
    private typeId: string;
    constructor(itemStack: ItemStack, source?: Entity, block?: Block) {
        this.itemStack = itemStack;
        this.source = source;
        this.block = block;
        this.typeId = itemStack.typeId;
    }

    flintOpenPortal() {
        if (this.block?.typeId !== "minecraft:gold_block") return;

        const { location: loc, dimension } = this.block;

        const validatePortal = (offsets: Array<[number, number, number, string]>) =>
        offsets.every(
        ([x, y, z, type]) =>
            dimension.getBlock({
            x: loc.x + x,
            y: loc.y + y,
            z: loc.z + z,
            })?.typeId === type,
        );

        const offsets = [
            // Waxed copper (nivel 0)
            [0, 0, 1, "minecraft:waxed_copper"],
            [0, 0, -1, "minecraft:waxed_copper"],
            [1, 0, 0, "minecraft:waxed_copper"],
            [-1, 0, 0, "minecraft:waxed_copper"],
            [1, 0, 1, "minecraft:waxed_copper"],
            [-1, 0, -1, "minecraft:waxed_copper"],
            [-1, 0, 1, "minecraft:waxed_copper"],
            [1, 0, -1, "minecraft:waxed_copper"],
            [2, 0, 2, "minecraft:waxed_copper"],
            [2, 0, -2, "minecraft:waxed_copper"],
            [-2, 0, 2, "minecraft:waxed_copper"],
            [-2, 0, -2, "minecraft:waxed_copper"],
            // Waxed copper stairs (nivel 0)
            [2, 0, 1, "minecraft:waxed_cut_copper_stairs"],
            [2, 0, 0, "minecraft:waxed_cut_copper_stairs"],
            [2, 0, -1, "minecraft:waxed_cut_copper_stairs"],
            [-2, 0, 1, "minecraft:waxed_cut_copper_stairs"],
            [-2, 0, 0, "minecraft:waxed_cut_copper_stairs"],
            [-2, 0, -1, "minecraft:waxed_cut_copper_stairs"],
            [1, 0, 2, "minecraft:waxed_cut_copper_stairs"],
            [0, 0, 2, "minecraft:waxed_cut_copper_stairs"],
            [-1, 0, 2, "minecraft:waxed_cut_copper_stairs"],
            [1, 0, -2, "minecraft:waxed_cut_copper_stairs"],
            [0, 0, -2, "minecraft:waxed_cut_copper_stairs"],
            [-1, 0, -2, "minecraft:waxed_cut_copper_stairs"],
            // Amethyst blocks (nivel +1)
            [2, 1, 2, "minecraft:amethyst_block"],
            [2, 1, -2, "minecraft:amethyst_block"],
            [-2, 1, 2, "minecraft:amethyst_block"],
            [-2, 1, -2, "minecraft:amethyst_block"],
            // Amethyst clusters (nivel +2)
            [2, 2, 2, "minecraft:amethyst_cluster"],
            [2, 2, -2, "minecraft:amethyst_cluster"],
            [-2, 2, 2, "minecraft:amethyst_cluster"],
            [-2, 2, -2, "minecraft:amethyst_cluster"],
        ];

        if (validatePortal(offsets)) {
            const up = { x: loc.x + 0.5, y: loc.y + 1, z: loc.z + 0.5 };
            dimension.setBlockType(up, "air");
            dimension.spawnEntity("edenring:portal", up);
        }
    }
}
