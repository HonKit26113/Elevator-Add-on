import { world, system, CommandPermissionLevel } from '@minecraft/server';
import { emptyElevatorData } from './elevator_main_menu';

system.beforeEvents.startup.subscribe((init) => {
  const helloCommand = {
    name: "honkit26113:elevatordata",
    description: "Prints JSON of the list of elevators to console.",
    permissionLevel: CommandPermissionLevel.GameDirectors,
    optionalParameters: []
  };
  init.customCommandRegistry.registerCommand(helloCommand, helloCustomCommand);
})


function helloCustomCommand() {
    system.run(() => {
        const elevatorJson = world.getDynamicProperty("honkit26113:elevator_data");
        const elevatorData = elevatorJson ? JSON.parse(elevatorJson) : emptyElevatorData;
        console.warn(JSON.stringify(elevatorData));
    });
}