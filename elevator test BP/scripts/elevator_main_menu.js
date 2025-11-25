import { world, system, PlayerPermissionLevel } from '@minecraft/server';
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { noPermsErrorMenu } from './on_interact';


/** 
 * TODO:
 * - "Remember Elevator" DONE
 * - Admin privileges (only admins can edit & select floor) DONE
 * - Elevator tags DONE
 * - Elevator wrenches to set settings for each elevator entity (entity tags) DONE --> need admin priviledges for wrench usage DONE
 * - Customizable elevator speeds
 * - Send text message output (italics) [player: action] DONE --> need for wrench actions
 * - Delete elevator/floor function
 * */ 


let elevator_name = []
let elevator_floor_name = []
let elevator_floor_level = []

export function sendActionOutput(player, message) {
    player.onScreenDisplay.setActionBar(message);
}

export function openInitMenu(player, block) {
    const initMenu = new ActionFormData()
        .title(`Hello!`)
        .body(`To bind this Terminal to an Elevator, "Set up this Terminal", select an Elevator, and this Terminal will open the list of floors for that Elevator!`)
        .button(`Set up this Terminal`, "textures/ui/icon_book_writable")
        .button(`Add/Edit Elevators`, "textures/ui/editIcon")
        .button(`Permission Settings`, "textures/ui/permissions_op_crown")
    initMenu.show(player).then(
        (response) => {
            switch (response.selection) {
                case 0:
                case 1:
                    showList(player, response.selection, block);
                    break;
                case 2:
                    if (player.playerPermissionLevel === PlayerPermissionLevel.Operator) {
                        permissionSettings(player);
                    } else {
                        const errorMenu = new ActionFormData()
                            .title(`Wait!`)
                            .body(`You are not an Operator. If you enable these settings, you will lose access to admin priviledges for Elevators.\n\nAre you the World Owner? Set your permission level to Operator to stop displaying this warning.`)
                            .button(`Ok`)
                        errorMenu.show(player).then(response => { permissionSettings(player); })
                    }
                    break;
                default:
                    break;
            }
        }
    )
}

function permissionSettings(player) {
    const permissionMenu = new ModalFormData()
        .title(`Permission Settings`)
        .toggle(`Only Operators can change Elevator settings`, {defaultValue: JSON.parse(world.getDynamicProperty("honkit26113:elevator_settings_op_only"))})
        .toggle(`Only Operators can use Elevators`, {defaultValue: JSON.parse(world.getDynamicProperty("honkit26113:elevator_usage_op_only"))})
        .toggle(`Only Operators can use Wrenches to configure Elevator Blocks`, {defaultValue: JSON.parse(world.getDynamicProperty("honkit26113:wrench_usage_op_only"))})
    permissionMenu.show(player).then(
        (response) => {
            if (!response) return;
            world.setDynamicProperty("honkit26113:elevator_settings_op_only", JSON.stringify(response.formValues[0]));
            world.setDynamicProperty("honkit26113:elevator_usage_op_only", JSON.stringify(response.formValues[1]));
            world.setDynamicProperty("honkit26113:wrench_usage_op_only", JSON.stringify(response.formValues[2]));
            if (player.playerPermissionLevel !== PlayerPermissionLevel.Operator) {
                world.sendMessage(`§o§i[${player.name}: Changed Elevator access settings]§r`)
            }
        }
    )
}

/**
 * Finds the name of an elevator by its `elevatorId`. 
 * @param {Number} elevatorId 
 * @returns {String} name of the elevator, or `"New Elevator"` if undefined
 */
function getElevatorName(elevatorId) {
    if (world.getDynamicProperty(`honkit26113:elevator_names`) === undefined) {
        elevator_name = ["New Elevator"]
    } else {
        elevator_name = JSON.parse(world.getDynamicProperty(`honkit26113:elevator_names`));
    }
    if (elevator_name.length === 1) {
        "".concat(elevator_name)
    }
    return elevator_name[elevatorId] ?? "New Elevator";
}

