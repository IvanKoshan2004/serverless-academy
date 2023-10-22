import { program } from "commander";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const packageInfo = require("./package.json");
program
    .version(packageInfo.version, "-v, --version")
    .name("telegram-console-sender")
    .description(
        "CLI tool for saving messages and photos through Telegram bot"
    );

program
    .command("send-message")
    .description("Send message to telegram bot")
    .alias("m")
    .argument("<message>", "Message to send")
    .action((message) => {
        console.log("Your message ", message);
    });

program
    .command("send-photo")
    .description(
        "Send photo to telegram bot. Just drag and drop it after writing the command"
    )
    .alias("p")
    .argument("<path>", "Path to photo")
    .action((photoPath) => {
        console.log("Path to photo", photoPath);
        console.log(options);
    });

program.parse();
