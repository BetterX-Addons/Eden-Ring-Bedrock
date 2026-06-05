// MADE BY NATE
export const FACES = ["up", "down", "north", "south", "east", "west"];

export const supportFaceConfig = { byId: {}, byGroup: {} };

const matchStates = (perm, match) =>
  Object.entries(match).every(([key, value]) => String(perm.getState(key)) === String(value));

export const getSolidFaces = (block) => {
  if (!block || block.isAir || block.isLiquid) return [];

  const perm = block.permutation ?? { getState: () => undefined };

  let faces = new Set(FACES);

  const config = supportFaceConfig.byId[block.typeId];
  if (config) {
    if (config.faces) {
      faces = new Set(config.faces);
      if (config.states) {
        for (const state of config.states)
          if (matchStates(perm, state.match || {}))
            (state.faces || []).forEach((face) => faces.add(face));
      }
    } else if (config.states) {
      faces = new Set();
      for (const state of config.states)
        if (matchStates(perm, state.match || {}))
          (state.faces || []).forEach((face) => faces.add(face));
    }
  }

  for (const [, tagEntry] of Object.entries(supportFaceConfig.byGroup || {})) {
    if (tagEntry.typeIds && tagEntry.typeIds.includes(block.typeId)) {
      if (tagEntry.faces) {
        faces = new Set(tagEntry.faces);
      } else if (tagEntry.states) {
        if (faces.size === FACES.length) faces = new Set();
        for (const state of tagEntry.states)
          if (matchStates(perm, state.match || {}))
            (state.faces || []).forEach((face) => faces.add(face));
      }
    }
  }

  return [...faces];
};

export const canSupport = (block, face) => {
  const faces = getSolidFaces(block);
  if (!face) return faces.length > 0;
  return faces.includes(face);
};

export const defineFacesForId = (id, definition) => (supportFaceConfig.byId[id] = definition);

export const registerSupportGroup = (group, typeIds, definition) => {
  supportFaceConfig.byGroup[group] = { typeIds, ...definition };
};

export const registerSupportType = (typeId, definition) => {
  supportFaceConfig.byId[typeId] = definition;
};

registerSupportGroup(
  "slab",
  [
    "minecraft:smooth_stone_slab",
    "minecraft:normal_stone_slab",
    "minecraft:cobblestone_slab",
    "minecraft:mossy_cobblestone_slab",
    "minecraft:oak_slab",
    "minecraft:spruce_slab",
    "minecraft:birch_slab",
    "minecraft:jungle_slab",
    "minecraft:acacia_slab",
    "minecraft:dark_oak_slab",
    "minecraft:mangrove_slab",
    "minecraft:cherry_slab",
    "minecraft:pale_oak_slab",
    "minecraft:bamboo_slab",
    "minecraft:bamboo_mosaic_slab",
    "minecraft:stone_brick_slab",
    "minecraft:mossy_stone_brick_slab",
    "minecraft:sandstone_slab",
    "minecraft:cut_sandstone_slab",
    "minecraft:smooth_sandstone_slab",
    "minecraft:red_sandstone_slab",
    "minecraft:cut_red_sandstone_slab",
    "minecraft:smooth_red_sandstone_slab",
    "minecraft:granite_slab",
    "minecraft:polished_granite_slab",
    "minecraft:diorite_slab",
    "minecraft:polished_diorite_slab",
    "minecraft:andesite_slab",
    "minecraft:polished_andesite_slab",
    "minecraft:brick_slab",
    "minecraft:nether_brick_slab",
    "minecraft:red_nether_brick_slab",
    "minecraft:end_stone_brick_slab",
    "minecraft:quartz_slab",
    "minecraft:smooth_quartz_slab",
    "minecraft:purpur_slab",
    "minecraft:prismarine_slab",
    "minecraft:prismarine_brick_slab",
    "minecraft:dark_prismarine_slab",
    "minecraft:crimson_slab",
    "minecraft:warped_slab",
    "minecraft:blackstone_slab",
    "minecraft:polished_blackstone_slab",
    "minecraft:polished_blackstone_brick_slab",
    "minecraft:cobbled_deepslate_slab",
    "minecraft:polished_deepslate_slab",
    "minecraft:deepslate_brick_slab",
    "minecraft:deepslate_tile_slab",
    "minecraft:tuff_slab",
    "minecraft:polished_tuff_slab",
    "minecraft:tuff_brick_slab",
    "minecraft:mud_brick_slab",
    "minecraft:cut_copper_slab",
    "minecraft:exposed_cut_copper_slab",
    "minecraft:weathered_cut_copper_slab",
    "minecraft:oxidized_cut_copper_slab",
    "minecraft:waxed_cut_copper_slab",
    "minecraft:waxed_exposed_cut_copper_slab",
    "minecraft:waxed_weathered_cut_copper_slab",
    "minecraft:waxed_oxidized_cut_copper_slab",
    "minecraft:resin_brick_slab",
  ],
  {
    states: [
      { match: { "minecraft:vertical_half": "bottom" }, faces: ["down"] },
      { match: { "minecraft:vertical_half": "top" }, faces: ["up"] },
    ],
  },
);

