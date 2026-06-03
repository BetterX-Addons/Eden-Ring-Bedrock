import { EquipmentSlot } from "@minecraft/server";
const boneMeal = 'minecraft:bone_meal';
const growthParticle = 'minecraft:crop_growth_emitter';
export const seedPlantComponent = {
    onRandomTick({ block }, { params }) {
        const p = params;
        const max = p.max_size;
        const permutation = block.permutation;
        const fixedLocation = getFixedLocation(block);
        const growth = permutation.getState("edenring:growth");
        if (growth < max) {
            const chance = Math.random();
            if (chance < 0.1)
                return;
            setSize(block, growth, fixedLocation);
        }
    },
    onPlayerInteract({ block, player }, { params }) {
        const equipment = player?.getComponent('equippable');
        const item = equipment?.getEquipment(EquipmentSlot.Mainhand);
        const permutation = block.permutation;
        const fixedLocation = getFixedLocation(block);
        const growth = permutation.getState("edenring:growth");
        const max = getMaxGrowth(block);
        if (item?.typeId === boneMeal && growth < max) {
            setSize(block, growth, fixedLocation);
            item.amount -= 1;
            equipment?.setEquipment(EquipmentSlot.Mainhand, item);
        }
    }
};
function getMaxGrowth(block) {
    // TAG ON BLOCKS IS LIKE: "betternether:max_growth:3"
    const tag = block.getTags().find(e => e.startsWith("edenring:max_growth"));
    return parseInt(tag?.split(':')[2] ?? '0') || 0;
}
function getFixedLocation(block) {
    const loc = block.location;
    return { x: loc.x + 0.5, y: loc.y, z: loc.z + 0.5 };
}
function setSize(block, growth, fixedLocation) {
    const dimension = block.dimension;
    const permutation = block.permutation;
    const newSize = permutation.withState("edenring:growth", growth + 1);
    block.setPermutation(newSize);
    dimension.spawnParticle(growthParticle, fixedLocation);
}
