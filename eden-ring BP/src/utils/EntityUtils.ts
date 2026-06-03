import { Dimension, Entity, Vector3 } from "@minecraft/server";

export default class EntityUtils {
    private entity: Entity;
    private dimension: Dimension;
    private location: Vector3;
    constructor(entity: Entity) {
        this.entity = entity;
        this.dimension = entity.dimension;
        this.location = entity.location;
    }

    public saveVelocity(): void {
        const velocity = this.entity.getVelocity();

        if (velocity.y < 0) {
            this.entity.setDynamicProperty(
                "edenring:speedY",
                velocity.y
            );
        }
    }
}