registerSupportGroup(
  "stair",
  [
    "minecraft:smooth_stone_stairs",
    "minecraft:normal_stone_stairs",
    "minecraft:cobblestone_stairs",
    "minecraft:mossy_cobblestone_stairs",
    "minecraft:oak_stairs",
    "minecraft:spruce_stairs",
    "minecraft:birch_stairs",
    "minecraft:jungle_stairs",
    "minecraft:acacia_stairs",
    "minecraft:dark_oak_stairs",
    "minecraft:mangrove_stairs",
    "minecraft:cherry_stairs",
    "minecraft:pale_oak_stairs",
    "minecraft:bamboo_stairs",
    "minecraft:bamboo_mosaic_stairs",
    "minecraft:stone_brick_stairs",
    "minecraft:mossy_stone_brick_stairs",
    "minecraft:sandstone_stairs",
    "minecraft:cut_sandstone_stairs",
    "minecraft:smooth_sandstone_stairs",
    "minecraft:red_sandstone_stairs",
    "minecraft:cut_red_sandstone_stairs",
    "minecraft:smooth_red_sandstone_stairs",
    "minecraft:granite_stairs",
    "minecraft:polished_granite_stairs",
    "minecraft:diorite_stairs",
    "minecraft:polished_diorite_stairs",
    "minecraft:andesite_stairs",
    "minecraft:polished_andesite_stairs",
    "minecraft:brick_stairs",
    "minecraft:nether_brick_stairs",
    "minecraft:red_nether_brick_stairs",
    "minecraft:end_stone_brick_stairs",
    "minecraft:quartz_stairs",
    "minecraft:smooth_quartz_stairs",
    "minecraft:purpur_stairs",
    "minecraft:prismarine_stairs",
    "minecraft:prismarine_brick_stairs",
    "minecraft:dark_prismarine_stairs",
    "minecraft:crimson_stairs",
    "minecraft:warped_stairs",
    "minecraft:blackstone_stairs",
    "minecraft:polished_blackstone_stairs",
    "minecraft:polished_blackstone_brick_stairs",
    "minecraft:cobbled_deepslate_stairs",
    "minecraft:polished_deepslate_stairs",
    "minecraft:deepslate_brick_stairs",
    "minecraft:deepslate_tile_stairs",
    "minecraft:tuff_stairs",
    "minecraft:polished_tuff_stairs",
    "minecraft:tuff_brick_stairs",
    "minecraft:mud_brick_stairs",
    "minecraft:cut_copper_stairs",
    "minecraft:exposed_cut_copper_stairs",
    "minecraft:weathered_cut_copper_stairs",
    "minecraft:oxidized_cut_copper_stairs",
    "minecraft:waxed_cut_copper_stairs",
    "minecraft:waxed_exposed_cut_copper_stairs",
    "minecraft:waxed_weathered_cut_copper_stairs",
    "minecraft:waxed_oxidized_cut_copper_stairs",
    "minecraft:resin_brick_stairs",
  ],
  {
    states: [
      { match: { weirdo_direction: "0" }, faces: ["east"] },
      { match: { weirdo_direction: "1" }, faces: ["west"] },
      { match: { weirdo_direction: "2" }, faces: ["south"] },
      { match: { weirdo_direction: "3" }, faces: ["north"] },
      { match: { upside_down_bit: "true" }, faces: ["up"] },
      { match: { upside_down_bit: "false" }, faces: ["down"] },
    ],
  },
);

