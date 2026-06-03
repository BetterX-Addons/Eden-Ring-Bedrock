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
        this.entity.setDynamicProperty("edenring:speed", this.entity.getVelocity());
    }

    
}