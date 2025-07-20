import { world, system, BlockPermutation, BlockTypes } from '@minecraft/server';
import { ActionFormData, ModalFormData, ActionFormResponse } from "@minecraft/server-ui";

let elevator_details = [
    [ 
        "G", "1", "2", "3", "4",
        "5", "6", "7", "8", "9",
        "10", "New Floor", "New Floor", "New Floor", "New Floor",
        "New Floor", "New Floor", "New Floor", "New Floor", "New Floor"
    ],
    [ 66, 72, 77, 82, 87, 92, 97, 102, 107, 112, 117, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
]
export function show_data_entry_form(player) {
    const form = new ModalFormData().title('Example Modal Controls for ModalFormData');
    form.textField('Floor name', 'type text here', 'New Floor');
    form.textField('Floor y level', 'type text here');
    form.button("Send elevator here");
    form
        .show(player)
        .then(FormData => {
            player.sendMessage(`Modal form results: ${JSON.stringify(FormData.formValues)}`);
            player.sendMessage(`Modal form results: ${elevator_details[x, y].length}`);
        })
}

var total_elevator_number = world.getDynamicProperty("honkit26113:total_elevator_number");
world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('honkit26113:on_interact', {
        onPlayerInteract(e) {
            const { player, block } = e;
            var destination_level = 0;
                const form = new ActionFormData();
                form.title("test title");
                form.body("test body");
                for (let i = 0; i < 20; i++) {
                    form.button((elevator_details[0][i]).toString());
                }
                /*form.button("G");
                form.button("1");
                form.button("2");
                form.button("3");
                form.button("4");
                form.button("5");
                form.button("6");
                form.button("7");
                form.button("8");
                form.button("new");*/
                form.show(player).then(
                    (response) => {
                        show_data_entry_form(player);
                        /*switch (response?.selection) {
                            case 0: // G
                                destination_level = elevator_details[1][0];
                                break;
                            case 1: // 1
                                destination_level = elevator_details[1][1];
                                break;
                            case 2: // 2
                                destination_level = elevator_details[1][2];
                                break;
                            case 3: // 3
                                destination_level = elevator_details[1][3];
                                break;
                            case 4: // 4
                                destination_level = elevator_details[1][4];
                                break;
                            case 5: // 5
                                destination_level = elevator_details[1][5];
                                break;
                            case 6: // 6
                                destination_level = elevator_details[1][6];
                                break;
                            case 7: // 7
                                destination_level = elevator_details[1][7];
                                break;
                            case 8: // 8
                                destination_level = elevator_details[1][8];
                                break;
                            case 9: // 9
                                destination_level = elevator_details[1][9];
                                break;
                            case 10: // 10
                                destination_level = elevator_details[1][10];
                                break;
                        };*/
                        if (destination_level == 0) return;
        
                        const find_elevator = block.dimension.getEntities({
                            type: "honkit26113:elevator_block",
                            location: { x: block.location.x-2, y: block.location.y-50, z: block.location.z-2 },
                            volume: { x: 3, y: 200, z: 3 },
                            maxDistance: 320
                        })
                        for (const entity of find_elevator) {
                            world.sendMessage(`location: ${block.location.x-2}, -63, ${block.location.z-2}`)
                            world.sendMessage(`volume: ${block.location.x+2}, 319, ${block.location.z+2}`)
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
                    }
                );
        }
    })
});