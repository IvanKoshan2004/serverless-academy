import { createInterface } from "readline";
import { LIST_HANDLERS } from "./handlers.js";
const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
});

function getInput(prompt) {
    return new Promise((resolve, reject) => {
        try {
            readline.question(prompt, (answer) => {
                resolve(answer);
            });
        } catch (e) {
            reject(e);
        }
    });
}

async function getUserWordsAndNumbers() {
    const userInput = await getInput(
        "Hello. Enter 10 words or numbers dividing them with a space: "
    );
    // For testing
    // const defaultSet =
    //     "austine hewllo hillan hi jello Diana Diana 120 49 3000 31 31   310 310  HI 1.56  3.10";
    // if (userInput == "") {
    //     const wordsAndNumbers = defaultSet.split(" ").filter((el) => el !== "");
    //     return wordsAndNumbers;
    // }
    const wordsAndNumbers = userInput.split(" ").filter((el) => el !== "");
    return wordsAndNumbers;
}
const EXIT_COMMAND = "exit";

function printMenuOptions(handlers) {
    handlers.forEach((handler) =>
        console.log(`${handler.command}. ${handler.description}`)
    );
    console.log(`${EXIT_COMMAND}. Exit the program`);
}

async function main() {
    while (true) {
        printMenuOptions(LIST_HANDLERS);
        const wordsAndNumbersList = await getUserWordsAndNumbers();
        const command = await getInput(
            `Select command number and press ENTER: `
        );
        const selectedListHandler = LIST_HANDLERS.find(
            (handler) => handler.command == command
        );
        if (selectedListHandler) {
            const result = selectedListHandler(wordsAndNumbersList);
            console.log(result);
            continue;
        }
        if (command == EXIT_COMMAND) {
            readline.close();
            break;
        }
        console.log("Invalid command");
    }
}

main();
