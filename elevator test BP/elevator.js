import { world , system, Dimension, GameMode, Player } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";

world.afterEvents.itemUse.subscribe((data) => {
    var destination_level = 0;
	const player = data.source;
	const item = player.getComponent("minecraft:inventory").container.getItem(player.selectedSlotIndex);
    if (item.typeId === "minecraft:stick") {
        const form = new ActionFormData();
        form.title("test title");
        form.body("test body");
        form.button("G");
        form.button("1");
        form.button("2");
        form.button("3");
        form.button("4");
        form.button("5");
        form.button("6");
        form.button("7");
        form.button("8");
        form.show(player).then(
            (response) => {
                switch (response?.selection) {
                    case 0: // G
						destination_level = 66;
                        break;
                    case 1: // 1
                        destination_level = 72;
                        break;
                    case 2: // 2
						destination_level = 77;
                        break;
                    case 3: // 3
                        destination_level = 82;
                        break;
                    case 4: // 4
                        destination_level = 87;
                        break;
                    case 5: // 5
						destination_level = 92;
                        break;
                    case 6: // 6
                        destination_level = 97;
                        break;
                    case 7: // 7
						destination_level = 102;
                        break;
                    case 8: // 8
                        destination_level = 107;
                        break;
                };


                const find_elevator = player.dimension.getEntities({
                    type: "honkit26113:elevator_block",
                    location: player.location,
                    maxDistance: 20
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
                                passenger.teleport({ x: entity.location.x, y: entity.location.y+0.1, z: entity.location.z }, {rotation: entity.rotation})
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
                                passenger.teleport({ x: entity.location.x, y: entity.location.y-0.1, z: entity.location.z }, {rotation: entity.rotation})
                            }
                            if (Math.round(entity.location.y) == destination_level_adjusted) {
                                entity.runCommand("setblock ~ ~-1 ~ minecraft:dirt")
                                entity.runCommand("tp @e[r=1] ~ ~1 ~")
                                system.clearRun(elevator_move);
                            }
                        }
                    }, 2);
                    
                }
            }
        );
    }
})