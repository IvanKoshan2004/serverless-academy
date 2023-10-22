import TelegramBot from "node-telegram-bot-api";

function waitForUserStart(botToken) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject("timeout"), 60000);
        try {
            const bot = new TelegramBot(botToken, {
                polling: true,
            });
            bot.on("text", (message) => {
                if (message.text.startsWith("/start")) {
                    if (message.chat.id == message.from.id) {
                        clearTimeout(timeout);
                        resolve(message.chat.id);
                    }
                }
            });
        } catch (e) {
            clearTimeout(timeout);
            reject("error");
        }
    });
}

async function sendMessage(userId, message, botToken) {
    try {
        const bot = new TelegramBot(botToken);
        return await bot.sendMessage(userId, message);
    } catch (err) {
        console.log(err);
    }
}

async function sendPhoto(userId, readStream, botToken) {
    try {
        const bot = new TelegramBot(botToken);
        return await bot.sendPhoto(userId, readStream);
    } catch (err) {
        console.log(err);
    }
}