/**
 * 
 * @param {Player} player 
 * @param {Integer} actionNumber 
 * 0: select elevator to focus terminal on
 * 1: edit elevator properties (can also choose floor to edit) -- REQUIRES ADD ELEVATOR BUTTON
 * 2: see all floors (for travel) - normal mode
 * 3: focus elevator for wrench
 */
export function showList(player, actionNumber, block) {
    const totalElevatorNumber = world.getDynamicProperty("honkit26113:total_elevator_number");
    if (totalElevatorNumber === undefined) {
        world.setDynamicProperty("honkit26113:total_elevator_number", 0)
    }
    world.sendMessage(`elevator no. property${world.getDynamicProperty("honkit26113:total_elevator_number")}`)
    world.sendMessage(`elevator no. variable${totalElevatorNumber}`)

    const listMenu = new ActionFormData()
        .title(`Select an Elevator`)
        if (actionNumber === 1) {
            listMenu.button(`Create New Elevator`, "textures/ui/plus");
        }
        if (actionNumber === 3) {
            listMenu.button(`Unbind this Wrench`, "textures/blocks/barrier");
        }
        for (let i = 1; i <= totalElevatorNumber; i++) {
            const thisElevatorName = getElevatorName(i);
            if (thisElevatorName === undefined) {
                listMenu.button(`New Elevator`);
            } else {
                listMenu.button(`${thisElevatorName}`);
            }
        }

    return listMenu.show(player).then(
        response => {
            switch (actionNumber) {
                case 0: // select elevator to focus terminal on
                    world.setDynamicProperty(`honkit26113:terminal${JSON.stringify(block.location)}`, response.selection + 1);
                    world.sendMessage(`p: ${world.getDynamicProperty(`honkit26113:terminal${JSON.stringify(block.location)}`)}`);
                    sendActionOutput(player, `Terminal bound to ${elevator_name[response.selection+1]}`);
                    break;
                case 1: // edit elevator properties (can also choose floor to edit)
                    open_submenu(player, response.selection, block, 1);
                    break;
                case 2: // see all floors (for travel) - normal mode
                    open_submenu(player, response.selection, block, 0);
                    break;
                case 3:
                    world.sendMessage(`${response.selection}`)
                    return response.selection;
                default:
                    return;
            }
        }
    );
}

export function open_main_menu(player, total_elevator_number, block) {
    /*if (world.getDynamicProperty(`honkit26113:elevator_names`) === undefined) {
        elevator_name = ["New Elevator"]
    } else {
        elevator_name = JSON.parse(world.getDynamicProperty(`honkit26113:elevator_names`));
    }
    if (elevator_name.length == 1) {
        "".concat(elevator_name)
    }
    world.sendMessage(`${elevator_name}`)*/
    world.sendMessage(`elevator no. property${world.getDynamicProperty("honkit26113:total_elevator_number")}`)
    world.sendMessage(`elevator no. variable${total_elevator_number}`)
    const main_menu = new ActionFormData()
        .title(`Select an elevator`)
        .button(`Create New Elevator`,"textures/ui/plus")
        for (let i = 1; i <= total_elevator_number; i++) {
            main_menu.button(getElevatorName(i));
        }
    main_menu.show(player).then(
        (main_menu_response) => {
            if (main_menu_response.selection === undefined) return;
            if (main_menu_response.selection == 0) {
                world.setDynamicProperty("honkit26113:total_elevator_number", total_elevator_number + 1)
                world.sendMessage(`${world.getDynamicProperty("honkit26113:total_elevator_number")}`)
                total_elevator_number += 1
                open_main_menu(player, total_elevator_number)
                return;
            }
            world.sendMessage(`Button no. ${main_menu_response.selection}`)
            open_submenu(player, main_menu_response.selection, block, 0)
        }
    )
}

