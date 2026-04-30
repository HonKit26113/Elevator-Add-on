import { world, system, PlayerPermissionLevel, GameMode, ItemStack, Player, EquipmentSlot } from '@minecraft/server';
import { getElevatorName, getElevatorTexture, sendActionOutput, showList, getElevatorById } from './Elevator';

const NO_PERMS = "You don't have permission to do that!";

/**
 * determines if the player has permissions to use wrenches
 * @param {Player} player 
 * @returns {boolean}
 */
function isWrenchOperator(player: Player): boolean {
    let opOnly = world.getDynamicProperty("honkit26113:wrench_usage_op_only");
    if (opOnly === undefined) {
        opOnly = "false";
        world.setDynamicProperty("honkit26113:wrench_usage_op_only", opOnly);
    }
    // If elevator is set to OP only, check if the player is OP.
    if (JSON.parse(opOnly as string)) {
        return (player.playerPermissionLevel === PlayerPermissionLevel.Operator);
    }
    return true;
}

/** @type {import("@minecraft/server").ItemCustomComponent} */
const WrenchOpenMenuComponent: import("@minecraft/server").ItemCustomComponent = {
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
const WrenchUseComponent: import("@minecraft/server").ItemCustomComponent = {
    async onHitEntity({attackingEntity, hitEntity, itemStack}, {}) {
        if (!(attackingEntity instanceof Player) || hitEntity.typeId !== "honkit26113:elevator_block") return;
        if (!isWrenchOperator(attackingEntity as Player)) {
            sendActionOutput(attackingEntity as Player, NO_PERMS);
            return;
        }

        // If player is sneaking, remove the elevator block.
        if (attackingEntity.isSneaking) {
            hitEntity.triggerEvent("instant_despawn");
            // If player is not in creative, drop the elevator block as an item.
            if (attackingEntity.getGameMode() !== GameMode.Creative) {
                attackingEntity.dimension.spawnItem(new ItemStack("honkit26113:elevator_block", 1), attackingEntity.location);
            }
            return;
        }
        const elevatorId: number = itemStack.getDynamicProperty("honkit26113:wrench_bound_to") as number ?? -1;

        // If elevator doesn't exist anymore, unbind the wrench.
        try {
            getElevatorById(elevatorId);
        } catch (Error) {
            giveWrench(attackingEntity, 0);
            sendActionOutput(attackingEntity, "Elevator was deleted. Unbinding this Wrench.");
            return;
        }

        // Else, bind the wrench to the selected elevator.
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
 * @param {number} elevatorId 
 */
function giveWrench(player: Player, elevatorId: number) {
    const equipment = player.getComponent('equippable');
    let wrench: ItemStack;
    if (elevatorId === 0) {
        wrench = new ItemStack("honkit26113:elevator_wrench");
    } else {
        wrench = new ItemStack("honkit26113:elevator_wrench_focused");
        wrench.setDynamicProperty("honkit26113:wrench_bound_to", elevatorId);
    }
    equipment.setEquipment(EquipmentSlot.Mainhand, wrench);
}

system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("honkit26113:wrench_open_menu", WrenchOpenMenuComponent);
    itemComponentRegistry.registerCustomComponent("honkit26113:wrench_use", WrenchUseComponent);
});