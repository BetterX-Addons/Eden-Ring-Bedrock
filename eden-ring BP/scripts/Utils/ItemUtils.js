export default class ItemUtils {
    constructor(itemStack, source, block) {
        this.itemStack = itemStack;
        this.source = source;
        this.block = block;
        this.typeId = itemStack.typeId;
    }
    flintOpenPortal() {
        if (this.typeId === 'minecraft:flint_and_steel') {
            if (this.block?.typeId === 'minecraft:gold_block') {
                const { location: loc, dimension } = this.block;
                const portal = [
                    // Waxed Copper Block
                    {
                        typeId: 'minecraft:waxed_copper',
                        vector: { x: loc.x, y: loc.y, z: loc.z + 1 }
                    },
                    {
                        typeId: 'minecraft:waxed_copper',
                        vector: { x: loc.x, y: loc.y, z: loc.z - 1 }
                    },
                    {
                        typeId: 'minecraft:waxed_copper',
                        vector: { x: loc.x + 1, y: loc.y, z: loc.z }
                    },
                    {
                        typeId: 'minecraft:waxed_copper',
                        vector: { x: loc.x - 1, y: loc.y, z: loc.z }
                    },
                    {
                        typeId: 'minecraft:waxed_copper',
                        vector: { x: loc.x + 1, y: loc.y, z: loc.z + 1 }
                    },
                    {
                        typeId: 'minecraft:waxed_copper',
                        vector: { x: loc.x - 1, y: loc.y, z: loc.z - 1 }
                    },
                    {
                        typeId: 'minecraft:waxed_copper',
                        vector: { x: loc.x - 1, y: loc.y, z: loc.z + 1 }
                    },
                    {
                        typeId: 'minecraft:waxed_copper',
                        vector: { x: loc.x + 1, y: loc.y, z: loc.z - 1 }
                    },
                    {
                        typeId: 'minecraft:waxed_copper',
                        vector: { x: loc.x + 2, y: loc.y, z: loc.z + 2 }
                    },
                    {
                        typeId: 'minecraft:waxed_copper',
                        vector: { x: loc.x + 2, y: loc.y, z: loc.z - 2 }
                    },
                    {
                        typeId: 'minecraft:waxed_copper',
                        vector: { x: loc.x - 2, y: loc.y, z: loc.z + 2 }
                    },
                    {
                        typeId: 'minecraft:waxed_copper',
                        vector: { x: loc.x - 2, y: loc.y, z: loc.z - 2 }
                    },
                    // Waxed Copper Stairs
                    {
                        typeId: 'minecraft:waxed_cut_copper_stairs',
                        vector: { x: loc.x + 2, y: loc.y, z: loc.z + 1 }
                    },
                    {
                        typeId: 'minecraft:waxed_cut_copper_stairs',
                        vector: { x: loc.x + 2, y: loc.y, z: loc.z }
                    },
                    {
                        typeId: 'minecraft:waxed_cut_copper_stairs',
                        vector: { x: loc.x + 2, y: loc.y, z: loc.z - 1 }
                    },
                    {
                        typeId: 'minecraft:waxed_cut_copper_stairs',
                        vector: { x: loc.x - 2, y: loc.y, z: loc.z + 1 }
                    },
                    {
                        typeId: 'minecraft:waxed_cut_copper_stairs',
                        vector: { x: loc.x - 2, y: loc.y, z: loc.z }
                    },
                    {
                        typeId: 'minecraft:waxed_cut_copper_stairs',
                        vector: { x: loc.x - 2, y: loc.y, z: loc.z - 1 }
                    },
                    {
                        typeId: 'minecraft:waxed_cut_copper_stairs',
                        vector: { x: loc.x + 1, y: loc.y, z: loc.z + 2 }
                    },
                    {
                        typeId: 'minecraft:waxed_cut_copper_stairs',
                        vector: { x: loc.x, y: loc.y, z: loc.z + 2 }
                    },
                    {
                        typeId: 'minecraft:waxed_cut_copper_stairs',
                        vector: { x: loc.x - 1, y: loc.y, z: loc.z + 2 }
                    },
                    {
                        typeId: 'minecraft:waxed_cut_copper_stairs',
                        vector: { x: loc.x + 1, y: loc.y, z: loc.z - 2 }
                    },
                    {
                        typeId: 'minecraft:waxed_cut_copper_stairs',
                        vector: { x: loc.x, y: loc.y, z: loc.z - 2 }
                    },
                    {
                        typeId: 'minecraft:waxed_cut_copper_stairs',
                        vector: { x: loc.x - 1, y: loc.y, z: loc.z - 2 }
                    },
                    // Amethyst Block
                    {
                        typeId: 'minecraft:amethyst_block',
                        vector: { x: loc.x + 2, y: loc.y + 1, z: loc.z + 2 }
                    },
                    {
                        typeId: 'minecraft:amethyst_block',
                        vector: { x: loc.x + 2, y: loc.y + 1, z: loc.z - 2 }
                    },
                    {
                        typeId: 'minecraft:amethyst_block',
                        vector: { x: loc.x - 2, y: loc.y + 1, z: loc.z + 2 }
                    },
                    {
                        typeId: 'minecraft:amethyst_block',
                        vector: { x: loc.x - 2, y: loc.y + 1, z: loc.z - 2 }
                    },
                    // Amethyst Cluster
                    {
                        typeId: 'minecraft:amethyst_cluster',
                        vector: { x: loc.x + 2, y: loc.y + 2, z: loc.z + 2 }
                    },
                    {
                        typeId: 'minecraft:amethyst_cluster',
                        vector: { x: loc.x + 2, y: loc.y + 2, z: loc.z - 2 }
                    },
                    {
                        typeId: 'minecraft:amethyst_cluster',
                        vector: { x: loc.x - 2, y: loc.y + 2, z: loc.z + 2 }
                    },
                    {
                        typeId: 'minecraft:amethyst_cluster',
                        vector: { x: loc.x - 2, y: loc.y + 2, z: loc.z - 2 }
                    },
                ];
                const validations = [];
                for (let i = 0; i < portal.length; i++) {
                    const targetBlock = dimension.getBlock(portal[i].vector);
                    if (targetBlock.typeId === portal[i].typeId)
                        validations.push(true);
                    else
                        validations.push(false);
                }
                if (validations.every(e => e === true)) {
                    const up = { x: loc.x + 0.5, y: loc.y + 1, z: loc.z + 0.5 };
                    dimension.setBlockType(up, 'air');
                    dimension.spawnEntity('edenring:portal', up);
                }
            }
        }
    }
}
