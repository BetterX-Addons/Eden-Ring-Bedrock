import { system, world, BlockPermutation } from "@minecraft/server";
globalThis.nbState = {
    inside: new Map(),
    step: new Map(),
    nearby: new Map(),
    cooldown: new Map()
};
system.beforeEvents.startup.subscribe(init => {
    init.blockComponentRegistry.registerCustomComponent("nearbear:events", {});
});
const _breakCache = new Map();
export const NearbearEvents = {
    _behaviours: new Map(),
    _eventBehaviours: new Map(),
    _intervalId: null,
    _activeEvents: {},
    _entityRange: 8,
    _ignoredEntities: new Set(),
    _maxEntitiesPerTick: 20,
    _currentEntityIndex: 0,
    registerBehaviourByBlockId(blockId, callbacks) {
        if (!this._behaviours.has(blockId))
            this._behaviours.set(blockId, []);
        const list = this._behaviours.get(blockId);
        this._addUnique(list, callbacks);
    },
    registerBehaviourByEvent(eventName, callbacks) {
        if (!this._eventBehaviours.has(eventName))
            this._eventBehaviours.set(eventName, []);
        const list = this._eventBehaviours.get(eventName);
        this._addUnique(list, callbacks);
    },
    _addUnique(list, callbacks) {
        const isDuplicate = list.some(existing => {
            const cbIn = callbacks.onPassingIn?.toString();
            const exIn = existing.onPassingIn?.toString();
            return cbIn === exIn;
        });
        if (!isDuplicate)
            list.push(callbacks || {});
    },
    init(options = {}) {
        if (this._intervalId !== null)
            system.clearRun(this._intervalId);
        if (globalThis.__NB_INTERVAL) {
            system.clearRun(globalThis.__NB_INTERVAL);
            globalThis.__NB_INTERVAL = undefined;
        }
        const tickInterval = options.tickInterval ?? 4;
        this._entityRange = options.entityRange ?? 8;
        this._maxEntitiesPerTick = options.maxEntitiesPerTick ?? 20;
        this._currentEntityIndex = 0;
        this._ignoredEntities = new Set(options.ignoredEntities || []);
        let globalTick = 0;
        this._activeEvents = {
            onStep: true, onInside: true, onNearby: true, onInteract: true,
            onAdjacentBreak: true, onBreak: true, onPlace: true, onAdjacentPlace: true,
            ...(options.active_events || {})
        };
        const neighborOffsets = [
            { dx: 1, dy: 0, dz: 0, dir: "east" }, { dx: -1, dy: 0, dz: 0, dir: "west" },
            { dx: 0, dy: 0, dz: 1, dir: "south" }, { dx: 0, dy: 0, dz: -1, dir: "north" },
            { dx: 0, dy: 1, dz: 0, dir: "up" }, { dx: 0, dy: -1, dz: 0, dir: "down" }
        ];
        const processEntity = (ent, ctx) => {
            const dim = ctx.dim;
            const loc = ent.location;
            const entId = ent.id;
            const headPos = ent.getHeadLocation ? ent.getHeadLocation() : { x: loc.x, y: loc.y + 1.62, z: loc.z };
            if (this._activeEvents.onInside) {
                const blockLoc = { x: Math.floor(loc.x), y: Math.floor(loc.y + 0.1), z: Math.floor(loc.z) };
                const insideBlock = safeGetBlock(dim, blockLoc);
                let currPosKey = null;
                if (insideBlock) {
                    const bhList = getBehavioursFor(insideBlock);
                    if (bhList.length > 0) {
                        currPosKey = keyOf(dim, blockLoc);
                    }
                }
                const prevPosKey = globalThis.nbState.inside.get(entId) || null;
                if (currPosKey !== prevPosKey) {
                    if (prevPosKey) {
                        const prevLoc = parseLoc(prevPosKey);
                        const prevDim = world.getDimension(prevPosKey.split("|")[0]);
                        const prevBlock = safeGetBlock(prevDim, prevLoc);
                        if (prevBlock) {
                            const bhList = getBehavioursFor(prevBlock);
                            if (bhList.length > 0) {
                                runBehaviours(bhList, "onPassingOut", { ...ctx, block: prevBlock, type: "body" });
                            }
                        }
                    }
                    if (currPosKey && insideBlock) {
                        const bhList = getBehavioursFor(insideBlock);
                        runBehaviours(bhList, "onPassingIn", { ...ctx, block: insideBlock, type: "body" });
                    }
                    if (currPosKey)
                        globalThis.nbState.inside.set(entId, currPosKey);
                    else
                        globalThis.nbState.inside.delete(entId);
                }
                else if (currPosKey && insideBlock) {
                    const bhList = getBehavioursFor(insideBlock);
                    for (const [bh, params] of bhList) {
                        const wait = bh.waitTicksInside ?? bh.waitTicks ?? 0;
                        if (wait > 0) {
                            let cdMap = globalThis.nbState.cooldown.get(entId) || new Map();
                            if (!globalThis.nbState.cooldown.has(entId))
                                globalThis.nbState.cooldown.set(entId, cdMap);
                            const last = cdMap.get(currPosKey) ?? 0;
                            if (globalTick - last < wait)
                                continue;
                            cdMap.set(currPosKey, globalTick);
                        }
                        bh?.onPassingInsideTick?.({ ...ctx, block: insideBlock, type: "body" }, params);
                    }
                }
            }
            if (this._activeEvents.onStep) {
                const standingBlocks = ent.isOnGround ? (ent.getAllBlocksStandingOn ? ent.getAllBlocksStandingOn() : []) : [];
                const currentStepKeys = new Map();
                for (const block of standingBlocks) {
                    if (!block)
                        continue;
                    currentStepKeys.set(keyOf(dim, block.location), block);
                }
                const prevSteps = globalThis.nbState.step.get(entId) || new Map();
                for (const [oldKey, oldData] of prevSteps) {
                    if (!currentStepKeys.has(oldKey)) {
                        const prevDim = world.getDimension(oldKey.split("|")[0]);
                        const prevBlock = safeGetBlock(prevDim, parseLoc(oldKey));
                        if (prevBlock) {
                            const bhList = getBehavioursFor(prevBlock);
                            runBehaviours(bhList, "onLeaveStep", { ...ctx, block: prevBlock });
                        }
                        prevSteps.delete(oldKey);
                    }
                }
                for (const [currKey, block] of currentStepKeys) {
                    if (!prevSteps.has(currKey)) {
                        const bhList = getBehavioursFor(block);
                        if (bhList.length > 0)
                            runBehaviours(bhList, "onStep", { ...ctx, block });
                        prevSteps.set(currKey, { typeId: block.typeId });
                    }
                }
                if (prevSteps.size > 0)
                    globalThis.nbState.step.set(entId, prevSteps);
                else
                    globalThis.nbState.step.delete(entId);
            }
            if (this._activeEvents.onNearby) {
                const nearbyNow = new Map();
                const prevNearby = globalThis.nbState.nearby.get(entId) || new Map();
                const scanPoints = [{ pos: loc, type: "body" }, { pos: headPos, type: "head" }];
                for (const { pos, type } of scanPoints) {
                    for (const off of neighborOffsets) {
                        const blockLoc = { x: Math.floor(pos.x) + off.dx, y: Math.floor(pos.y) + off.dy, z: Math.floor(pos.z) + off.dz };
                        const b = safeGetBlock(dim, blockLoc);
                        if (!b)
                            continue;
                        const bhList = getBehavioursFor(b);
                        if (bhList.length === 0)
                            continue;
                        const blockCenter = centerOf(b.location);
                        const distVal = dist(pos, blockCenter);
                        const validBhList = bhList.filter(([bh]) => {
                            const maxDist = bh.nearbyDistance ?? 1.5;
                            return distVal <= maxDist;
                        });
                        if (validBhList.length === 0)
                            continue;
                        const key = `${dim.id}|${blockLoc.x},${blockLoc.y},${blockLoc.z}|${off.dir}|${type}`;
                        const prevData = prevNearby.get(key);
                        const prevActiveSet = prevData?.activeSet || new Set();
                        const currentActiveSet = new Set();
                        const behaviorsToRunStart = [];
                        const behaviorsToRunTick = [];
                        for (const entry of validBhList) {
                            const [bh, params] = entry;
                            currentActiveSet.add(bh);
                            if (!prevActiveSet.has(bh)) {
                                behaviorsToRunStart.push(entry);
                            }
                            else {
                                behaviorsToRunTick.push(entry);
                            }
                        }
                        nearbyNow.set(key, {
                            blockPos: blockLoc,
                            direction: off.dir,
                            type,
                            activeSet: currentActiveSet
                        });
                        if (behaviorsToRunStart.length > 0) {
                            runBehaviours(behaviorsToRunStart, "onNearby", { ...ctx, block: b, direction: off.dir, distance: distVal, type });
                        }
                        for (const [bh, params] of behaviorsToRunTick) {
                            const wait = bh.waitTicksNearby ?? bh.waitTicks ?? 0;
                            if (wait > 0) {
                                let map = globalThis.nbState.cooldown.get(entId) || new Map();
                                if (!globalThis.nbState.cooldown.has(entId))
                                    globalThis.nbState.cooldown.set(entId, map);
                                const cdKey = key;
                                const last = map.get(cdKey) ?? 0;
                                if (globalTick - last < wait)
                                    continue;
                                map.set(cdKey, globalTick);
                            }
                            bh?.onNearbyTick?.({ ...ctx, block: b, direction: off.dir, distance: distVal, type }, params);
                        }
                    }
                }
                for (const [key, info] of prevNearby) {
                    if (!nearbyNow.has(key)) {
                        const prevDim = world.getDimension(key.split("|")[0]);
                        const prevBlock = safeGetBlock(prevDim, info.blockPos);
                        if (prevBlock) {
                            const bhListPrev = getBehavioursFor(prevBlock);
                            runBehaviours(bhListPrev, "onLeavingNextTo", { ...ctx, block: prevBlock, direction: info.direction, type: info.type });
                        }
                    }
                }
                globalThis.nbState.nearby.set(entId, nearbyNow);
            }
        };
        globalThis.__NB_INTERVAL = system.runInterval(() => {
            globalTick++;
            const processedIds = new Set();
            const validEntitiesInRange = new Set();
            const players = world.getAllPlayers();
            for (const player of players) {
                if (this._ignoredEntities.has(player.typeId))
                    continue;
                validEntitiesInRange.add(player.id);
                processEntity(player, { player, dim: player.dimension, isPlayer: true });
                processedIds.add(player.id);
            }
            let remainingBudget = this._maxEntitiesPerTick - processedIds.size;
            const candidates = [];
            const candidateIds = new Set();
            for (const player of players) {
                const dim = player.dimension;
                const nearby = dim.getEntities({ location: player.location, maxDistance: this._entityRange });
                for (const ent of nearby) {
                    if (ent.typeId === "minecraft:player")
                        continue;
                    if (this._ignoredEntities.has(ent.typeId))
                        continue;
                    validEntitiesInRange.add(ent.id);
                    if (processedIds.has(ent.id))
                        continue;
                    if (candidateIds.has(ent.id))
                        continue;
                    candidates.push({ entity: ent, player: player });
                    candidateIds.add(ent.id);
                }
            }
            if (remainingBudget > 0 && candidates.length > 0) {
                const total = candidates.length;
                let processedCount = 0;
                let index = this._currentEntityIndex % total;
                while (processedCount < remainingBudget && processedCount < total) {
                    const data = candidates[index];
                    processEntity(data.entity, {
                        entity: data.entity,
                        dim: data.entity.dimension,
                        isPlayer: false,
                        nearPlayer: data.player
                    });
                    processedIds.add(data.entity.id);
                    index = (index + 1) % total;
                    processedCount++;
                }
                this._currentEntityIndex = index;
            }
            cleanupStates(validEntitiesInRange);
        }, tickInterval);
        registerEventSubscriptions(this._activeEvents);
    },
};
function safeGetBlock(dim, loc) { try {
    return dim.getBlock(loc);
}
catch {
    return null;
} }
function centerOf(loc) { return { x: loc.x + 0.5, y: loc.y + 0.5, z: loc.z + 0.5 }; }
function keyOf(dim, loc) { return `${dim.id}|${loc.x},${loc.y},${loc.z}`; }
function parseLoc(key) { const parts = key.split("|")[1].split(","); return { x: +parts[0], y: +parts[1], z: +parts[2] }; }
function dist(a, b) { const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z; return Math.sqrt(dx * dx + dy * dy + dz * dz); }
function cleanupStates(validEntities) {
    const getEntitySafe = (id) => { try {
        return world.getEntity(id);
    }
    catch {
        return null;
    } };
    for (const [entId, prevKey] of globalThis.nbState.inside) {
        if (!validEntities.has(entId)) {
            globalThis.nbState.inside.delete(entId);
            if (prevKey) {
                try {
                    const dimId = prevKey.split("|")[0];
                    const loc = parseLoc(prevKey);
                    const dim = world.getDimension(dimId);
                    let block = safeGetBlock(dim, loc);
                    let bhList = getBehavioursFor(block);
                    if (!block || bhList.length === 0) {
                        block = { typeId: "nearbear:unknown", location: loc, getTags: () => [] };
                    }
                    if (bhList.length > 0) {
                        const entity = getEntitySafe(entId);
                        runBehaviours(bhList, "onPassingOut", {
                            entity: entity,
                            block: block,
                            type: "body"
                        });
                    }
                }
                catch (err) { }
            }
        }
    }
    for (const [entId, prevSteps] of globalThis.nbState.step) {
        if (!validEntities.has(entId)) {
            globalThis.nbState.step.delete(entId);
            const entity = getEntitySafe(entId);
            for (const [oldKey, oldData] of prevSteps) {
                try {
                    const prevDim = world.getDimension(oldKey.split("|")[0]);
                    const prevLoc = parseLoc(oldKey);
                    const prevBlock = safeGetBlock(prevDim, prevLoc);
                    if (prevBlock) {
                        const bhList = getBehavioursFor(prevBlock);
                        if (bhList.length > 0) {
                            runBehaviours(bhList, "onLeaveStep", { entity: entity, block: prevBlock });
                        }
                    }
                }
                catch (err) { }
            }
        }
    }
    for (const [entId, prevNearby] of globalThis.nbState.nearby) {
        if (!validEntities.has(entId)) {
            globalThis.nbState.nearby.delete(entId);
            const entity = getEntitySafe(entId);
            for (const [key, info] of prevNearby) {
                try {
                    const prevDim = world.getDimension(key.split("|")[0]);
                    const prevBlock = safeGetBlock(prevDim, info.blockPos);
                    if (prevBlock) {
                        const bhListPrev = getBehavioursFor(prevBlock);
                        if (bhListPrev.length > 0) {
                            runBehaviours(bhListPrev, "onLeavingNextTo", {
                                entity: entity,
                                block: prevBlock,
                                direction: info.direction,
                                type: info.type
                            });
                        }
                    }
                }
                catch (err) { }
            }
        }
    }
}
function getCustomComponentParams(block) {
    if (!block)
        return {};
    try {
        const comp = block.getComponent("nearbear:events");
        if (comp && comp.customComponentParameters) {
            return comp.customComponentParameters.params;
        }
    }
    catch (e) { }
    return {};
}
function getBehavioursFor(block) {
    if (!block)
        return [];
    const results = [];
    const compParams = getCustomComponentParams(block);
    const bhList = NearbearEvents._behaviours.get(block.typeId);
    if (bhList)
        bhList.forEach(bh => results.push([bh, compParams[block.typeId] || {}]));
    for (const [eventName, bhListEvent] of NearbearEvents._eventBehaviours) {
        if (compParams[eventName] !== undefined) {
            bhListEvent.forEach(eventBh => results.push([eventBh, compParams[eventName]]));
        }
    }
    return results;
}
function getCachedBehaviours(cached, permutation) {
    const results = [];
    if (cached) {
        const bhListId = NearbearEvents._behaviours.get(cached.typeId);
        if (bhListId)
            bhListId.forEach(bh => results.push([bh, cached.params[cached.typeId] || {}]));
        for (const [eventName, bhListEvent] of NearbearEvents._eventBehaviours) {
            if (cached.params[eventName] !== undefined) {
                bhListEvent.forEach(eventBh => results.push([eventBh, cached.params[eventName]]));
            }
        }
    }
    else if (permutation) {
        const typeId = permutation.type?.id || permutation.typeId;
        const bhListId = NearbearEvents._behaviours.get(typeId);
        if (bhListId)
            bhListId.forEach(bh => results.push([bh, {}]));
    }
    return results;
}
function runBehaviours(bhs, cbName, e) { for (const [bh, params] of bhs) {
    bh?.[cbName]?.(e, params);
} }
function behaviourFilterPasses(bh, itemOrStack, context = {}) {
    const { item_id, item_tag, allow_hand, handOnly, item_any, customFilter } = bh || {};
    if (handOnly) {
        if (itemOrStack)
            return false;
        return true;
    }
    if (item_any)
        return true;
    const hasFilters = item_id || item_tag || customFilter;
    if (!hasFilters)
        return true;
    if (!itemOrStack)
        return allow_hand ?? false;
    const ids = Array.isArray(item_id) ? item_id : item_id ? [item_id] : [];
    const tags = Array.isArray(item_tag) ? item_tag : item_tag ? [item_tag] : [];
    let typeId = null;
    if (typeof itemOrStack === "string")
        typeId = itemOrStack;
    else if (itemOrStack && typeof itemOrStack === "object") {
        if (typeof itemOrStack.typeId === "string")
            typeId = itemOrStack.typeId;
        else if (typeof itemOrStack.id === "string")
            typeId = itemOrStack.id;
        else if (itemOrStack.permutation && typeof itemOrStack.permutation.getType === "function") {
            try {
                const perm = itemOrStack.permutation;
                if (perm && perm.type)
                    typeId = perm.type;
            }
            catch (e) { }
        }
    }
    if (ids.length > 0) {
        if (!typeId)
            return false;
        if (!ids.includes(typeId))
            return false;
    }
    if (tags.length > 0) {
        const hasTagFn = itemOrStack && typeof itemOrStack.hasTag === "function" ? itemOrStack.hasTag.bind(itemOrStack) : null;
        if (!hasTagFn)
            return false;
        for (const tag of tags) {
            try {
                if (!hasTagFn(tag))
                    return false;
            }
            catch (e) {
                return false;
            }
        }
    }
    if (typeof customFilter === "function") {
        try {
            if (!customFilter(itemOrStack, context.block, context.face, context.player))
                return false;
        }
        catch (e) {
            return false;
        }
    }
    return true;
}
function registerEventSubscriptions(activeEvents) {
    if (activeEvents.onInteract) {
        world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
            const { block, blockFace, player, isFirstEvent, itemStack } = event;
            if (!isFirstEvent || !block || !player)
                return;
            let isBlockItem = false;
            if (itemStack) {
                try {
                    if (BlockPermutation.resolve(itemStack.typeId))
                        isBlockItem = true;
                }
                catch { }
                if (itemStack.hasTag?.("nearbear:is_block"))
                    isBlockItem = true;
            }
            const bhList = getBehavioursFor(block).filter(([bh]) => typeof bh.onInteract === "function");
            if (bhList.length === 0)
                return;
            let shouldCancel = false;
            for (const [bh, params] of bhList) {
                if (!behaviourFilterPasses(bh, itemStack, { block, face: blockFace, player }))
                    continue;
                if (isBlockItem && !player.isSneaking)
                    shouldCancel = true;
                system.run(() => {
                    try {
                        bh.onInteract({ player, block, face: blockFace, itemStack }, params);
                    }
                    catch (err) {
                        console.warn(`[NearbearEvents] Error onInteract:`, err);
                    }
                });
            }
            if (shouldCancel)
                event.cancel = true;
        });
    }
    if (activeEvents.onBreak) {
        world.beforeEvents.playerBreakBlock.subscribe(ev => {
            const { block, dimension } = ev;
            const key = keyOf(dimension, block.location);
            const compParams = getCustomComponentParams(block);
            if (Object.keys(compParams).length > 0 || NearbearEvents._behaviours.has(block.typeId)) {
                _breakCache.set(key, { typeId: block.typeId, params: compParams });
            }
        });
        world.beforeEvents.explosion.subscribe(ev => {
            const { dimension } = ev;
            const blocks = ev.getImpactedBlocks();
            for (const bLoc of blocks) {
                const block = safeGetBlock(dimension, bLoc);
                if (block) {
                    const key = keyOf(dimension, bLoc);
                    const compParams = getCustomComponentParams(block);
                    if (Object.keys(compParams).length > 0 || NearbearEvents._behaviours.has(block.typeId)) {
                        _breakCache.set(key, { typeId: block.typeId, params: compParams });
                    }
                }
            }
        });
        world.afterEvents.playerBreakBlock.subscribe(ev => {
            const { block, brokenBlockPermutation, player, dimension } = ev;
            if (!block)
                return;
            const key = keyOf(dimension, block.location);
            const cached = _breakCache.get(key);
            _breakCache.delete(key);
            const bhList = getCachedBehaviours(cached, brokenBlockPermutation);
            if (bhList.length === 0)
                return;
            runBehaviours(bhList, "onBreak", { block, dimension, brokenBlockPermutation, player: player ?? null, source: null });
        });
        world.afterEvents.blockExplode.subscribe(ev => {
            const { block, explodedBlockPermutation, dimension, source } = ev;
            if (!block)
                return;
            const key = keyOf(dimension, block.location);
            const cached = _breakCache.get(key);
            _breakCache.delete(key);
            const bhList = getCachedBehaviours(cached, explodedBlockPermutation);
            if (bhList.length === 0)
                return;
            runBehaviours(bhList, "onBreak", { block, dimension, brokenBlockPermutation: explodedBlockPermutation, player: null, source });
        });
    }
    if (activeEvents.onAdjacentBreak) {
        world.afterEvents.playerBreakBlock.subscribe(ev => {
            const { block, player, dimension, brokenBlockPermutation } = ev;
            if (!block)
                return;
            const neighborOffsets = [{ dx: 1, dy: 0, dz: 0, dir: "east" }, { dx: -1, dy: 0, dz: 0, dir: "west" }, { dx: 0, dy: 0, dz: 1, dir: "south" }, { dx: 0, dy: 0, dz: -1, dir: "north" }, { dx: 0, dy: 1, dz: 0, dir: "up" }, { dx: 0, dy: -1, dz: 0, dir: "down" }];
            for (const off of neighborOffsets) {
                const neighbor = safeGetBlock(dimension, { x: block.location.x + off.dx, y: block.location.y + off.dy, z: block.location.z + off.dz });
                if (!neighbor)
                    continue;
                const bhList = getBehavioursFor(neighbor);
                if (bhList.length > 0)
                    runBehaviours(bhList, "onAdjacentBreak", { player, brokenBlock: block, brokenBlockPermutation: brokenBlockPermutation, block: neighbor, direction: off.dir, dimension });
            }
        });
    }
    if (activeEvents.onPlace) {
        world.afterEvents.playerPlaceBlock.subscribe(ev => {
            const { block, player, dimension } = ev;
            if (!block)
                return;
            const bhList = getBehavioursFor(block);
            if (bhList.length > 0)
                runBehaviours(bhList, "onPlace", { player, block, dimension });
        });
    }
    if (activeEvents.onAdjacentPlace) {
        world.afterEvents.playerPlaceBlock.subscribe(ev => {
            const { block, player, dimension } = ev;
            if (!block)
                return;
            const neighborOffsets = [{ dx: 1, dy: 0, dz: 0, dir: "east" }, { dx: -1, dy: 0, dz: 0, dir: "west" }, { dx: 0, dy: 0, dz: 1, dir: "south" }, { dx: 0, dy: 0, dz: -1, dir: "north" }, { dx: 0, dy: 1, dz: 0, dir: "up" }, { dx: 0, dy: -1, dz: 0, dir: "down" }];
            for (const off of neighborOffsets) {
                const neighbor = safeGetBlock(dimension, { x: block.location.x + off.dx, y: block.location.y + off.dy, z: block.location.z + off.dz });
                if (!neighbor)
                    continue;
                const bhList = getBehavioursFor(neighbor);
                if (bhList.length > 0)
                    runBehaviours(bhList, "onAdjacentPlace", { player, placedBlock: block, block: neighbor, direction: off.dir, dimension });
            }
        });
    }
}
let movementCheckInterval = null;
let hasActivated = false;
world.afterEvents.worldLoad.subscribe(() => {
    if (hasActivated)
        return;
    movementCheckInterval = system.runInterval(() => {
        const players = world.getAllPlayers();
        for (const player of players) {
            if (player.initialX === undefined) {
                player.initialX = player.location.x;
                player.initialZ = player.location.z;
                continue;
            }
            if (player.location.x !== player.initialX || player.location.z !== player.initialZ) {
                hasActivated = true;
                NearbearEvents.init({
                    tickInterval: 1,
                    entityRange: 45,
                    maxEntitiesPerTick: 20,
                    ignoredEntities: [
                        "edenring:glowshroom_entity",
                        "edenring:fog_entity"
                    ]
                });
                if (movementCheckInterval !== null) {
                    system.clearRun(movementCheckInterval);
                    movementCheckInterval = null;
                }
                break;
            }
        }
    }, 1);
});
export function ReduceDurability(player, item, amount, slot = "Mainhand") {
    if (!player || !item)
        return false;
    const durability = item.getComponent("minecraft:durability");
    if (!durability)
        return false;
    const currentDamage = durability.damage ?? 0;
    const newDamage = currentDamage + amount;
    const equip = player.getComponent("minecraft:equippable");
    if (newDamage >= durability.maxDurability) {
        equip.setEquipment(slot);
        player.playSound("random.break", player.location);
        return true;
    }
    else {
        durability.damage = newDamage;
        equip.setEquipment(slot, item);
        return false;
    }
}
