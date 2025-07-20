import { world, system, BlockPermutation, BlockTypes } from '@minecraft/server';
import { ActionFormData, ModalFormData, ActionFormResponse } from "@minecraft/server-ui";

const array_length = 20;
/*let elevator_details = [
    [ 
        "G", "1", "2", "3", "4",
        "5", "6", "7", "8", "9",
        "10", "New Floor", "New Floor", "New Floor", "New Floor",
        "New Floor", "New Floor", "New Floor", "New Floor", "New Floor"
    ],
    [ 66, 72, 77, 82, 87, 92, 97, 102, 107, 112, 117, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
]*/

let elevator_details = [];
if (world.getDynamicProperty("honkit26113:elevator1") === undefined || world.getDynamicProperty("honkit26113:elevator1") === 0) {
    elevator_details = [
        [ 
            "G", "1", "2", "3", "4",
            "5", "6", "7", "8", "9",
            "10", "New Floor", "New Floor", "New Floor", "New Floor",
            "New Floor", "New Floor", "New Floor", "New Floor", "New Floor"
        ],
        [ 66, 72, 77, 82, 87, 92, 97, 102, 107, 112, 117, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
} else elevator_details = JSON.parse(world.getDynamicProperty("honkit26113:elevator1"))
world.sendMessage(`${elevator_details}`)
// move the above to execute after the player chooses the elevator to control
// if the dynamic property is empty, generate a new array


let destination_level = 0;

var total_elevator_number = world.getDynamicProperty("honkit26113:total_elevator_number");
world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('honkit26113:on_interact', {
        onPlayerInteract(e) {
            const { player, block } = e;
                const form = new ActionFormData();
                form.title(`Elevator (no.)`);
                //form.body("test body");
                for (let i = 0; i < array_length; i++) {
                    form.button((elevator_details[0][i]).toString());
                }
                form.show(player).then(
                    (response) => {
                        
                        const form = new ModalFormData().title(`Floor Properties of ${(elevator_details[0][response.selection]).toString()}`);
                        form.textField('Floor Name', '', (elevator_details[0][response.selection]).toString());
                        form.textField('Floor Y Level', 'Integers Only', elevator_details[1][response.selection].toString());
                        form.toggle('Send the elevator here', true);
                        form.show(player)
                            .then(FormData => {
                                player.sendMessage(`Modal form results: ${JSON.stringify(FormData.formValues)}`);
                                elevator_details[0][response.selection] = FormData.formValues[0];
                                elevator_details[1][response.selection] = FormData.formValues[1];
                                world.sendMessage(`this is ${JSON.stringify(elevator_details[0][response.selection])}`);
                                if (FormData.formValues[2] === true) {
                                    destination_level = elevator_details[1][response.selection];
                                }
                                world.setDynamicProperty("honkit26113:elevator1", JSON.stringify(elevator_details));
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
                                                entity.runCommand("playsound honkit26113.elevator_arrive @a[r=15]")
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
        }
    })
});