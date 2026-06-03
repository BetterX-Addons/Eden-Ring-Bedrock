import { Block, BlockCustomComponent, Vector3 } from "@minecraft/server";

export const slimeBlockComponent: BlockCustomComponent = {
    onEntityFallOn({ block, entity }, { params }) {
        const p = params as { bound: number };
        const speed = entity?.getDynamicProperty('edenring:speed') as Vector3;
        const bound = Math.abs(speed.y ? speed.y : 0) * p.bound;
        const force = { x: 0, y: bound < 0.3 ? 0 : bound, z: 0 };
        entity?.applyImpulse(force);
    }
};

