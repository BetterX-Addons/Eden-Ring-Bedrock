import { Block, BlockCustomComponent, EquipmentSlot, Vector3, world } from "@minecraft/server";

const boneMeal = 'minecraft:bone_meal';
const growthParticle = 'minecraft:crop_growth_emitter';
const vineStateKey = "betternether:vine";

// States:
// Con roots (has_roots: true):  0 = roots, 1 = middle, 2 = top/bottom
// Sin roots (has_roots: false): 0 = middle, 1 = top/bottom

function debug(message: string): void {
    world.sendMessage(`[VineBlock] ${message}`);
}

export const vineComponent: BlockCustomComponent = {
    onRandomTick({ block, dimension }, { params }) {
        const p = params as { grow_direction: "up" | "down"; has_roots: boolean };
        const direction = p.grow_direction === "up" ? "Up" : "Down";
        
        debug(`Random tick en ${JSON.stringify(block.location)} | Dirección: ${direction} | Has roots: ${p.has_roots}`);
        
        // No crecemos si ya hay un bloque en la dirección de crecimiento
        if (getBlockInDirection(block, direction)) {
            debug(`  → Bloqueado: ya hay un bloque en la dirección ${direction}`);
            return;
        }
        
        // 10% de chance de no crecer
        if (Math.random() < 0.1) {
            debug(`  → Chance fallida (10% de no crecer)`);
            return;
        }
        
        const vineState = getVineState(block);
        const topState = getTopState(p.has_roots);
        
        debug(`  → Estado actual: ${vineState} | Estado máximo: ${topState}`);
        
        applyGrowth(block, dimension, vineState, topState, p.has_roots, direction);
    },
    
    onPlayerInteract({ block, player, dimension }, { params }) {
        const p = params as { grow_direction: "up" | "down"; has_roots: boolean };
        const equipment = player?.getComponent('equippable');
        const item = equipment?.getEquipment(EquipmentSlot.Mainhand);
        
        debug(`Player interact en ${JSON.stringify(block.location)} | Item: ${item?.typeId}`);
        
        if (item?.typeId !== boneMeal) {
            debug(`  → Item no es bone meal`);
            return;
        }
        
        const direction = p.grow_direction === "up" ? "Up" : "Down";
        
        // No crecemos si ya hay un bloque en la dirección de crecimiento
        if (getBlockInDirection(block, direction)) {
            debug(`  → Bloqueado: ya hay un bloque en la dirección ${direction}`);
            return;
        }
        
        const vineState = getVineState(block);
        const topState = getTopState(p.has_roots);
        
        debug(`  → Estado actual: ${vineState} | Estado máximo: ${topState} | Has roots: ${p.has_roots}`);
        
        applyGrowth(block, dimension, vineState, topState, p.has_roots, direction);
        
        item.amount -= 1;
        equipment?.setEquipment(EquipmentSlot.Mainhand, item);
        debug(`  → Bone meal consumido. Cantidad restante: ${item.amount}`);
    }
};

function getTopState(hasRoots: boolean): number {
    return hasRoots ? 2 : 1;
}

function getBlockInDirection(block: Block, direction: "Up" | "Down"): Block | undefined {
    return direction === "Up" ? block.above() : block.below();
}

function getVineState(block: Block): number {
    return block.permutation.getState(vineStateKey) as number;
}

function setVineState(block: Block, state: number): void {
    const newPermutation = block.permutation.withState(vineStateKey, state);
    block.setPermutation(newPermutation);
}

function getFixedLocation(block: Block): Vector3 {
    const loc = block.location;
    return { x: loc.x + 0.5, y: loc.y, z: loc.z + 0.5 };
}

function getMiddleState(hasRoots: boolean): number {
    return hasRoots ? 1 : 0;
}

function applyGrowth(block: Block, dimension: any, vineState: number, topState: number, hasRoots: boolean, direction: "Up" | "Down"): void {
    const middleState = getMiddleState(hasRoots);
    
    // Si no estamos en el estado top/bottom, promovemos el bloque actual
    if (vineState < topState) {
        const newState = vineState + 1;
        setVineState(block, newState);
        debug(`  → Promoción: ${vineState} → ${newState}`);
    } else {
        // Si ya somos top/bottom, creamos un nuevo bloque en la dirección de crecimiento con estado middle
        const nextBlock = getBlockInDirection(block, direction);
        if (nextBlock) {
            setVineState(nextBlock, middleState);
            debug(`  → Nuevo bloque creado en dirección ${direction} con estado ${middleState}`);
        } else {
            debug(`  → No hay bloque en dirección ${direction}`);
        }
    }
    
    // Spawn particles en la ubicación actual
    dimension.spawnParticle(growthParticle, getFixedLocation(block));
}