registerSupportGroup(
  "trapdoor",
  [
    "minecraft:trapdoor",
    "minecraft:spruce_trapdoor",
    "minecraft:birch_trapdoor",
    "minecraft:jungle_trapdoor",
    "minecraft:acacia_trapdoor",
    "minecraft:dark_oak_trapdoor",
    "minecraft:mangrove_trapdoor",
    "minecraft:cherry_trapdoor",
    "minecraft:pale_oak_trapdoor",
    "minecraft:bamboo_trapdoor",
    "minecraft:iron_trapdoor",
    "minecraft:crimson_trapdoor",
    "minecraft:warped_trapdoor",
    "minecraft:copper_trapdoor",
    "minecraft:exposed_copper_trapdoor",
    "minecraft:weathered_copper_trapdoor",
    "minecraft:oxidized_copper_trapdoor",
    "minecraft:waxed_copper_trapdoor",
    "minecraft:waxed_exposed_copper_trapdoor",
    "minecraft:waxed_weathered_copper_trapdoor",
    "minecraft:waxed_oxidized_copper_trapdoor",
    "razz_sup:gold_trapdoor",
  ],
  {
    states: [
      { match: { open_bit: "false", upside_down_bit: "false" }, faces: ["down"] },
      { match: { open_bit: "false", upside_down_bit: "true" }, faces: ["up"] },
      { match: { open_bit: "true", direction: "0" }, faces: ["west"] },
      { match: { open_bit: "true", direction: "1" }, faces: ["east"] },
      { match: { open_bit: "true", direction: "2" }, faces: ["north"] },
      { match: { open_bit: "true", direction: "3" }, faces: ["south"] },
    ],
  },
);

registerSupportGroup(
  "shelf",
  [
    "minecraft:oak_shelf",
    "minecraft:spruce_shelf",
    "minecraft:birch_shelf",
    "minecraft:jungle_shelf",
    "minecraft:acacia_shelf",
    "minecraft:dark_oak_shelf",
    "minecraft:mangrove_shelf",
    "minecraft:cherry_shelf",
    "minecraft:pale_oak_shelf",
    "minecraft:bamboo_shelf",
    "minecraft:crimson_shelf",
    "minecraft:warped_shelf",
  ],
  {
    states: [
      { match: { "minecraft:cardinal_direction": "north" }, faces: ["south"] },
      { match: { "minecraft:cardinal_direction": "south" }, faces: ["north"] },
      { match: { "minecraft:cardinal_direction": "east" }, faces: ["west"] },
      { match: { "minecraft:cardinal_direction": "west" }, faces: ["east"] },
    ],
  },
);

registerSupportGroup("grindstone", ["minecraft:grindstone"], {
  states: [
    { match: { attachment: "standing" }, faces: ["up"] },
    { match: { attachment: "hanging" }, faces: ["down"] },
  ],
});

registerSupportGroup(
  "lightning_rod",
  [
    "minecraft:lightning_rod",
    "minecraft:exposed_lightning_rod",
    "minecraft:weathered_lightning_rod",
    "minecraft:oxidized_lightning_rod",
    "minecraft:waxed_lightning_rod",
    "minecraft:waxed_exposed_lightning_rod",
    "minecraft:waxed_weathered_lightning_rod",
    "minecraft:waxed_oxidized_lightning_rod",
  ],
  {
    states: [
      { match: { facing_direction: 0 }, faces: ["up", "down"] },
      { match: { facing_direction: 1 }, faces: ["up", "down"] },
    ],
  },
);

