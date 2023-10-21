import { createInterface } from "readline";
import { handlers } from "./handlers.js";
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

async function getUserWords() {
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

function printMenuOptions(handlers) {
    handlers
        .map((handler) => handler.description)
        .forEach((line, i) => console.log(`${i + 1}. ${line}`));
}

async function main() {
    let isRunning = true;
    while (isRunning) {
        printMenuOptions(handlers);
        const wordsAndNumbers = await getUserWords();
        const command = await getInput(
            `Select (1 - ${handlers.length}) and press ENTER: `
        );
        const handlerIndex = /^[0-9]+$/.test(command)
            ? parseInt(command) - 1
            : -1;
        if (handlerIndex < handlers.length && handlerIndex >= 0) {
            const selectedHandler = handlers[handlerIndex].handler;
            console.log(selectedHandler(wordsAndNumbers));
            continue;
        }
        if (command == "exit") {
            readline.close();
            isRunning = false;
            break;
        }

        console.log("Invalid command");
    }
}

main();
