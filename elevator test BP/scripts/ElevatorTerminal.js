import { world, system, PlayerPermissionLevel } from '@minecraft/server';
import { ActionFormData } from "@minecraft/server-ui";
import { openInitMenu, openFloorsList } from './elevator_main_menu';

// clear dynamic properties debug stick
// note: this will clear ALL dynamic properties, not just dp's from the elevator add-on!
/*world.afterEvents.itemUse.subscribe((data) => {
    let destination_level = 0;
	const player = data.source;
	const item = player.getComponent("minecraft:inventory").container.getItem(player.selectedSlotIndex);
    if (item.typeId === "minecraft:breeze_rod") {
        world.clearDynamicProperties();
        world.sendMessage("done");
    }
});*/

export function noPermsErrorMenu(player) {
    const errorMenu = new ActionFormData()
        .title(`Oops!`)
        .body(`An Operator has restricted this action to Operators only. Contact an Operator for assistance.\n\nIf you are the World Owner, set your permission level to Operator for access.`)
        .button(`Ok`)
    return errorMenu.show(player).then(
        response => {
            return;
        }
    )
}

/** @type {import("@minecraft/server").BlockCustomComponent} */
const TerminalInteractComponent = {
    async onPlayerInteract({ block, player }, {}) {
        const is_focused = world.getDynamicProperty(`honkit26113:terminal${JSON.stringify(block.location)}`)
        if (is_focused) {
            world.sendMessage(`pew: ${world.getDynamicProperty(`honkit26113:terminal${JSON.stringify(block.location)}`)}`)
            openFloorsList(player, is_focused, block, 2);
        } else if (player.playerPermissionLevel === PlayerPermissionLevel.Operator || !JSON.parse(world.getDynamicProperty("honkit26113:elevator_settings_op_only"))) {
            openInitMenu(player, block);
        } else {
            await noPermsErrorMenu(player);
        }
    },
};

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("honkit26113:terminal_interact", TerminalInteractComponent);
});


// Custom Components v1
/*world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('honkit26113:on_interact', {
        onPlayerInteract(e) {
            const { player, block } = e;
            if (world.getDynamicProperty("honkit26113:total_elevator_number") === undefined) {
                world.setDynamicProperty("honkit26113:total_elevator_number", 0)
            }
            const is_focused = world.getDynamicProperty(`honkit26113:terminal${JSON.stringify(block.location)}`)
            if (is_focused) {
                world.sendMessage(`pew: ${world.getDynamicProperty(`honkit26113:terminal${JSON.stringify(block.location)}`)}`)
                open_submenu(player, is_focused, block, 2);
            } else {//if (player.playerPermissionLevel === "Operator") {
                openInitMenu(player, world.getDynamicProperty("honkit26113:total_elevator_number"), block);
            } /*else {
                const errorMenu = new ActionFormData()
                    .title(`Oops!`)
                    .body(`An Operator has restricted Elevator Terminal configuration to Operators only. Contact an Operator for assistance.\n\nIf you are the World Owner, set your permission level to Operator for access.`)
                    .button(`Ok`)
                errorMenu.show(player).then(
                    response => {
                        return;
                    }
                )
            }
        }
    })
});*/