registerSupportGroup(
  "chain",
  [
    "minecraft:iron_chain",
    "minecraft:copper_chain",
    "minecraft:exposed_copper_chain",
    "minecraft:weathered_copper_chain",
    "minecraft:oxidized_copper_chain",
    "minecraft:waxed_copper_chain",
    "minecraft:waxed_exposed_copper_chain",
    "minecraft:waxed_weathered_copper_chain",
    "minecraft:waxed_oxidized_copper_chain",
  ],
  { states: [{ match: { pillar_axis: "y" }, faces: ["up", "down"] }] },
);

registerSupportGroup("all_but_up_support", ["minecraft:composter"], {
  faces: ["north", "east", "south", "west", "down"],
});

registerSupportGroup("up_face_support", [], { faces: ["up"] });

registerSupportGroup(
  "down_face_support",
  [
    "minecraft:enchanting_table",
    "minecraft:stonecutter_block",
    "minecraft:end_portal_frame",
    "minecraft:daylight_detector",
    "minecraft:sculk_sensor",
    "minecraft:calibrated_sculk_sensor",
    "minecraft:sculk_shrieker",
    "minecraft:lectern",
    "minecraft:brewing_stand",
    "minecraft:campfire",
    "minecraft:soul_campfire",
    "antiquity:necrotic_altar",
  ],
  {
    faces: ["down"],
  },
);

registerSupportGroup(
  "vertical_support",
  [
    "minecraft:oak_fence",
    "minecraft:spruce_fence",
    "minecraft:birch_fence",
    "minecraft:jungle_fence",
    "minecraft:acacia_fence",
    "minecraft:dark_oak_fence",
    "minecraft:mangrove_fence",
    "minecraft:cherry_fence",
    "minecraft:pale_oak_fence",
    "minecraft:bamboo_fence",
    "minecraft:crimson_fence",
    "minecraft:warped_fence",
    "minecraft:nether_brick_fence",
    "minecraft:anvil",
    "minecraft:chipped_anvil",
    "minecraft:damaged_anvil",
    "minecraft:iron_bars",
    "minecraft:copper_bars",
    "minecraft:exposed_copper_bars",
    "minecraft:weathered_copper_bars",
    "minecraft:oxidized_copper_bars",
    "minecraft:waxed_copper_bars",
    "minecraft:waxed_exposed_copper_bars",
    "minecraft:waxed_weathered_copper_bars",
    "minecraft:waxed_oxidized_copper_bars",
    "minecraft:cobblestone_wall",
    "minecraft:mossy_cobblestone_wall",
    "minecraft:granite_wall",
    "minecraft:diorite_wall",
    "minecraft:andesite_wall",
    "minecraft:sandstone_wall",
    "minecraft:red_sandstone_wall",
    "minecraft:stone_brick_wall",
    "minecraft:mossy_stone_brick_wall",
    "minecraft:brick_wall",
    "minecraft:nether_brick_wall",
    "minecraft:red_nether_brick_wall",
    "minecraft:end_stone_brick_wall",
    "minecraft:prismarine_wall",
    "minecraft:blackstone_wall",
    "minecraft:polished_blackstone_wall",
    "minecraft:polished_blackstone_brick_wall",
    "minecraft:cobbled_deepslate_wall",
    "minecraft:polished_deepslate_wall",
    "minecraft:deepslate_brick_wall",
    "minecraft:deepslate_tile_wall",
    "minecraft:tuff_wall",
    "minecraft:polished_tuff_wall",
    "minecraft:tuff_brick_wall",
    "minecraft:mud_brick_wall",
    "minecraft:resin_brick_wall",
    "minecraft:glass_pane",
    "minecraft:white_stained_glass_pane",
    "minecraft:light_gray_stained_glass_pane",
    "minecraft:gray_stained_glass_pane",
    "minecraft:black_stained_glass_pane",
    "minecraft:brown_stained_glass_pane",
    "minecraft:red_stained_glass_pane",
    "minecraft:orange_stained_glass_pane",
    "minecraft:yellow_stained_glass_pane",
    "minecraft:lime_stained_glass_pane",
    "minecraft:green_stained_glass_pane",
    "minecraft:cyan_stained_glass_pane",
    "minecraft:light_blue_stained_glass_pane",
    "minecraft:blue_stained_glass_pane",
    "minecraft:purple_stained_glass_pane",
    "minecraft:magenta_stained_glass_pane",
    "minecraft:pink_stained_glass_pane",
    "minecraft:scaffolding",
    "minecraft:decorated_pot",
    "minecraft:sniffer_egg",
    "minecraft:dirt_path",
  ],
  { faces: ["up", "down"] },
);

