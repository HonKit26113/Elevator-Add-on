import { ActionFormData } from "@minecraft/server-ui";
const articleMap = [];
export function showHelpMenu(player) {
    const errorMenu = new ActionFormData()
        .title(`Help`);
    for (const section of guidebookData) {
        errorMenu.label(section.title);
        for (const article of section.content) {
            errorMenu.button(article.name);
            articleMap.push(article);
        }
        errorMenu.divider();
    }
    errorMenu.show(player).then(response => {
        if (response.canceled || response.selection === undefined)
            return;
        showArticle(player, articleMap[response.selection]);
    });
}
function showArticle(player, article) {
    const articleMenu = new ActionFormData()
        .title(article.name)
        .body(article.body)
        .button("Back", "textures/ui/book_arrowleft_default");
    articleMenu.show(player).then(() => { showHelpMenu(player); });
}
const NUMBER_1_ICON = ""; // 0xF500
const NUMBER_2_ICON = ""; // 0xF501
const NUMBER_3_ICON = ""; // 0xF502
const NUMBER_4_ICON = ""; // 0xF503
const guidebookData = [
    {
        "title": "Step 1: Configuring an Elevator",
        "content": [
            {
                "name": "Create an Elevator",
                "body": `${NUMBER_1_ICON} Select §6Add/Edit Elevators§r.\n${NUMBER_2_ICON} Select §6Create New Elevator§r.\n${NUMBER_3_ICON} Select §6Edit Elevator Properties§r. Change the name, speed and texture of your elevator.`
            },
            {
                "name": "Add Floors",
                "body": `${NUMBER_1_ICON} Select §6Add/Edit Elevators§r.\n${NUMBER_2_ICON} Select the elevator that you just created.\n${NUMBER_3_ICON} Select §6New Floor§r. Input the name and Y-level of your floor.\n${NUMBER_4_ICON} Repeat Steps ${NUMBER_1_ICON}-${NUMBER_3_ICON} for each floor you have to create.`
            }
        ]
    },
    {
        "title": "Step 2: Setting up Hardware",
        "content": [
            {
                "name": "Place Elevator Platforms",
                "body": `${NUMBER_1_ICON} In your elevator shaft, choose any Y-level.\n${NUMBER_2_ICON} Fill that Y-level with §6Elevator Platform§r blocks.\nMade a mistake? While holding a §6Wrench§r, §6Sneak§r and use §6Attack§r on that Elevator Platform block to remove it.`
            },
            {
                "name": "Link Terminal to Platforms",
                "body": `${NUMBER_1_ICON} Obtain a §6Wrench§r.\n${NUMBER_2_ICON} While holding the Wrench, §6Use§r the item (right click).\n${NUMBER_3_ICON} A list of elevators should appear. Choose the one you are setting up.\n${NUMBER_4_ICON} While holding the Wrench, use §6Attack§r (left click) on Elevator Platform blocks to bind them to the elevator you selected.`
            },
            {
                "name": "Bind Terminal to Elevator",
                "body": `§6Binding§r is saving a target Elevator for a Terminal. After binding, interacting with that terminal will directly display the list of floors of that elevator.\n\n${NUMBER_1_ICON} Interact with an Elevator Terminal you placed for an Elevator you are currently setting up.\n${NUMBER_2_ICON} Select §6Set Up this Terminal§r, then select the Elevator you wish to bind the Terminal to.\n${NUMBER_3_ICON} Repeat steps ${NUMBER_1_ICON}-${NUMBER_2_ICON} for each Terminal.`
            }
        ]
    },
    {
        "title": "Personalization",
        "content": [
            {
                "name": "Change Platform Texture",
                "body": `${NUMBER_1_ICON} Select §6Add/Edit Elevators§r.\n${NUMBER_2_ICON} Select the elevator to change textures for.\n${NUMBER_3_ICON} Select §6Edit Elevator Properties§r. Change the speed and click §6Submit§r.\n${NUMBER_4_ICON} Bind a Wrench to the elevator, and use §6Attack§r (left click) on the elevator platforms to apply the texture change.`
            },
            {
                "name": "Edit Elevator Settings",
                "body": `${NUMBER_1_ICON} Select §6Add/Edit Elevators§r.\n${NUMBER_2_ICON} Select the elevator to change textures for.\n${NUMBER_3_ICON} Select §6Edit Elevator Properties§r. Change settings and click §6Submit§r.`
            },
            {
                "name": "Edit Permission Settings",
                "body": `${NUMBER_1_ICON} Interact with any Terminal. If the Terminal is bound to an Elevator, select §6Admin Settings§r. \n${NUMBER_2_ICON} Select §6Permission Settings§r. Change the settings as you wish, then click §6Submit§r.`
            }
        ]
    }
];
//# sourceMappingURL=Guidebook.js.map