import { system, world } from "@minecraft/server";

export const TaskScheduler = {
    _registry: new Map(),

    /**
     * Registra una función callback para ser ejecutada por el scheduler.
     */
    register(id, callback) {
        this._registry.set(id, callback);
    },

    /**
     * Programa una tarea persistente en una ubicación de bloque específica.
     */
    schedule(block, callbackId, delayTicks, data = null) {
        const { x, y, z } = block.location;
        const dimId = block.dimension.id;
        const targetTick = system.currentTick + delayTicks;
        const propKey = `task|${dimId}|${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;

        const payload = JSON.stringify({
            id: callbackId,
            t: targetTick,
            d: data
        });

        world.setDynamicProperty(propKey, payload);
    },

    /**
     * Inicia el ciclo de monitoreo de tareas persistentes.
     */
    init() {
        system.runInterval(() => {
            const currentTick = system.currentTick;
            const ids = world.getDynamicPropertyIds();

            for (const propKey of ids) {
                if (!propKey.startsWith("task|")) continue;

                let stored;
                const raw = world.getDynamicProperty(propKey);
                if (!raw) continue;

                try {
                    stored = JSON.parse(raw);
                } catch { 
                    world.setDynamicProperty(propKey, undefined);
                    continue; 
                }

                if (currentTick >= stored.t) {
                    const parts = propKey.split("|");
                    const dimId = parts[1];
                    const coords = parts[2].split(",").map(Number);
                    const loc = { x: coords[0], y: coords[1], z: coords[2] };
                    const dim = world.getDimension(dimId);

                    try {
                        const block = dim.getBlock(loc);

                        // Solo ejecutamos y eliminamos la tarea si el bloque está cargado
                        if (block) {
                            world.setDynamicProperty(propKey, undefined);

                            const callback = this._registry.get(stored.id);
                            if (callback) {
                                callback({
                                    block: block,
                                    dimension: dim,
                                    data: stored.d
                                });
                            }
                        }
                    } catch (e) {
                        // Si hay un error crítico (como dimensión inválida), limpiamos la propiedad
                        world.setDynamicProperty(propKey, undefined);
                    }
                }
            }
        }, 5); // Intervalo de 5 ticks para optimizar rendimiento
    },

    /**
     * Obtiene los datos de una tarea programada en un bloque.
     */
    getData(block) {
        try {
            const { x, y, z } = block.location;
            const dimId = block.dimension.id;
            const propKey = `task|${dimId}|${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;

            const json = world.getDynamicProperty(propKey);
            if (!json) return null;
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    },

    /**
     * Cancela una tarea programada en un bloque específico.
     */
    cancel(block) {
        const { x, y, z } = block.location;
        const dimId = block.dimension.id;
        const propKey = `task|${dimId}|${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
        world.setDynamicProperty(propKey, undefined);
    }
};

/* ============================================================
   LÓGICA DE ACTIVACIÓN POR MOVIMIENTO
   Asegura que las tareas se resuman solo cuando el mundo es estable.
============================================================ */
let movementCheckInterval = null;
let hasActivated = false;

world.afterEvents.worldLoad.subscribe(() => {
    if (hasActivated) return;

    movementCheckInterval = system.runInterval(() => {
        const players = world.getAllPlayers();
        
        for (const player of players) {
            // Inicializar posición de referencia si no existe
            if (player.initialX === undefined) {
                player.initialX = Math.floor(player.location.x);
                player.initialZ = Math.floor(player.location.z);
                continue;
            }

            // Detectar si el jugador se ha movido de su posición inicial
            if (Math.floor(player.location.x) !== player.initialX || 
                Math.floor(player.location.z) !== player.initialZ) {
                
                hasActivated = true;

                // Iniciamos el Scheduler para resumir las tareas persistentes
                TaskScheduler.init();

                if (movementCheckInterval !== null) {
                    system.clearRun(movementCheckInterval);
                    movementCheckInterval = null;
                }
                break; 
            }
        }
    }, 1);
});