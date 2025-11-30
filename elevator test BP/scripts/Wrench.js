import { world, system, PlayerPermissionLevel, GameMode, ItemStack } from '@minecraft/server';
import { getElevatorName, getElevatorTexture, sendActionOutput, showList } from './elevator_main_menu';

const NO_PERMS = "You don't have permission to do that!";

/**
 * determines if the player has permissions to use wrenches
 * @param {Player} player 
 * @returns {boolean}
 */
function isWrenchOperator(player) {
    let opOnly = world.getDynamicProperty("honkit26113:wrench_usage_op_only");
    if (opOnly === undefined) {
        opOnly = "false";
        world.setDynamicProperty("honkit26113:wrench_usage_op_only", opOnly);
    }
    if (JSON.parse(opOnly)) { // if op only, check if player is op
        return (player.playerPermissionLevel === PlayerPermissionLevel.Operator);
    }
    return true;
}

/** @type {import("@minecraft/server").ItemCustomComponent} */
const WrenchOpenMenuComponent = {
    async onUse({ source }, {}) {
        if (!isWrenchOperator(source)) {
            sendActionOutput(source, NO_PERMS);
            return;
        }
        const elevatorId = await showList(source, 3, null);
        switch (elevatorId) {
            case undefined:
                return;
            case 0:
                sendActionOutput(source, `Wrench unbound`);
                break;
            default:
                const elevator_name = getElevatorName(elevatorId);
                sendActionOutput(source, `Wrench bound to ${elevator_name}`);
                break; 
        }
        //world.sendMessage(`eid: ${elevatorId}`)
        giveWrench(source, elevatorId);
    }
};

/** @type {import("@minecraft/server").ItemCustomComponent} */
const WrenchUseComponent = {
    async onHitEntity({attackingEntity, hitEntity, itemStack}, {}) {
        if (attackingEntity.typeId !== "minecraft:player" || hitEntity.typeId !== "honkit26113:elevator_block") return;
        if (!isWrenchOperator(attackingEntity)) {
            sendActionOutput(attackingEntity, NO_PERMS);
            return;
        }
        if (attackingEntity.isSneaking) {
            hitEntity.triggerEvent("instant_despawn");
            if (attackingEntity.getGameMode() !== GameMode.Creative) {
                attackingEntity.dimension.spawnItem(new ItemStack("honkit26113:elevator_block", 1), attackingEntity.location);
            }
            return;
        }
        const elevatorId = itemStack.getDynamicProperty("honkit26113:wrench_bound_to");
        //world.sendMessage(`${typeof(elevatorId)}`)
        hitEntity.setProperty("honkit26113:elevator_id", elevatorId);
        hitEntity.setProperty("honkit26113:texture", getElevatorTexture(elevatorId));
        //world.sendMessage(`${elevatorTextures[getElevatorTexture(elevatorId)]}`);
        //world.sendMessage(`${hitEntity.getProperty("honkit26113:texture")}`);
        if (attackingEntity.playerPermissionLevel !== PlayerPermissionLevel.Operator) {
            world.sendMessage(`§o§i[${attackingEntity.name}: Bound Elevator Block to ${getElevatorName(elevatorId)}]§r`);
        }
        sendActionOutput(attackingEntity, `Elevator Block bound to ${getElevatorName(elevatorId)}`);
    }
}

/**
 * Gives `player` a wrench bound to an elevator. `elevatorId` of `0` will give an unbound wrench.
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