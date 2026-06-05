import { world, system, BlockPermutation, ItemStack } from '@minecraft/server';
import { NearbearEvents } from "woodset/NearbearEvents";

const betterend_side_bit = [
    "normal",
    "behind_left",
    "behind_right",
    "front_left",
    "front_right"
]

const oppositeDirection = {
    "north": "south",
    "east": "west",
    "south": "north",
    "west": "east"
}

system.beforeEvents.startup.subscribe(init => {
    init.blockComponentRegistry.registerCustomComponent("betterend:stairs_settings", {
        beforeOnPlayerPlace(e) {
            const { permutationToPlace, block, dimension } = e;

            const adjacentBlocks = {
                north: block.north(),
                east: block.east(),
                south: block.south(),
                west: block.west()
            };

            const thisStairDirection = permutationToPlace.getState("minecraft:cardinal_direction");


            for (const direction in adjacentBlocks) {
                const adjacentBlock = adjacentBlocks[direction];
                if (adjacentBlock && adjacentBlock.hasTag("custom:stairs")) {
                    const dir = direction;
                    const stairDirection = adjacentBlock.permutation.getState("minecraft:cardinal_direction");

                    const result = getStairConnection(oppositeDirection[dir], thisStairDirection, stairDirection);
                    if (result) {
                        e.permutationToPlace = permutationToPlace.withState('betterend:side_bit', result);
                    }
                }
            }
        }
    });
});


NearbearEvents.registerBehaviourByEvent("betterend:stairs", {
    onAdjacentPlace(e, p) {
        const { block, placedBlock, direction } = e;

        const thisStairDirection = placedBlock.permutation.getState("minecraft:cardinal_direction");

        const stairDirection = block.permutation.getState("minecraft:cardinal_direction");
        const result = getStairConnection(direction, stairDirection, thisStairDirection);
        if (result) {

            block.setPermutation(block.permutation.withState('betterend:side_bit', result))
        }

    },
    onAdjacentBreak(e) {
        const { block, brokenBlock, brokenBlockPermutation, direction } = e;

        const thisStairDirection = brokenBlockPermutation.getState("minecraft:cardinal_direction");

        const stairDirection = block.permutation.getState("minecraft:cardinal_direction");
        const result = getStairConnection(direction, stairDirection, thisStairDirection);
        if (result) {

            block.setPermutation(block.permutation.withState('betterend:side_bit', "normal"))
        }
    }
});

world.afterEvents.playerBreakBlock.subscribe((e) => {

})

const stairMap = new Map([
    ['north', [
        { // stairDirection 
            baseStairDirection: 'east', // thisStairDirection 
            connection: { // dir 
                south: "behind_right",
                north: "front_right"
            }
        },
        { // stairDirection 
            baseStairDirection: 'west', // thisStairDirection 
            connection: { // dir 
                south: "behind_left",
                north: "front_left"
            }
        }
    ]],
    ['south', [
        { // stairDirection 
            baseStairDirection: 'west', // thisStairDirection 
            connection: { // dir 
                south: "front_right",
                north: "behind_right"
            }
        },
        { // stairDirection 
            baseStairDirection: 'east', // thisStairDirection 
            connection: { // dir 
                south: "front_left",
                north: "behind_left"
            }
        }
    ]],
    ['east', [
        { // stairDirection 
            baseStairDirection: 'north', // thisStairDirection 
            connection: { // dir 
                west: "behind_left",
                east: "front_left"
            }
        },
        { // stairDirection 
            baseStairDirection: 'south', // thisStairDirection 
            connection: { // dir 
                west: "behind_right",
                east: "front_right"
            }
        }
    ]],
    ['west', [
        { // stairDirection 
            baseStairDirection: 'south', // thisStairDirection 
            connection: { // dir 
                west: "front_left",
                east: "behind_left"
            }
        },
        { // stairDirection 
            baseStairDirection: 'north', // thisStairDirection 
            connection: { // dir 
                west: "front_right",
                east: "behind_right"
            }
        }
    ]]
]);



function getStairConnection(dir, stairDirection, thisStairDirection) {
    const stairList = stairMap.get(stairDirection);
    if (!stairList) return null;

    // Busca el objeto con el baseStairDirection correcto
    const match = stairList.find(s => s.baseStairDirection === thisStairDirection);
    if (!match) return null;

    // Devuelve el valor de la conexión
    return match.connection[dir] ?? null;
}