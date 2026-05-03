import { world, system, CommandPermissionLevel, CustomCommandStatus, CustomCommand, CustomCommandResult, CustomCommandOrigin, Player } from '@minecraft/server';
import { emptyElevatorData, permissionSettings } from './Elevator';

system.beforeEvents.startup.subscribe((init) => {
  const dataCommand: CustomCommand = {
    name: "honkit26113:elevatordata",
    description: "Prints JSON of the list of elevators to console.",
    permissionLevel: CommandPermissionLevel.GameDirectors,
    optionalParameters: []
  };
  const opMenuCommand: CustomCommand = {
    name: "honkit26113:elevatorop",
    description: "Opens Permission Settings for elevators.",
    permissionLevel: CommandPermissionLevel.GameDirectors,
    optionalParameters: []
  };

  init.customCommandRegistry.registerCommand(dataCommand, elevatorDataCommand);
  init.customCommandRegistry.registerCommand(opMenuCommand, elevatorOPMenuCommand);
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

function elevatorOPMenuCommand(origin: CustomCommandOrigin): CustomCommandResult {
  system.run(() => {
    const player = origin.sourceEntity;
    if (!(player instanceof Player)) {
      return { status: CustomCommandStatus.Failure };
    }
    permissionSettings(player);
  });
  return {
    status: CustomCommandStatus.Success
  };
}
