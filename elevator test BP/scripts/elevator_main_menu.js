import { world, system, BlockPermutation, BlockTypes } from '@minecraft/server';
import { ActionFormData, ModalFormData, ActionFormResponse } from "@minecraft/server-ui";


let elevator_name = []
let elevator_floor_name = []
let elevator_floor_level = []

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
            open_submenu(player, main_menu_response.selection, block)
        }
    )
}

export function open_submenu(player, elevator_code, block) {
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
    submenu.title(`${elevator_name[elevator_code]}`)
    submenu.button(`Edit Elevator Properties`,"textures/ui/editIcon")
    for (let i = 1; i <= 20; i++) {
        if (elevator_floor_name[i] === undefined) {
            elevator_floor_name[i] = `New Floor`
        }
        submenu.button(`${elevator_floor_name[i]}`)
    }
    submenu.show(player).then(
        (submenu_response) => {
            if (submenu_response.selection === undefined) return;
            world.setDynamicProperty("honkit26113:elevator_names", JSON.stringify(elevator_name));
            world.sendMessage(`Button no. ${submenu_response.selection}`)

            // edit elevator properties
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
        }
    )
}

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
}

export function move_elevator(destination_level, block) {
    const find_elevator = block.dimension.getEntities({
        type: "honkit26113:elevator_block",
        location: { x: block.location.x-2, y: block.location.y-50, z: block.location.z-2 },
        volume: { x: 3, y: 250, z: 3 },
        maxDistance: 320
    })
    for (const entity of find_elevator) {
        if (entity.location.y === destination_level) {
            world.sendMessage(`you're already here!`)
            return;
        }
        
        const destination_level_adjusted = Math.round(destination_level);
        entity.runCommand(`setblock ~ ~-1 ~ air`)
        const elevator_move = system.runInterval(() => {
            if (destination_level_adjusted > entity.location.y) {
                entity.teleport({ x: entity.location.x, y: entity.location.y+0.1, z: entity.location.z })
                const find_passengers = entity.dimension.getEntities({
                    location: entity.location,
                    maxDistance: 1
                })
                for (const passenger of find_passengers) {
                    passenger.teleport({ x: passenger.location.x, y: entity.location.y+0.1, z: passenger.location.z }, {rotation: passenger.rotation})
                }
                if (Math.floor(entity.location.y) == destination_level_adjusted) {
                    entity.runCommand("setblock ~ ~-1 ~ minecraft:dirt")
                    entity.runCommand("tp @e[r=1] ~ ~1 ~")
                    system.clearRun(elevator_move);
                }
            } else {
                entity.teleport({ x: entity.location.x, y: entity.location.y-0.1, z: entity.location.z })
                const find_passengers = entity.dimension.getEntities({
                    location: entity.location,
                    maxDistance: 1
                })
                for (const passenger of find_passengers) {
                    passenger.teleport({ x: passenger.location.x, y: entity.location.y-0.1, z: passenger.location.z }, {rotation: passenger.rotation})
                }
                if (Math.round(entity.location.y) == destination_level_adjusted) {
                    entity.runCommand("setblock ~ ~-1 ~ minecraft:dirt")
                    for (const passenger of find_passengers) {
                        passenger.runCommand("playsound honkit26113.elevator_arrive @a[r=15]")
                        passenger.teleport({ x: entity.location.x, y: entity.location.y+1, z: entity.location.z })
                    }
                    system.clearRun(elevator_move);
                }
            }
        }, 2);
    }
}