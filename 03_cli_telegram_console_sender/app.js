import { program } from "commander";
import { createReadStream, readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
import {
    getBotLink,
    sendMessage,
    sendPhoto,
    waitForUserStart,
} from "./telegram.js";
const require = createRequire(import.meta.url);
const packageInfo = require("./package.json");
const BOT_TOKEN_FILE_NAME = "bot_token.txt";
const USER_ID_FILE_NAME = "user_id.txt";
const botTokenPath = new URL(`./${BOT_TOKEN_FILE_NAME}`, import.meta.url);
const userIdPath = new URL(`./${USER_ID_FILE_NAME}`, import.meta.url);

async function readConfig() {
    let botToken, userId;
    try {
        botToken = readFileSync(botTokenPath, "utf-8");
    } catch (e) {
        writeFileSync(botTokenPath, "");
    }
    if (!botToken) {
        console.log(
            `Bot token is not installed.\nPlease paste your bot token into file ${BOT_TOKEN_FILE_NAME} that was generated in the folder`
        );
        process.exit(1);
    }
    try {
        userId = parseInt(readFileSync(userIdPath, "utf-8"));
    } catch (e) {
        writeFileSync(userIdPath, "");
        userId = null;
    }
    return [botToken, userId];
}

async function startAction() {
    const [botToken, userId] = await readConfig();
    let link;
    try {
        link = await getBotLink(botToken);
    } catch (e) {
        console.log(
            "Can't access the bot. Check if the bot token is valid, and retry"
        );
        process.exit(1);
    }
    console.log(
        `Configure the bot by sending \x1b[34m/start\x1b[0m message to bot at this link \x1b[34m${link}\x1b[0m\nProgram will stop in 1 minute if no action is done or sooner if error occurs`
    );
    try {
        const userId = await waitForUserStart(botToken);
        writeFileSync(userIdPath, userId.toString());
        console.log(
            `Sucessfully registered the user with id ${userId}.\nYou can now use the app`
        );
        process.exit(0);
    } catch (e) {
        if (e == "timeout") {
            console.log("No action done. Process exit");
            process.exit(1);
        }
        console.log("Error has happened. ", e);
        process.exit(1);
    }
}
async function sendMessageAction(message) {
    const [botToken, userId] = await readConfig();
    if (!userId) {
        console.log(
            "User id is not yet installed. Please run start command first"
        );
    }
    try {
        await sendMessage(userId, message, botToken);
        console.log("Message sent");
    } catch (e) {
        console.log(
            "Can't access the bot. Check if the bot token is valid, and retry"
        );
        process.exit(1);
    }
}
async function sendPhotoAction(photoPath) {
    const [botToken, userId] = await readConfig();
    if (!userId) {
        console.log(
            "User id is not yet installed. Please run start command first"
        );
    }
    let rs;
    try {
        rs = createReadStream(photoPath);
    } catch (e) {
        console.log("Can't open the photo");
    }
    try {
        console.log("Photo is sending");
        await sendPhoto(userId, rs, botToken);
        console.log("Photo sent");
    } catch (e) {
        console.log(
            "Can't access the bot. Check if the bot token is valid, and retry"
        );
        process.exit(1);
    }
}

async function main() {
    program
        .version(packageInfo.version, "-v, --version")
        .name("telegram-console-sender")
        .description(
            "CLI tool for saving messages and photos through Telegram bot"
        );
    program.command("start").description(`Start the bot.`).action(startAction);
    program
        .command("send-message")
        .description("Send message to telegram bot")
        .alias("m")
        .argument("<message>", "Message to send")
        .action(sendMessageAction);

    program
        .command("send-photo")
        .description(
            "Send photo to telegram bot. Just drag and drop it after writing the command"
        )
        .alias("p")
        .argument("<path>", "Path to photo")
        .action(sendPhotoAction);

    program.parse();
}
main();
