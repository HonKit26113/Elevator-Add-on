import { world, system } from '@minecraft/server';
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";


/** 
 * TODO:
 * - "Remember Elevator" DONE
 * - Admin privileges (only admins can edit & select floor)
 * - Elevator tags
 * - Elevator wrenches to set settings for each elevator entity (entity tags)
 * - Customizable elevator speeds
 * */ 


let elevator_name = []
let elevator_floor_name = []
let elevator_floor_level = []

export function openInitMenu(player, total_elevator_number, block) {
    const initMenu = new ActionFormData()
        .title(`Hello!`)
        .body(`test`)
        .button(`Set up this Terminal`)
        .button(`Add/Edit Elevators`)
        //.toggle(`Only Operators can change Elevator settings`, false);
    initMenu.show(player).then(
        (response) => {
            switch (response.selection) {
                case 0:
                case 1:
                    showList(player, total_elevator_number, response.selection, block);
                    break;
                //case 2:
                    // toggle
                    //if (response.formValues[2] === true) {
                    // set dynamic property
                    //break;
                default:
                    world.sendMessage("hi")
                    return;
            }
        }
    )
}

/**
 * 
 * @param {Player} player 
 * @param {Integer} actionNumber 
 * 0: select elevator to focus terminal on
 * 1: edit elevator properties (can also choose floor to edit) -- REQUIRES ADD ELEVATOR BUTTON
 * 2: see all floors (for travel) - normal mode
 */
function showList(player, total_elevator_number, actionNumber, block) {
    if (world.getDynamicProperty(`honkit26113:elevator_names`) === undefined) {
        elevator_name = ["New Elevator"]
    } else {
        elevator_name = JSON.parse(world.getDynamicProperty(`honkit26113:elevator_names`));
    }
    if (elevator_name.length == 1) {
        "".concat(elevator_name)
    }
    world.sendMessage(`${elevator_name}`)
    world.sendMessage(`elevator no. property${world.getDynamicProperty("honkit26113:total_elevator_number")}`)
    world.sendMessage(`elevator no. variable${total_elevator_number}`)

    const listMenu = new ActionFormData()
        .title(`Select an Elevator`)
        if (actionNumber === 1) {
            listMenu.button(`Create New Elevator`,"textures/ui/plus")
        }
        for (let i = 1; i <= total_elevator_number; i++) {
            if (elevator_name[i] === undefined) {
                listMenu.button(`New Elevator`)
            } else {
                listMenu.button(`${elevator_name[i]}`)
            }
        }

    listMenu.show(player).then(
        response => {
            switch (actionNumber) {
                case 0: // select elevator to focus terminal on
                    world.setDynamicProperty(`honkit26113:terminal${JSON.stringify(block.location)}`, response.selection + 1);
                    world.sendMessage(`p: ${world.getDynamicProperty(`honkit26113:terminal${JSON.stringify(block.location)}`)}`)
                    break;
                case 1: // edit elevator properties (can also choose floor to edit)
                    open_submenu(player, response.selection, block, 1);
                    break;
                case 2: // see all floors (for travel) - normal mode
                    open_submenu(player, response.selection, block, 0);
                    break;
                default:
                    return;
            }
        }
    )
}

