export default class ItemUtils {
    constructor(itemStack, source, block) {
        this.itemStack = itemStack;
        this.source = source;
        this.block = block;
        this.typeId = itemStack.typeId;
    }
    flintOpenPortal() {
        if (this.block?.typeId !== "minecraft:gold_block")
            return;
        const { location: loc, dimension } = this.block;
        const portalEntity = dimension.getEntities({ maxDistance: 2, location: loc, type: "edenring:portal" });
        if (portalEntity.length > 0)
            return;
        console.warn(portalEntity.length);
        const validatePortal = (offsets) => offsets.every(([x, y, z, type]) => dimension.getBlock({
            x: loc.x + x,
            y: loc.y + y,
            z: loc.z + z,
        })?.isValid);
        const offsets = [
            [0, 0, 1, "minecraft:copper_block"],
            [0, 0, -1, "minecraft:copper_block"],
            [1, 0, 0, "minecraft:copper_block"],
            [-1, 0, 0, "minecraft:copper_block"],
            [1, 0, 1, "minecraft:copper_block"],
            [-1, 0, -1, "minecraft:copper_block"],
            [-1, 0, 1, "minecraft:copper_block"],
            [1, 0, -1, "minecraft:copper_block"],
            [2, 0, 2, "minecraft:copper_block"],
            [2, 0, -2, "minecraft:copper_block"],
            [-2, 0, 2, "minecraft:copper_block"],
            [-2, 0, -2, "minecraft:copper_block"],
            [2, 0, 1, "minecraft:cut_copper_stairs"],
            [2, 0, 0, "minecraft:cut_copper_stairs"],
            [2, 0, -1, "minecraft:cut_copper_stairs"],
            [-2, 0, 1, "minecraft:cut_copper_stairs"],
            [-2, 0, 0, "minecraft:cut_copper_stairs"],
            [-2, 0, -1, "minecraft:cut_copper_stairs"],
            [1, 0, 2, "minecraft:cut_copper_stairs"],
            [0, 0, 2, "minecraft:cut_copper_stairs"],
            [-1, 0, 2, "minecraft:cut_copper_stairs"],
            [1, 0, -2, "minecraft:cut_copper_stairs"],
            [0, 0, -2, "minecraft:cut_copper_stairs"],
            [-1, 0, -2, "minecraft:cut_copper_stairs"],
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
