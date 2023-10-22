import { program } from "commander";
import { readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const packageInfo = require("./package.json");
program
    .version(packageInfo.version, "-v, --version")
    .name("telegram-console-sender")
    .description(
        "CLI tool for saving messages and photos through Telegram bot"
    );

async function readConfig() {
    const botTokenPath = new URL(`./bot_token.txt`, import.meta.url);
    const userIdPath = new URL(`./user_id.txt`, import.meta.url);
    let botToken, userId;
    try {
        botToken = readFileSync(botTokenPath, "utf-8");
    } catch (e) {
        writeFileSync(botTokenPath, "");
    }
    if (!botToken) {
        console.log(
            "Bot token is not installed.\nPlease paste your bot token into file bot_token.txt that was generated in the folder"
        );
        process.exit(1);
    }
    try {
        userId = readFileSync(userIdPath, "utf-8");
    } catch (e) {
        writeFileSync(userIdPath, "");
    }
    userId = null;
    return [botToken, userId];
}

async function startAction() {
    const [botToken, userId] = await readConfig();
    console.log(
        "Start the bot using link below.\nProcess will exit in 1 minute if no action is done or if error occurs"
    );
    //To do
}
async function sendMessageAction(message) {
    const [botToken, userId] = await readConfig();
    //To do
}
async function sendPhotoAction(photoPath) {
    const [botToken, userId] = await readConfig();
    //To do
}

async function main() {
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