export function open_submenu(player, elevator_code, block, actionNumber) {
    if (world.getDynamicProperty(`honkit26113:elevator_floor_names${elevator_code}`) === undefined) {
        elevator_floor_name = ["New Floor"]
    } else {
        elevator_floor_name = JSON.parse(world.getDynamicProperty(`honkit26113:elevator_floor_names${elevator_code}`));
    }
    world.sendMessage(`${world.getDynamicProperty(`honkit26113:elevator_floor_names${elevator_code}`)}`);
    const submenu = new ActionFormData()
    /*if (!elevator_name[elevator_code]) {
        elevator_name[elevator_code] = `New Elevator`
    };*/
    submenu.title(`Select Floor for ${getElevatorName(elevator_code)}`)
    if (actionNumber === 2) { // TODO: HIDE IF ONLY OPERATORS CAN EDIT SETTINGS
        submenu.button(`Open Admin Panel`,"textures/ui/permissions_op_crown")
    }
    // Edit Elevator Properties button
    if (actionNumber === 1) {
        submenu.button(`Edit Elevator Properties`,"textures/ui/editIcon")
    }
    // Floor selection buttons
    for (let i = 1; i <= elevator_floor_name.length - 1; i++) {
        if (elevator_floor_name[i] === undefined) {
            elevator_floor_name[i] = `New Floor`
        }
        submenu.button(`${elevator_floor_name[i]}`)
    }
    if (actionNumber === 1) {
        submenu.button("New Floor","textures/ui/plus")
    }
    submenu.show(player).then(
        async (submenu_response) => {
            if (submenu_response.selection === undefined) return;
            if (actionNumber === 1) {
                if (submenu_response.selection == 0) {
                    edit_elevator_properties(player, elevator_code);
                    return;
                } else {
                // open floor panel
                    if (elevator_floor_name[submenu_response.selection] === undefined) {
                        elevator_floor_name[submenu_response.selection] = `New Floor`;
                    }
                    open_floor_details(player, elevator_code, submenu_response.selection, block)
                }
            } else {
                if (submenu_response.selection == 0) {
                    if (player.playerPermissionLevel === PlayerPermissionLevel.Operator || !JSON.parse(world.getDynamicProperty("honkit26113:elevator_settings_op_only"))) {
                        openInitMenu(player, block);
                    } else {
                        await noPermsErrorMenu(player);
                    }
                } else {
                    world.sendMessage(`Button no. ${submenu_response.selection}`)
                    
                    if (JSON.parse(world.getDynamicProperty("honkit26113:elevator_usage_op_only")) && player.playerPermissionLevel !== PlayerPermissionLevel.Operator) {
                        await noPermsErrorMenu(player);
                    } else {
                        if (world.getDynamicProperty(`honkit26113:elevator_floor_levels${elevator_code}`) === undefined) {
                            elevator_floor_level = [0]
                        } else {
                            elevator_floor_level = JSON.parse(world.getDynamicProperty(`honkit26113:elevator_floor_levels${elevator_code}`));
                        }

                        // Move elevator to destination floor
                        move_elevator(elevator_floor_level[submenu_response.selection], block, elevator_code);
                        sendActionOutput(player, `Sent elevator to floor ${elevator_floor_name[submenu_response.selection]}`)
                    }
                }
            }
        }
    )
}

// ADMIN ONLY
export function open_floor_details(player, elevator_code, floor, block) {
    if (world.getDynamicProperty(`honkit26113:elevator_floor_levels${elevator_code}`) === undefined) {
        elevator_floor_level = [0]
    } else {
        elevator_floor_level = JSON.parse(world.getDynamicProperty(`honkit26113:elevator_floor_levels${elevator_code}`));
    }

    const floor_details = new ModalFormData()
        .title(`${elevator_floor_name[floor]} Properties`)
        .textField('Floor Name', '', {defaultValue: `${elevator_floor_name[floor]}`})
        .textField('Floor Y Level', 'Integers Only', {defaultValue: JSON.stringify(elevator_floor_level[floor])})
        .toggle('Send the elevator here', {defaultValue: true})
        .show(player)
        .then(
            (floor_response) => {
                elevator_floor_name[floor] = (floor_response.formValues[0])
                elevator_floor_level[floor] = Number(floor_response.formValues[1])

                world.sendMessage(`y level ${elevator_floor_level[floor]}, floor no. ${floor}`)
                world.sendMessage(`name ${elevator_floor_name[elevator_code]} level list${elevator_floor_level}`)
                world.sendMessage(`name list ${JSON.stringify(elevator_floor_name)}`)

                world.setDynamicProperty(`honkit26113:elevator_floor_names${elevator_code}`, JSON.stringify(elevator_floor_name))
                world.setDynamicProperty(`honkit26113:elevator_floor_levels${elevator_code}`, JSON.stringify(elevator_floor_level))

                let destination_level = 0;
                if (floor_response.formValues[2] === true) {
                    if (destination_level === undefined) {
                        world.sendMessage(`Floor Y Level cannot be empty`)
                        return;
                    }
                    destination_level = elevator_floor_level[floor];
                    move_elevator(destination_level, block, elevator_code);
                    sendActionOutput(player, `Sent elevator to floor ${elevator_floor_name[floor]}`)
                }

                //world.sendMessage(`names: ${JSON.stringify(world.getDynamicProperty(`honkit26113:elevator_floor_names${elevator_code}`))}`)
                //world.sendMessage(`levels: ${JSON.stringify(world.getDynamicProperty(`honkit26113:elevator_floor_levels${elevator_code}`))}`)
            }
        )
}

