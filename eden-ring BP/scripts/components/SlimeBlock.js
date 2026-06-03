export const slimeBlockComponent = {
    onEntityFallOn({ block, entity }, { params }) {
        const p = params;
        const speed = entity?.getDynamicProperty('edenring:speed');
        const bound = Math.abs(speed.y ? speed.y : 0) * p.bound;
        const force = { x: 0, y: bound < 0.3 ? 0 : bound, z: 0 };
        entity?.applyImpulse(force);
    }
};
