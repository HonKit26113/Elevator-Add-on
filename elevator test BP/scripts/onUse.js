import { world, system, PlayerPermissionLevel, GameMode, ItemStack } from '@minecraft/server';
//import { ActionFormData } from "@minecraft/server-ui";
import { sendActionOutput, showList } from './elevator_main_menu';

/*world.afterEvents.itemUse.subscribe((data) => {
    let destination_level = 0;
	const player = data.source;
	const item = player.getComponent("minecraft:inventory").container.getItem(player.selectedSlotIndex);
    if (item.typeId === "minecraft:breeze_rod") {
        world.clearDynamicProperties();
        world.sendMessage("done");
    }
});*/

/** @type {import("@minecraft/server").ItemCustomComponent} */
const WrenchOpenMenuComponent = {
    async onUseOn({ source }, {}) {
        const elevatorId = await showList(source, 3, null);
        switch (elevatorId) {
            case undefined:
                return;
            case 0:
                sendActionOutput(source, `Wrench unbound`);
                break;
            default:
                const elevator_name = JSON.parse(world.getDynamicProperty(`honkit26113:elevator_names`));
                sendActionOutput(source, `Wrench bound to ${elevator_name[elevatorId]}`);
                break; 
        }
        world.sendMessage(`eid: ${elevatorId}`)
        giveWrench(source, elevatorId);
    }
};

/** @type {import("@minecraft/server").ItemCustomComponent} */
const WrenchUseComponent = {
    onHitEntity({attackingEntity, hitEntity, itemStack}, {}) {
        if (attackingEntity.isSneaking) {
            hitEntity.triggerEvent("instant_despawn");
            if (attackingEntity.getGameMode() !== GameMode.Creative) {
                attackingEntity.dimension.spawnItem(new ItemStack("honkit26113:elevator_block", 1), attackingEntity.location);
            }
            return;
        }
        const elevatorId = itemStack.getDynamicProperty("honkit26113:wrench_bound_to");
        world.sendMessage(`${typeof(elevatorId)}`)
        hitEntity.setProperty("honkit26113:elevator_id", elevatorId);
        sendActionOutput(attackingEntity, `Elevator Block bound to ${elevatorId}`);
    }
}

/**
 * gives `player` a wrench bound to an elevator. `elevatorId` of `0` will give an unbound wrench.
 * @param {Player} player 
 * @param {Integer} elevatorId 
 */
function giveWrench(player, elevatorId) {
    const equipment = player.getComponent('equippable');
    let wrench;
    if (elevatorId === 0) {
        wrench = new ItemStack("honkit26113:elevator_wrench");
    } else {
        wrench = new ItemStack("honkit26113:elevator_wrench_focused");
        wrench.setDynamicProperty("honkit26113:wrench_bound_to", elevatorId);
    }
    equipment.setEquipment('Mainhand', wrench);
}

system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("honkit26113:wrench_open_menu", WrenchOpenMenuComponent);
    itemComponentRegistry.registerCustomComponent("honkit26113:wrench_use", WrenchUseComponent);
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