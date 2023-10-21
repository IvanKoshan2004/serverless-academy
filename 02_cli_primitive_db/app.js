import inquirer from "inquirer";
import { DBStorage } from "./database.js";

const addUserQuestions = [
    {
        type: "input",
        name: "user",
        message: "Enter the user's name. To cancel press ENTER:",
    },
    {
        type: "list",
        name: "gender",
        message: "Choose your gender.",
        choices: ["male", "female"],
        when: (answers) => answers.user != "",
    },
    {
        type: "input",
        name: "age",
        message: "Enter your age.",
        validate: (answer) => {
            const age = parseInt(answer);
            if (isNaN(age)) {
                return "Enter a number.";
            }
            if (age < 0) {
                return "Enter a number above 0 or 0.";
            }
            return true;
        },
        when: (answers) => answers.user != "",
    },
];

const confirmSearchQuestion = {
    type: "confirm",
    name: "perform",
    message: "Would you like to search values in DB.",
};
const searchQuestions = [
    {
        type: "input",
        name: "user",
        message: "Enter user's name you want to find in DB.",
    },
];
async function main() {
    let isRunning = true;
    const db = new DBStorage("user_database");
    while (isRunning) {
        const answers = await inquirer.prompt(addUserQuestions);
        if (answers.user == "") {
            const confirmSearch = await inquirer.prompt(confirmSearchQuestion);
            if (confirmSearch.perform) {
                const objects = await db.readAll();
                console.log(objects);
                const searchOptions = await inquirer.prompt(searchQuestions);
                const searchResults = await db.searchKeyValue(
                    "user",
                    searchOptions.user,
                    { caseSensetive: false, hammingDistance: 1 }
                );
                if (searchResults.length == 0) {
                    console.log("No users found");
                }
                console.log("Found users:");
                console.log(searchResults);
            } else {
                isRunning = false;
            }
            continue;
        }
        await db.write(answers);
    }
}
main();
