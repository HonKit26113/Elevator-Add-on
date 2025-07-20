import { world, system, BlockPermutation, BlockTypes } from '@minecraft/server';
import { ActionFormData, ModalFormData, ActionFormResponse } from "@minecraft/server-ui";
import { open_main_menu } from './elevator_main_menu';

world.afterEvents.itemUse.subscribe((data) => {
    var destination_level = 0;
	const player = data.source;
	const item = player.getComponent("minecraft:inventory").container.getItem(player.selectedSlotIndex);
    if (item.typeId === "minecraft:breeze_rod") {
        world.clearDynamicProperties();
        world.sendMessage("done");
    }
});

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('honkit26113:on_interact', {
        onPlayerInteract(e) {
            const { player, block } = e;
            if (world.getDynamicProperty("honkit26113:total_elevator_number") === undefined) {
                world.setDynamicProperty("honkit26113:total_elevator_number", 0)
            }
            open_main_menu(player, world.getDynamicProperty("honkit26113:total_elevator_number"), block);
        }
    })
});