registerSupportGroup(
  "non_support",
  [
    //Plants
    "minecraft:allium",
    "minecraft:azure_bluet",
    "minecraft:blue_orchid",
    "minecraft:cornflower",
    "minecraft:dandelion",
    "minecraft:oxeye_daisy",
    "minecraft:orange_tulip",
    "minecraft:pink_tulip",
    "minecraft:red_tulip",
    "minecraft:white_tulip",
    "minecraft:poppy",
    "minecraft:peony",
    "minecraft:rose_bush",
    "minecraft:flower",
    "minecraft:flowering_azalea",
    "minecraft:closed_eyeblossom",
    "minecraft:open_eyeblossom",
    "minecraft:aroma_blossom",
    "minecraft:fern",
    "minecraft:large_fern",
    "minecraft:short_grass",
    "minecraft:tall_grass",
    "minecraft:bush",
    "minecraft:firefly_bush",
    "minecraft:short_dry_grass",
    "minecraft:tall_dry_grass",
    "minecraft:leaf_litter",
    "minecraft:spore_blossom",
    "minecraft:glow_lichen",
    "minecraft:large_fern",
    "minecraft:vine",
    "minecraft:weeping_vines",
    "minecraft:twisting_vines",
    "minecraft:acacia_sapling",
    "minecraft:birch_sapling",
    "minecraft:dark_oak_sapling",
    "minecraft:jungle_sapling",
    "minecraft:oak_sapling",
    "minecraft:pale_oak_sapling",
    "minecraft:spruce_sapling",
    "minecraft:cherry_sapling",
    "minecraft:mangrove_propagule",
    "minecraft:carrot",
    "minecraft:carrots",
    "minecraft:potato",
    "minecraft:potatoes",
    "minecraft:beetroot",
    "minecraft:beetroot_seeds",
    "minecraft:beetroots",
    "minecraft:wheat",
    "minecraft:melon_stem",
    "minecraft:pumpkin_stem",
    "minecraft:pitcher_crop",
    "minecraft:pitcher_plant",
    "minecraft:torchflower_crop",
    "minecraft:reeds",
    "minecraft:bamboo",
    "minecraft:kelp",
    "minecraft:seagrass",
    "minecraft:sea_pickle",
    "minecraft:sea_pickle",
    "minecraft:nether_wart",
    "minecraft:waterlily",
    //Fungi
    "minecraft:brown_mushroom",
    "minecraft:red_mushroom",
    "minecraft:crimson_fungus",
    "minecraft:warped_fungus",
    //Coral
    "minecraft:brain_coral",
    "minecraft:bubble_coral",
    "minecraft:fire_coral",
    "minecraft:horn_coral",
    "minecraft:tube_coral",
    "minecraft:brain_coral_fan",
    "minecraft:bubble_coral_fan",
    "minecraft:fire_coral_fan",
    "minecraft:horn_coral_fan",
    "minecraft:tube_coral_fan",
    "minecraft:brain_coral_wall_fan",
    "minecraft:bubble_coral_wall_fan",
    "minecraft:fire_coral_wall_fan",
    "minecraft:horn_coral_wall_fan",
    "minecraft:tube_coral_wall_fan",
    "minecraft:dead_brain_coral",
    "minecraft:dead_bubble_coral",
    "minecraft:dead_fire_coral",
    "minecraft:dead_horn_coral",
    "minecraft:dead_tube_coral",
    "minecraft:dead_brain_coral_fan",
    "minecraft:dead_bubble_coral_fan",
    "minecraft:dead_fire_coral_fan",
    "minecraft:dead_horn_coral_fan",
    "minecraft:dead_tube_coral_fan",
    "minecraft:dead_brain_coral_wall_fan",
    "minecraft:dead_bubble_coral_wall_fan",
    "minecraft:dead_fire_coral_wall_fan",
    "minecraft:dead_horn_coral_wall_fan",
    "minecraft:dead_tube_coral_wall_fan",
    //Doors
    "minecraft:wooden_door",
    "minecraft:spruce_door",
    "minecraft:birch_door",
    "minecraft:jungle_door",
    "minecraft:acacia_door",
    "minecraft:dark_oak_door",
    "minecraft:mangrove_door",
    "minecraft:cherry_door",
    "minecraft:pale_oak_door",
    "minecraft:bamboo_door",
    "minecraft:crimson_door",
    "minecraft:warped_door",
    //Fence Gates
    "minecraft:fence_gate",
    "minecraft:spruce_fence_gate",
    "minecraft:birch_fence_gate",
    "minecraft:jungle_fence_gate",
    "minecraft:acacia_fence_gate",
    "minecraft:dark_oak_fence_gate",
    "minecraft:mangrove_fence_gate",
    "minecraft:cherry_fence_gate",
    "minecraft:pale_oak_fence_gate",
    "minecraft:bamboo_fence_gate",
    "minecraft:crimson_fence_gate",
    "minecraft:warped_fence_gate",
    //Signs
    "minecraft:sign",
    "minecraft:hanging_sign",
    "minecraft:oak_sign",
    "minecraft:dark_oak_sign",
    "minecraft:spruce_sign",
    "minecraft:mangrove_sign",
    "minecraft:crimson_sign",
    "minecraft:warped_sign",
    "minecraft:cherry_sign",
    "minecraft:oak_wall_sign",
    "minecraft:dark_oak_wall_sign",
    "minecraft:spruce_wall_sign",
    "minecraft:mangrove_wall_sign",
    "minecraft:crimson_wall_sign",
    "minecraft:cherry_wall_sign",
    "minecraft:oak_wall_sign",
    "minecraft:dark_oak_wall_sign",
    "minecraft:spruce_wall_sign",
    "minecraft:mangrove_wall_sign",
    //Pressure Plates
    "minecraft:wooden_pressure_plate",
    "minecraft:spruce_pressure_plate",
    "minecraft:birch_pressure_plate",
    "minecraft:jungle_pressure_plate",
    "minecraft:acacia_pressure_plate",
    "minecraft:dark_oak_pressure_plate",
    "minecraft:mangrove_pressure_plate",
    "minecraft:cherry_pressure_plate",
    "minecraft:pale_oak_pressure_plate",
    "minecraft:bamboo_pressure_plate",
    "minecraft:crimson_pressure_plate",
    "minecraft:warped_pressure_plate",
    "minecraft:stone_pressure_plate",
    "minecraft:polished_blackstone_pressure_plate",
    //Buttons
    "minecraft:wooden_button",
    "minecraft:spruce_button",
    "minecraft:birch_button",
    "minecraft:jungle_button",
    "minecraft:acacia_button",
    "minecraft:dark_oak_button",
    "minecraft:mangrove_button",
    "minecraft:cherry_button",
    "minecraft:pale_oak_button",
    "minecraft:bamboo_button",
    "minecraft:crimson_button",
    "minecraft:warped_button",
    "minecraft:stone_button",
    "minecraft:polished_blackstone_button",
    //Lights
    "minecraft:torch",
    "minecraft:soul_torch",
    "minecraft:copper_torch",
    "minecraft:light_block_0",
    "minecraft:light_block_1",
    "minecraft:light_block_2",
    "minecraft:light_block_3",
    "minecraft:light_block_4",
    "minecraft:light_block_5",
    "minecraft:light_block_6",
    "minecraft:light_block_7",
    "minecraft:light_block_8",
    "minecraft:light_block_9",
    "minecraft:light_block_10",
    "minecraft:light_block_11",
    "minecraft:light_block_12",
    "minecraft:light_block_13",
    "minecraft:light_block_14",
    "minecraft:light_block_15",
    //Redstone Components
    "minecraft:redstone",
    "minecraft:redstone_torch",
    "minecraft:comparator",
    "minecraft:repeater",
    "minecraft:lever",
    "minecraft:tripwire_hook",
    "minecraft:rail",
    "minecraft:detector_rail",
    "minecraft:activator_rail",
    "minecraft:golden_rail",
    //Shulker Boxes
    "minecraft:undyed_shulker_box",
    "minecraft:white_shulker_box",
    "minecraft:light_gray_shulker_box",
    "minecraft:gray_shulker_box",
    "minecraft:black_shulker_box",
    "minecraft:brown_shulker_box",
    "minecraft:red_shulker_box",
    "minecraft:orange_shulker_box",
    "minecraft:yellow_shulker_box",
    "minecraft:lime_shulker_box",
    "minecraft:green_shulker_box",
    "minecraft:cyan_shulker_box",
    "minecraft:light_blue_shulker_box",
    "minecraft:blue_shulker_box",
    "minecraft:purple_shulker_box",
    "minecraft:magenta_shulker_box",
    "minecraft:pink_shulker_box",
    //Carpets
    "minecraft:white_carpet",
    "minecraft:light_gray_carpet",
    "minecraft:gray_carpet",
    "minecraft:black_carpet",
    "minecraft:brown_carpet",
    "minecraft:red_carpet",
    "minecraft:orange_carpet",
    "minecraft:yellow_carpet",
    "minecraft:lime_carpet",
    "minecraft:green_carpet",
    "minecraft:cyan_carpet",
    "minecraft:light_blue_carpet",
    "minecraft:blue_carpet",
    "minecraft:purple_carpet",
    "minecraft:magenta_carpet",
    "minecraft:pink_carpet",
    "minecraft:moss_carpet",
    "minecraft:pale_moss_carpet",
    //Candles
    "minecraft:candle",
    "minecraft:white_candle",
    "minecraft:light_gray_candle",
    "minecraft:gray_candle",
    "minecraft:black_candle",
    "minecraft:brown_candle",
    "minecraft:red_candle",
    "minecraft:orange_candle",
    "minecraft:yellow_candle",
    "minecraft:lime_candle",
    "minecraft:green_candle",
    "minecraft:cyan_candle",
    "minecraft:light_blue_candle",
    "minecraft:blue_candle",
    "minecraft:purple_candle",
    "minecraft:magenta_candle",
    "minecraft:pink_candle",
    //Misc
    "minecraft:bed",
    "minecraft:flower_pot",
    "minecraft:bell",
    "minecraft:lantern",
    "minecraft:soul_lantern",
    "minecraft:dried_ghast",
    "minecraft:portal",
    "minecraft:end_portal",
    "minecraft:end_gateway",
    "minecraft:end_rod",
    "minecraft:detector_rail",
    "minecraft:structure_void",
    "minecraft:air",
    "minecraft:snow",
    "minecraft:powder_snow",
    "minecraft:hanging_roots",
    "minecraft:sculk_vein",
    "minecraft:banner",
    "minecraft:slime",
    "minecraft:honey_block",
    "minecraft:web",
    "minecraft:small_amethyst_bud",
    "minecraft:medium_amethyst_bud",
    "minecraft:large_amethyst_bud",
    "minecraft:amethyst_cluster",
    "minecraft:pointed_dripstone",
    "minecraft:water",
    "minecraft:flowing_water",
    "minecraft:bubble_column",
    "minecraft:lava",
    "minecraft:flowing_lava",
    "minecraft:fire",
    //Custom
    "antiquity:blechgrowth",
    "antiquity:blechsprouts",
    "antiquity:blechsprouts_small",
    "antiquity:blechsprouts_large",
    "antiquity:blechfungus",
    "antiquity:blastscale_blossom",
    "antiquity:luminbloom",
    "antiquity:luminous_torch_blue",
    "antiquity:luminous_torch_pink",
    "antiquity:luminous_torch_yellow",
    "antiquity:luminous_lantern_blue",
    "antiquity:luminous_lantern_pink",
    "antiquity:luminous_lantern_yellow",
  ],
  { faces: [] },
);


