import { world, system, PlayerPermissionLevel } from '@minecraft/server';
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { noPermsErrorMenu } from './ElevatorTerminal';


/** 
 * TODO:
 * - "Remember Elevator" DONE
 * - Admin privileges (only admins can edit & select floor) DONE
 * - Elevator tags DONE
 * - Elevator wrenches to set settings for each elevator entity (entity tags) DONE
 *      --> need admin priviledges for wrench usage DONE
 * - Customizable elevator speeds DONE
 * - Send text message output (italics) [player: action] DONE 
 *      --> need for wrench actions
 * - Delete elevator/floor function DONE
 * - Use JSON for storage instead of parallel arrays DONE
 * - Changeable elevator block textures
 **/ 


// Initialize JSON
let elevatorJson;
let elevatorData;
system.run(() => {
    elevatorJson = world.getDynamicProperty("honkit26113:elevator_data");
    elevatorData = elevatorJson ? JSON.parse(elevatorJson) : emptyElevatorData;
})
export const emptyElevatorData = { "elevators": [] };
const newElevatorData = {
    "id": -1,
    "name": "uninitialized",
    "texture": "iron_block",
    "speed": 1,
    "floors": []
}

/**
 * Finds and returns the elevator object with the highest ID number in a list of elevators.
 * @returns {number} the highest ID
 */
function findHighestId() {
    return elevatorData.elevators.reduce((maxId, elevator) => {
        return Math.max(maxId, elevator.id);
    }, 0);
}

/**
 * Saves elevator data to the dynamic property.
 */
function save() {
    world.setDynamicProperty("honkit26113:elevator_data", JSON.stringify(elevatorData));
}

/**
 * Displays an actionbar message to a player.
 * @param {Player} player 
 * @param {string} message 
 */
export function sendActionOutput(player, message) {
    player.onScreenDisplay.setActionBar(message);
}

/**
 * Finds the name of a floor by its `elevatorId` and index, reading from JSON. 
 * @param {Number} elevatorId 
 * @param {Number} index
 * @returns {String} name of the floor, or `"New Floor"` if undefined
 */
function getFloorName(elevatorId, index) {
    const elevator = getElevatorById(elevatorId);
    if (!elevator) return "New Floor"; 
    
    // Check if the floor object itself exists before reading '.name'
    const floor = elevator.floors[index];
    return floor ? floor.name : "New Floor";
}

/**
 * Sets the name of a floor.
 * @param {Number} elevatorId 
 * @param {Number} index 
 * @param {String} newName 
 * @returns {void}
 */
function setFloorName(elevatorId, index, newName) {
    const elevator = getElevatorById(elevatorId);

    // Check if the elevator exists
    if (!elevator) {
        console.error(`SetFloorName failed: Elevator ID ${elevatorId} not found.`);
        return;
    }
    
    // Access the floor array and the specific floor object
    const targetFloor = elevator.floors[index];
    
    // Check if the specific floor object exists at that index
    if (!targetFloor) {
        console.error(`SetFloorName failed: Floor index ${index} is invalid.`);
        return;
    }
    targetFloor.name = newName;
    save();
}

/**
 * Finds the name of an elevator by its `elevatorId`, reading from JSON. 
 * @param {Number} elevatorId 
 * @returns {String} name of the elevator, or `"New Elevator"` if undefined
 */
export function getElevatorName(elevatorId) {
    const elevator = getElevatorById(elevatorId);
    return elevator === undefined ? "New Elevator" : elevator.name;
}

/**
 * Sets the name of an elevator.
 * @param {Number} elevatorId 
 * @param {String} newName 
 * @returns {void}
 */
function setElevatorName(elevatorId, newName) {
    getElevatorById(elevatorId).name = newName;
    save();
}

/**
 * Returns the elevator object of the given ID.
 * @param {number} targetId 
 * @returns {object}
 */
function getElevatorById(targetId) {
    const elevators = elevatorData.elevators;
    const elevatorObject = elevators.find(elevator => elevator.id === targetId);
    return elevatorObject;
}

/**
 * Get the y-level of a floor.
 * @param {Number} elevatorId 
 * @param {Number} floorIndex 
 * @returns {Number}
 */
