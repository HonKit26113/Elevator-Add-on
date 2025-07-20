import { world, system, BlockPermutation, BlockTypes } from '@minecraft/server';
import { ActionFormData, ModalFormData, ActionFormResponse } from "@minecraft/server-ui";

const array_length = 20; // customizable


let destination_level = 0;
var total_elevator_number = world.getDynamicProperty("honkit26113:total_elevator_number");
if (total_elevator_number === undefined) {
    world.setDynamicProperty("honkit26113:total_elevator_number", 0);
    total_elevator_number = 0;
}
world.sendMessage(`${world.getDynamicProperty("honkit26113:total_elevator_number")}`)

if (world.getDynamicProperty("honkit26113:elevator_has_initialized") == undefined) {
    for (let i = 0; i < 100; i++) {
        world.setDynamicProperty(`honkit26113:elevator${i}`,0)
    }

    let test_array = [`"New Elevator"`]
    world.setDynamicProperty("honkit26113:elevator_names", JSON.stringify(test_array))
    world.setDynamicProperty("honkit26113:elevator_has_initialized", true);
}

world.sendMessage(`hello bye ${world.getDynamicProperty("honkit26113:elevator_names")}`)


world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('honkit26113:on_interact', {
        onPlayerInteract(e) {
            const { player, block } = e;

            //let elevator_names = []
           let elevator_names = JSON.parse(world.getDynamicProperty("honkit26113:elevator_names"))

            if (elevator_names.length == 0) {
                elevator_names[0] = "New Elevator"
            }
            // main menu
            const main_menu = new ActionFormData();
            main_menu.title(`Select an elevator`);
            
            main_menu.button(`Create New Elevator`, "textures/ui/plus");
            for (let i = 1; i <= world.getDynamicProperty("honkit26113:total_elevator_number"); i++) {
                let test = (elevator_names[i])
                world.sendMessage(`${test}`)
                main_menu.button(`${elevator_names[i]}`);
            }
            
            let elevator_details = []
            main_menu.show(player).then(
                (main_menu_response) => {
                    world.sendMessage(`${main_menu_response.selection-1}`)
                    if (main_menu_response.selection === undefined) return;
                    
                    if (main_menu_response.selection-1 != -1) {
                        elevator_details = world.getDynamicProperty(`honkit26113:elevator${main_menu_response.selection-1}`)
                    } else {
                        world.setDynamicProperty("honkit26113:total_elevator_number", total_elevator_number + 1);
                        world.sendMessage(`happy ${world.getDynamicProperty("honkit26113:total_elevator_number")}`)
                        elevator_details = world.getDynamicProperty(`honkit26113:elevator${world.getDynamicProperty("honkit26113:total_elevator_number")}`)
                        world.sendMessage(`${elevator_details}`)
                    }

                    world.sendMessage(`this is hi ${elevator_details}`)
                    if (elevator_details == 0) {
                        elevator_details = [
                            [ 
                                "New Floor", "New Floor", "New Floor", "New Floor", "New Floor",
                                "New Floor", "New Floor", "New Floor", "New Floor", "New Floor",
                                "New Floor", "New Floor", "New Floor", "New Floor", "New Floor",
                                "New Floor", "New Floor", "New Floor", "New Floor", "New Floor"
                            ],
                            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                        ]
                    }

                // submenu for each elevator
                const submenu_form = new ActionFormData();
                submenu_form.title(`${elevator_names[main_menu_response.selection]} Properties`);
                //form.body("test body");
                submenu_form.button(`Edit Elevator Name`, "textures/ui/editIcon");
                for (let i = 0; i < array_length; i++) {
                    submenu_form.button((elevator_details[0][i]));
                }
                submenu_form.show(player).then(
                    (response) => {
                        if (response.selection == 0) {
                            const elevator_name_form = new ModalFormData()
                                .title(`Change name of ${JSON.stringify(elevator_names[main_menu_response.selection])}`)
                                .textField('Name', '', `${JSON.stringify(elevator_names[main_menu_response.selection])}`)
                                .show(player)
                                .then(FormData => {
                                    elevator_names[main_menu_response.selection] = (FormData.formValues[0]);
                                    world.setDynamicProperty("honkit26113:elevator_names", JSON.stringify(elevator_names))
                                    //world.sendMessage(`names: ${JSON.stringify(elevator_names)}`)
                                })
                            return;
                        }
                        const form = new ModalFormData().title(`Floor Properties of ${JSON.stringify(elevator_details[0][response.selection+1])}`);
                        form.textField('Floor Name', '', ((elevator_details[0][response.selection+1])));
                        form.textField('Floor Y Level', 'Integers Only', JSON.stringify(elevator_details[1][response.selection+1]));
                        form.toggle('Send the elevator here', true);
                        form.show(player)
                            .then(FormData => {
                                //player.sendMessage(`Modal form results: ${JSON.stringify(FormData.formValues)}`);
                                elevator_details[0][response.selection] = FormData.formValues[0];
                                elevator_details[1][response.selection] = FormData.formValues[1];
                                world.sendMessage(`this is ${JSON.stringify(elevator_details[0][response.selection+1])}`);
                                if (FormData.formValues[2] === true) {
                                    destination_level = elevator_details[1][response.selection+1];
                                }
                                world.setDynamicProperty(`honkit26113:elevator${main_menu_response.selection}`, (elevator_details));
                                world.sendMessage(`this is ${destination_level}`)
                                world.sendMessage(`this is ${world.getDynamicProperty("honkit26113:elevator1")}`)

                                if (destination_level == 0) return;
        

                                const find_elevator = block.dimension.getEntities({
                                    type: "honkit26113:elevator_block",
                                    location: { x: block.location.x-2, y: block.location.y-50, z: block.location.z-2 },
                                    volume: { x: 3, y: 200, z: 3 },
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
                                                    passenger.teleport({ x: entity.location.x, y: entity.location.y+1, z: entity.location.z })
                                                }
                                                system.clearRun(elevator_move);
                                            }
                                        }
                                    }, 2);
                                }
                            })
                    }
                )
            })
        }
    })
});