// GLAMMED BLOCKS
registerSupportGroup(
  "nonSolidGlammedBlocks", 
  [
    "glammed:glowshroom",
    "glammed:tall_glowshroom",
    "glammed:bounceshroom",
    "glammed:bounceshroom_head",
    "glammed:glowroot",
    "glammed:glowspit_vine"
    //
    ,
    "glammed:villus_roots",
    "glammed:villus_vine",
    "glammed:pale_nun_orchid",
    "glammed:lifeblood_resin_clump"
  ], 
  { faces: [] } 
);

registerSupportType("glammed:liferoot_thin_log", {
  states: [
    { match: { "glammed:up": true }, faces: ["up"] },
    { match: { "glammed:down": true }, faces: ["down"] },
    { match: { "glammed:north": true }, faces: ["north"] },
    { match: { "glammed:south": true }, faces: ["south"] },
    { match: { "glammed:east": true }, faces: ["east"] },
    { match: { "glammed:west": true }, faces: ["west"] }
  ]
});

registerSupportType("glammed:stripped_liferoot_thin_log", {
  states: [
    { match: { "glammed:up": true }, faces: ["up"] },
    { match: { "glammed:down": true }, faces: ["down"] },
    { match: { "glammed:north": true }, faces: ["north"] },
    { match: { "glammed:south": true }, faces: ["south"] },
    { match: { "glammed:east": true }, faces: ["east"] },
    { match: { "glammed:west": true }, faces: ["west"] }
  ]
});

