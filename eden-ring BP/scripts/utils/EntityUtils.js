export default class EntityUtils {
    constructor(entity) {
        this.entity = entity;
        this.dimension = entity.dimension;
        this.location = entity.location;
    }
    saveVelocity() {
        const velocity = this.entity.getVelocity();
        if (velocity.y < 0) {
            this.entity.setDynamicProperty("edenring:speedY", velocity.y);
        }
    }
}