function getFloorLevel(elevatorId, floorIndex) {
    const elevator = getElevatorById(elevatorId);
    const level = elevator?.floors?.[floorIndex]?.level; 
    
    return level ?? "";
    //console.warn(`${JSON.stringify(elevator)}, ${JSON.stringify(elevator.floors)}`);
    //return elevator === undefined ? "" : (elevator.floors === undefined ? "" : elevator.floors[floorIndex].level);
}

function setFloorLevel(elevatorId, floorIndex, newLevel) {
    const elevator = getElevatorById(elevatorId);
    if (!elevator) return console.error(`SetFloorLevel: Elevator ID ${elevatorId} not found.`);
    
    const floor = elevator.floors[floorIndex];
    if (!floor) return console.error(`SetFloorLevel: Floor index ${floorIndex} out of bounds.`);
    
    floor.level = newLevel;
    save();
}

/**
 * Adds a new, uninitialized floor object to an elevator's floor list.
 * @param {Number} elevatorId The ID of the elevator to modify.
 * @returns {Number | undefined} The index of the newly created floor, or undefined on failure.
 */
function newFloor(elevatorId) {
    const elevator = getElevatorById(elevatorId);

    if (!elevator) {
        console.error(`NewFloor failed: Elevator ID ${elevatorId} not found.`);
        return undefined;
    }

    // 1. Define the structure for the new floor (must match your JSON schema)
    const floorTemplate = {
        name: "New Floor",
        level: 0 // Default Y level
    };

    // 2. Push the new object onto the floors array
    elevator.floors.push(floorTemplate);

    // 3. Save the entire elevator data structure
    save();

    // 4. Return the index of the newly added floor
    return elevator.floors.length - 1; 
}

function getElevatorSpeed(elevatorId) {
    const elevator = getElevatorById(elevatorId);
    return elevator === undefined ? 2 : elevator.speed;
}

function setElevatorSpeed(elevatorId, newSpeed) {
    getElevatorById(elevatorId).speed = newSpeed;
    save();
}

/**
 * Returns an index to the texture in `elevatorTextures`
 * @param {number} elevatorId 
 * @returns {number}
 */
function getElevatorTexture(elevatorId) {
    const elevator = getElevatorById(elevatorId);
    return elevator === undefined ? 0 : elevatorTextures.indexOf(elevator.texture);
}

function setElevatorTexture(elevatorId, newTextureIndex) {
    getElevatorById(elevatorId).texture = elevatorTextures[newTextureIndex];
    save();
}

/**
 * Pushes a new elevator to the bottom of the list.
 * @param {String} elevatorName 
 * @returns {Number} ID of the new elevator
 */
function newElevator(elevatorName) {
    const newId = findHighestId() + 1;
    const newElevator = {...newElevatorData};
    newElevator.id = newId;
    newElevator.name = elevatorName;
    elevatorData.elevators.push(newElevator);
    save();
    return newId;
}

/**
 * Deletes an elevator from the list using its index.
 * @param {Number} index 
 */
function deleteElevator(index) {
    const indexToDelete = elevatorData.elevators.findIndex(e => e.id === index);
    elevatorData.elevators.splice(indexToDelete, 1);
    save();
}

/**
 * Deletes a floor from the list using its index.
 * @param {number} elevatorId 
 * @param {number} index 
 */
function deleteFloor(elevatorId, floorIndex) {
    getElevatorById(elevatorId).floors.splice(floorIndex, 1);
    save();
}

/**
 * Returns Boolean value stored inside a dynamic property. The DP must be of `"true"`, `"false"`, or `undefined`.
 * @param {string} property ID of the dynamic property
 * @returns {boolean}
 */
function isPropertyTrue(name) {
    const property = world.getDynamicProperty(name);
    return property === undefined ? false : JSON.parse(property);
}

/**
 * @param {number} selection The 0-indexed menu selection number.
 * @param {number} actionNumber The calling action (1 or 3) to offset button count.
 * @returns {number | undefined} The unique ID of the selected elevator, or undefined if special button was pressed.
 */
