import { Block, BlockCustomComponent, Vector3 } from "@minecraft/server";

export const slimeBlockComponent: BlockCustomComponent = {
    onStepOn({ block, entity }, { params }) {
        const p = params as { bound: number };
        const velocity = entity?.getVelocity();
        if (!velocity) return;
        if (velocity?.y < 0) {
            entity?.applyKnockback({ x: 0, z: 0 }, Math.abs(velocity.y));
        }
    }
};