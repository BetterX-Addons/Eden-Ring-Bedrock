import { system } from "@minecraft/server";

system.beforeEvents.startup.subscribe((startupEvent) => {
  try {
    startupEvent.dimensionRegistry.registerCustomDimension("edenring:edenring");
  } catch (e) {
. console.error("Error al registrar la dimensión:", e);
  }
});