registerSupportGroup(
  "glammed:stair",
  [
    "glammed:slate_stairs",
    "glammed:polished_slate_stairs",
    "glammed:slate_bricks_stairs",
    "glammed:glowshroom_stairs",
    "glammed:liferoot_stairs",
    "glammed:azalea_stairs",
    "glammed:lifeblood_resin_bricks_stairs"
  ],
  {
    states: [
      { match: { "minecraft:cardinal_direction": "east" }, faces: ["east"] },
      { match: { "minecraft:cardinal_direction": "west" }, faces: ["west"] },
      { match: { "minecraft:cardinal_direction": "south" }, faces: ["south"] },
      { match: { "minecraft:cardinal_direction": "north" }, faces: ["north"] },
      { match: { "minecraft:vertical_half": "top" }, faces: ["up"] },
      { match: { "minecraft:vertical_half": "bottom" }, faces: ["down"] },
    ],
  },
);


registerSupportGroup(
  "glammed:slabs",
  [
    "glammed:slate_slab",
    "glammed:polished_slate_slab",
    "glammed:slate_bricks_slab",
    "glammed:glowshroom_slab",
    "glammed:liferoot_slab",
    "glammed:azalea_slab",
    "glammed:lifeblood_resin_bricks_slab"
  ],
  {
    states: [
      { match: { "minecraft:vertical_half": "top", "glammed:block_bit": "false" }, faces: ["up"] },
      { match: { "minecraft:vertical_half": "bottom", "glammed:block_bit": "false" }, faces: ["down"] },
      
      { 
        match: { "glammed:block_bit": "true" }, 
        faces: ["up", "down", "north", "south", "east", "west"]
      },
    ],
  },
);