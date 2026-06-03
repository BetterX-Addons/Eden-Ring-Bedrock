export default class EntityUtils {
    constructor(entity) {
        this.entity = entity;
        this.dimension = entity.dimension;
        this.location = entity.location;
    }
    saveVelocity() {
        this.entity.setDynamicProperty("edenring:speed", this.entity.getVelocity());
    }
}
