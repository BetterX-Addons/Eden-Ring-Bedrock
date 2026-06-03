import { Block, BlockCustomComponent, EquipmentSlot, ItemStack, Vector3 } from "@minecraft/server";

const boneMeal = 'minecraft:bone_meal';
const growthParticle = 'minecraft:crop_growth_emitter';

export const randomPlantComponent: BlockCustomComponent = {
    beforeOnPlayerPlace(e, { params }) {
        const permutation = e.permutationToPlace;
        const p = params as { max_states: number };
        const maxStates = p.max_states;
        const randomVariant = getRandomVariant(maxStates);
        const newPermutation = permutation.withState('edenring:random', randomVariant);
        e.permutationToPlace = newPermutation;
    },
    onPlayerInteract({ block, player, dimension }, { params }) {
        const p = params as { max_states: number };
        const equipment = player?.getComponent('equippable');
        const item = equipment?.getEquipment(EquipmentSlot.Mainhand);
        if (item?.typeId === boneMeal) {
            dimension.spawnItem(new ItemStack(block.typeId), getFixedLocation(block));
            item.amount -= 1;
            equipment?.setEquipment(EquipmentSlot.Mainhand, item);
            dimension.spawnParticle(growthParticle, particleLocation(block));
        }
    }
};

function getRandomVariant(maxStates: number): number {
    // Implement logic to get a random variant within the allowed range (0, maxStates)
    return Math.floor(Math.random() * maxStates);
}

function getFixedLocation(block: Block): Vector3 {
    const loc = block.location;
    return { x: loc.x + 0.5, y: loc.y + 1, z: loc.z + 0.5 };
}

function particleLocation(block: Block): Vector3 {
    const loc = block.location;
    return { x: loc.x + 0.5, y: loc.y, z: loc.z + 0.5 };
}