export const slimeBlockComponent = {
    onStepOn({ block, entity }, { params }) {
        const p = params;
        const velocity = entity?.getVelocity();
        if (!velocity)
            return;
        if (velocity?.y < 0) {
            entity?.applyKnockback({ x: 0, z: 0 }, Math.abs(velocity.y));
        }
    }
};
