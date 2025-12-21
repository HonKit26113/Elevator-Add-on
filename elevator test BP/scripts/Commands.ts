import { world, system, CommandPermissionLevel, CustomCommandStatus, CustomCommand, CustomCommandResult } from '@minecraft/server';
import { emptyElevatorData } from './Elevator';

system.beforeEvents.startup.subscribe((init) => {
  const helloCommand: CustomCommand = {
    name: "honkit26113:elevatordata",
    description: "Prints JSON of the list of elevators to console.",
    permissionLevel: CommandPermissionLevel.GameDirectors,
    optionalParameters: []
  };
  init.customCommandRegistry.registerCommand(helloCommand, elevatorDataCommand);
})


function elevatorDataCommand(): CustomCommandResult {
    system.run(() => {
        const elevatorJson = world.getDynamicProperty("honkit26113:elevator_data");
        const elevatorData = elevatorJson ? JSON.parse(elevatorJson as string) : emptyElevatorData;
        console.warn(JSON.stringify(elevatorData));
    });
    return {
      status: CustomCommandStatus.Success
    };
}