// ADMIN ONLY
export function edit_elevator_properties(player, elevator_code) {
    const thisElevatorName = getElevatorName(elevator_code);
    const elevator_properties_panel = new ModalFormData()
        .title(`Edit ${thisElevatorName}`)
        .textField('Elevator Name', '', {defaultValue: thisElevatorName})
        .toggle(`Delete this elevator. §cThis action cannot be reversed!§r`, {defaultValue: false})
        .show(player)
        .then(
            (edit_response) => {
                elevator_name[elevator_code] = edit_response.formValues[0]
                world.setDynamicProperty("honkit26113:elevator_names",JSON.stringify(elevator_name))
                sendActionOutput(player, `Changes saved`)

                world.sendMessage(`name is: ${elevator_name[elevator_code]}`)
                world.sendMessage(`dynamic property: ${world.getDynamicProperty("honkit26113:elevator_names")}`)
            }
        )
    return elevator_properties_panel;
}



/**
 * 
 * @param {Number} destinationLevel y-level for the elevator to move to
 * @param {Block} block the elevator terminal block
 * @param {Number} elevatorToMove `elevatorId` to be moved
 * @returns 
 */
export function move_elevator(destinationLevel, block, elevatorToMove) {
    world.sendMessage(`e_to_move: ${elevatorToMove}, ${typeof(elevatorToMove)}`)
    const findElevator = block.dimension.getEntities({
        type: "honkit26113:elevator_block",
        location: { x: block.location.x-2, y: -63, z: block.location.z-2 },
        volume: { x: 5, y: 320, z: 5 },
        maxDistance: 320,
        propertyOptions: [{
            propertyId: "honkit26113:elevator_id",
            value: {equals: Number(elevatorToMove)}
        }]
    });
    for (const e of findElevator) {
        if (Math.floor(e.location.y) === destinationLevel) {
            world.sendMessage(`you're already here!`)
            return;
        }
        
        system.runJob(move(e, destinationLevel));
    }
}


function* move(entity, destination_level) {
    const destination_level_adjusted = Math.round(destination_level);
    let last_executed_tick = system.currentTick;
    while (true) {
        if (system.currentTick - last_executed_tick >= 1) {
            last_executed_tick = system.currentTick;
            if (destination_level_adjusted > entity.location.y) {
                entity.teleport({ x: entity.location.x, y: entity.location.y+0.1, z: entity.location.z })
            } else {
                entity.teleport({ x: entity.location.x, y: entity.location.y-0.1, z: entity.location.z })
            }
            if (Math.abs(entity.location.y - destination_level_adjusted) < 0.1) {
                const find_passengers = entity.dimension.getEntities({
                    type: "minecraft:player",
                    location: entity.location,
                    maxDistance: 3
                })
                for (const p of find_passengers) {
                    p.playSound("honkit26113.elevator_arrive")
                }
                entity.teleport({x: entity.location.x, y: destination_level, z: entity.location.z});
                return 0;
            }
        }
        yield;
    }
}