export function open_main_menu(player, total_elevator_number, block) {
    if (world.getDynamicProperty(`honkit26113:elevator_names`) === undefined) {
        elevator_name = ["New Elevator"]
    } else {
        elevator_name = JSON.parse(world.getDynamicProperty(`honkit26113:elevator_names`));
    }
    if (elevator_name.length == 1) {
        "".concat(elevator_name)
    }
    world.sendMessage(`${elevator_name}`)
    world.sendMessage(`elevator no. property${world.getDynamicProperty("honkit26113:total_elevator_number")}`)
    world.sendMessage(`elevator no. variable${total_elevator_number}`)
    const main_menu = new ActionFormData()
        .title(`Select an elevator`)
        .button(`Create New Elevator`,"textures/ui/plus")
        for (let i = 1; i <= total_elevator_number; i++) {
            if (elevator_name[i] === undefined) {
                main_menu.button(`New Elevator`)
            } else {
                main_menu.button(`${elevator_name[i]}`)
            }
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
    world.sendMessage(`${world.getDynamicProperty(`honkit26113:elevator_floor_names${elevator_code}`)}`)

    const submenu = new ActionFormData()
    if (elevator_name[elevator_code] === undefined) {
        elevator_name[elevator_code] = `New Elevator`
    };
    submenu.title(`Select Floor for ${elevator_name[elevator_code]}`)
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
        (submenu_response) => {
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
                    // TODO: CHECK FOR PERMISSION LEVEL
                    openInitMenu(player, world.getDynamicProperty("honkit26113:total_elevator_number"), block)
                    return;
                } else {
                    world.sendMessage(`Button no. ${submenu_response.selection}`)
                    
                    if (world.getDynamicProperty(`honkit26113:elevator_floor_levels${elevator_code}`) === undefined) {
                        elevator_floor_level = [0]
                    } else {
                        elevator_floor_level = JSON.parse(world.getDynamicProperty(`honkit26113:elevator_floor_levels${elevator_code}`));
                    }

                    // Move elevator to destination floor
                    move_elevator(elevator_floor_level[submenu_response.selection], block);
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
        .textField('Floor Name', '', `${elevator_floor_name[floor]}`)
        .textField('Floor Y Level', 'Integers Only', JSON.stringify(elevator_floor_level[floor]))
        .toggle('Send the elevator here', true)
        .show(player)
        .then(
            (floor_response) => {
                elevator_floor_name[floor] = (floor_response.formValues[0])
                elevator_floor_level[floor] = Number(floor_response.formValues[1])

                world.sendMessage(`y level ${elevator_floor_level[floor]}, floor no. ${floor}`)
                world.sendMessage(`name ${elevator_floor_name[elevator_code]} level list${elevator_floor_level}`)
                world.sendMessage(`name list ${JSON.stringify(elevator_floor_name)}`)

                world.setDynamicProperty(`honkit26113:elevator_floor_names${elevator_code}`,JSON.stringify(elevator_floor_name))
                world.setDynamicProperty(`honkit26113:elevator_floor_levels${elevator_code}`,JSON.stringify(elevator_floor_level))

                let destination_level = 0;
                if (floor_response.formValues[2] === true) {
                    if (destination_level === undefined) {
                        world.sendMessage(`Floor Y Level cannot be empty`)
                        return;
                    }
                    destination_level = elevator_floor_level[floor];
                    move_elevator(destination_level, block);
                }

                //world.sendMessage(`names: ${JSON.stringify(world.getDynamicProperty(`honkit26113:elevator_floor_names${elevator_code}`))}`)
                //world.sendMessage(`levels: ${JSON.stringify(world.getDynamicProperty(`honkit26113:elevator_floor_levels${elevator_code}`))}`)
            }
        )
}

// ADMIN ONLY
export function edit_elevator_properties(player, elevator_code) {
    const elevator_properties_panel = new ModalFormData()
        .title(`Edit ${elevator_name[elevator_code]}`)
        .textField('Elevator Name', '', elevator_name[elevator_code])
        .show(player)
        .then(
            (edit_response) => {
                elevator_name[elevator_code] = edit_response.formValues[0]
                world.setDynamicProperty("honkit26113:elevator_names",JSON.stringify(elevator_name))
                world.sendMessage(`Saved`)

                world.sendMessage(`name is: ${elevator_name[elevator_code]}`)
                world.sendMessage(`dynamic property: ${world.getDynamicProperty("honkit26113:elevator_names")}`)
            }
        )
    return elevator_properties_panel;
}




export function move_elevator(destination_level, block) {
    const find_elevator = block.dimension.getEntities({
        type: "honkit26113:elevator_block",
        location: { x: block.location.x-2, y: block.location.y-50, z: block.location.z-2 },
        volume: { x: 3, y: 250, z: 3 },
        maxDistance: 320
    })
    for (const entity of find_elevator) {
        if (Math.floor(entity.location.y) === destination_level) {
            world.sendMessage(`you're already here!`)
            return;
        }
        
        system.runJob(move(entity, destination_level));
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