export function getElevatorIdFromSelection(selection, actionNumber) {
    // 1. Calculate the starting index of the elevator buttons
    let elevatorButtonOffset = 0;
    if (actionNumber === 1) elevatorButtonOffset += 1; // "Create New" button
    if (actionNumber === 3) elevatorButtonOffset += 1; // "Unbind Wrench" button

    // 2. Check if the selection was a special button
    if (selection < elevatorButtonOffset) {
        return undefined; // Indicates a special button was pressed
    }
    
    // 3. Get the correct index into the elevators array
    const elevatorArrayIndex = selection - elevatorButtonOffset;
    
    // 4. Return the ID from the elevator data array
    const targetElevator = elevatorData.elevators[elevatorArrayIndex];
    
    // If the array index is valid, return the unique ID.
    return targetElevator ? targetElevator.id : undefined;
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
                            .button(`Ok`);
                        errorMenu.show(player).then(response => { permissionSettings(player); });
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
        .toggle(`Only Operators can change Elevator settings`, {defaultValue: isPropertyTrue("honkit26113:elevator_settings_op_only")})
        .toggle(`Only Operators can use Elevators`, {defaultValue: isPropertyTrue("honkit26113:elevator_usage_op_only")})
        .toggle(`Only Operators can use Wrenches to configure Elevator Blocks`, {defaultValue: isPropertyTrue("honkit26113:wrench_usage_op_only")});
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
 * 
 * @param {Player} player 
 * @param {Number} actionNumber 
 * @param {Block} block 
 * 0: select elevator to focus terminal on
 * 1: edit elevator properties (can also choose floor to edit) -- REQUIRES ADD ELEVATOR BUTTON
 * 2: see all floors (for travel) - normal mode
 * 3: focus elevator for wrench
 */
export function showList(player, actionNumber, block) {
const elevators = elevatorData.elevators;
    const listMenu = new ActionFormData().title(`Select an Elevator`);
    
    // Calculate how many special buttons appear BEFORE the list of elevators
    let specialButtonCount = 0; 

    // 1. Handle special buttons (Order matters for indexing!)
    if (actionNumber === 1) { // Create New Elevator
        listMenu.button(`Create New Elevator`, "textures/ui/plus");
        specialButtonCount++;
    }
    if (actionNumber === 3) { // Unbind Wrench
        listMenu.button(`Unbind this Wrench`, "textures/blocks/barrier");
        specialButtonCount++;
    }
    
    // 2. Add elevator buttons
    for (const elevator of elevators) {
        listMenu.button(elevator.name);
    }

    return listMenu.show(player).then(response => {
        if (response.selection === undefined) return;
        
        const selectionIndex = response.selection;

        // 3. Handle Special Button Selection (Index < specialButtonCount)
        if (selectionIndex < specialButtonCount) {
            // Check based on the actionNumber and index.
            if (actionNumber === 1 && selectionIndex === 0) {
                // User pressed "Create New Elevator" (which is always index 0 here)
                const newId = newElevator("New Elevator");
                openFloorsList(player, newId, block, 1);
                return;
            }
            if (actionNumber === 3 && selectionIndex === (actionNumber === 1 ? 1 : 0)) {
                // User pressed "Unbind this Wrench"
                return 0; // Return 0 for unbind
            }
            // Add other special button logic here if needed
            return;
        }

        // 4. Handle Elevator Selection (Index >= specialButtonCount)
        
        // Calculate the actual index in the elevatorData.elevators array:
        const elevatorArrayIndex = selectionIndex - specialButtonCount;
        
        // Retrieve the selected elevator object
        const selectedElevator = elevators[elevatorArrayIndex];
        
        if (!selectedElevator) {
            world.sendMessage("Error: Selected elevator not found in data.");
            return;
        }
        
        // 5. Use the guaranteed valid Unique ID
        const selectedId = selectedElevator.id;

        switch (actionNumber) {
            case 0: // Terminal Bind
                world.setDynamicProperty(`honkit26113:terminal${JSON.stringify(block.location)}`, selectedId);
                sendActionOutput(player, `Terminal bound to ${getElevatorName(selectedId)}`);
                break;
            case 1: // Edit Elevator Properties (Existing)
                openFloorsList(player, selectedId, block, 1);
                break;
            case 2: // Travel Mode
                openFloorsList(player, selectedId, block, 0);
                break;
            case 3: // Wrench Bind (Bind to ID)
                return selectedId;
            default:
                break;
        }
    });
}

export function openFloorsList(player, elevatorId, block, actionNumber) {
    const elevator = getElevatorById(elevatorId);
    const submenu = new ActionFormData();
    submenu.title(`Select Floor for ${elevatorId}: ${getElevatorName(elevatorId)}`);

    // Open Admin Panel button
    if (actionNumber === 2) {
        submenu.button(`Open Admin Panel`, "textures/ui/permissions_op_crown");
    }
    // Edit Elevator Properties button
    if (actionNumber === 1) {
        submenu.button(`Edit Elevator Properties`, "textures/ui/editIcon");
    }
    // Floor selection buttons
    if (elevator) {
        for (let i = 0; i <= elevator.floors.length - 1; i++) {
            submenu.button(`${getFloorName(elevatorId, i)}`);
        }
    }
    // New Floor button
    if (actionNumber === 1 || elevator === undefined) {
        submenu.button("New Floor", "textures/ui/plus");
    }

    submenu.show(player).then(
        async (response) => {
            if (response.selection === undefined) return;

            // The index of the first floor button (always 1 in this structure)
            const FIRST_FLOOR_BUTTON_OFFSET = 1;
            
            // Get the current number of floors for logic checks
            const elevator = getElevatorById(elevatorId);
            const floorCount = elevator?.floors?.length ?? 0;
            
            // The index of the 'New Floor' button is the offset + current floor count.
            const newFloorButtonIndex = FIRST_FLOOR_BUTTON_OFFSET + floorCount;
            
            // CRITICAL FIX: Convert the 1-based button index to the 0-based array index
            const selectedFloorIndex = response.selection - FIRST_FLOOR_BUTTON_OFFSET;

            if (actionNumber === 1) {
                if (response.selection === 0) {
                    // Case 1: Selected 'Edit Elevator Properties'
                    editElevatorProperties(player, elevatorId);
                    return;
                } 
                
                if (response.selection === newFloorButtonIndex) {
                    // Case 2: Selected 'New Floor' (The last button)
                    
                    // 1. Create the new floor and get its newly assigned index
                    const newFloorIndex = newFloor(elevatorId); 
                    
                    // 2. Open the details panel for the new floor using the correct index
                    if (newFloorIndex !== undefined) {
                        editFloorProperties(player, elevatorId, newFloorIndex, block);
                    }
                    return;
                }
                
                // Case 3: Selected an existing floor (Button index is 1 or greater)
                
                // Open details for the existing floor
                editFloorProperties(player, elevatorId, selectedFloorIndex, block);
            } else {
                if (response.selection == 0) {
                    if (player.playerPermissionLevel === PlayerPermissionLevel.Operator || !isPropertyTrue("honkit26113:elevator_settings_op_only")) {
                        openInitMenu(player, block);
                    } else {
                        await noPermsErrorMenu(player);
                    }
                } else {
                    world.sendMessage(`Button no. ${response.selection}`)
                    
                    if (isPropertyTrue("honkit26113:elevator_usage_op_only") && player.playerPermissionLevel !== PlayerPermissionLevel.Operator) {
                        await noPermsErrorMenu(player);
                    } else {
                        const destLevel = getFloorLevel(elevatorId, selectedFloorIndex) ?? 0;

                        // Move elevator to destination floor
                        move_elevator(destLevel, block, elevatorId);
                        sendActionOutput(player, `Sent elevator to floor ${getFloorName(elevatorId, selectedFloorIndex)}`);
                    }
                }
            }
        }
    )
}

// ADMIN ONLY
function editFloorProperties(player, elevatorId, floor, block) {
    const floor_details = new ModalFormData()
        .title(`${getFloorName(elevatorId, floor)} Properties`)
        .textField('Floor Name', '', {defaultValue: `${getFloorName(elevatorId, floor)}`})
        .textField('Floor Y Level', 'Integers Only', {defaultValue: `${getFloorLevel(elevatorId, floor)}`})
        .toggle('Send the elevator here', {defaultValue: true})
        .toggle(`Delete this floor. §cThis action cannot be undone!§r`, {defaultValue: false});
    floor_details.show(player).then(
        (floor_response) => {
            if (floor_response.formValues === undefined) return;
            if (floor_response.formValues[3] === true) {
                deleteFloor(elevatorId, floor);
                sendActionOutput(player, `Changes saved`);
                return;
            }
            setFloorName(elevatorId, floor, floor_response.formValues[0]);
            setFloorLevel(elevatorId, floor, Number(floor_response.formValues[1]));

            world.sendMessage(`y level ${getFloorLevel(elevatorId, floor)}, floor no. ${floor}`);
            world.sendMessage(`name ${getFloorName(elevatorId, floor)}`);
            world.sendMessage(`name list ${JSON.stringify(getElevatorById(elevatorId).floors)}`);

            let destLevel = getFloorLevel(elevatorId, floor);
            let destination_level = 0;
            if (floor_response.formValues[2] === true) {
                if (getFloorLevel(elevatorId, floor) === undefined) {
                    world.sendMessage(`Floor Y Level cannot be empty`)
                    return;
                }
                destLevel = getFloorLevel(elevatorId, floor);
                move_elevator(destLevel, block, elevatorId);
                sendActionOutput(player, `Sent elevator to floor ${getFloorName(elevatorId, floor)} at ${getFloorLevel(elevatorId, floor)}`)
            } else {
                sendActionOutput(player, `Changes saved`);
            }
        }
    )
}

const elevatorTextures = [
    "iron_block",
    "smooth_stone",
    "cobblestone",
    "oak_planks",
    "spruce_planks",
    "birch_planks",
    "grass_block",
    "sand"
]

// ADMIN ONLY
function editElevatorProperties(player, elevatorId) {
    const thisElevatorName = getElevatorName(elevatorId);
    const thisElevatorSpeed = getElevatorSpeed(elevatorId);
    const thisElevatorTexture = getElevatorTexture(elevatorId);
    const elevatorPropertiesPanel = new ModalFormData()
        .title(`Edit ${thisElevatorName}`)
        .textField('Elevator Name', '', {defaultValue: thisElevatorName})
        .slider('Elevator Speed', 1, 3, {defaultValue: thisElevatorSpeed, tooltip: 'Speed multiplier for the elevator. Default is 2.', valueStep: 1})
        .dropdown('Elevator Block Texture', elevatorTextures, {defaultValueIndex: thisElevatorTexture, tooltip: 'Texture for Elevator Blocks that are bound to this Elevator. For changes to apply, use a Wrench to bind Elevator Blocks again.'})
        .toggle(`Delete this elevator. §cThis action cannot be undone!§r`, {defaultValue: false});
    elevatorPropertiesPanel.show(player).then(
        (response) => {
            if (response?.formValues === undefined) return;
            setElevatorName(elevatorId, response.formValues[0]);
            setElevatorSpeed(elevatorId, response.formValues[1]);
            setElevatorTexture(elevatorId, response.formValues[2]);
            if (response.formValues[3] === true) {
                deleteElevator(elevatorId);
            }
            sendActionOutput(player, `Changes saved`);
        }
    )
    return elevatorPropertiesPanel;
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
        
        system.runJob(move(e, destinationLevel, elevatorToMove));
    }
}


function* move(entity, destLevel, elevatorId) {
    const THIS_ELEVATOR_SPEED = getElevatorSpeed(elevatorId);
    const destLevelAdjusted = Math.round(destLevel);
    let last_executed_tick = system.currentTick;
    while (true) {
        if (system.currentTick - last_executed_tick >= 1) {
            last_executed_tick = system.currentTick;
            if (destLevelAdjusted > entity.location.y) {
                entity.teleport({ x: entity.location.x, y: entity.location.y+(0.1 * THIS_ELEVATOR_SPEED / 2), z: entity.location.z })
            } else {
                entity.teleport({ x: entity.location.x, y: entity.location.y-(0.1 * THIS_ELEVATOR_SPEED / 2), z: entity.location.z })
            }
            if (Math.abs(entity.location.y - destLevelAdjusted) < (0.1 * THIS_ELEVATOR_SPEED / 2)) {
                const find_passengers = entity.dimension.getEntities({
                    type: "minecraft:player",
                    location: entity.location,
                    maxDistance: 3
                })
                for (const p of find_passengers) {
                    p.playSound("honkit26113.elevator_arrive")
                }
                entity.teleport({x: entity.location.x, y: destLevel, z: entity.location.z});
                return 0;
            }
        }
        yield;
    }
}