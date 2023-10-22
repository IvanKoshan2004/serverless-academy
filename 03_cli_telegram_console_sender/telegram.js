import TelegramBot from "node-telegram-bot-api";

export async function getBotLink(botToken) {
    const bot = new TelegramBot(botToken);
    const botData = await bot.getMe();
    return `https://t.me/${botData.username}`;
}

export function waitForUserStart(botToken) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject("timeout"), 60000);
        try {
            const bot = new TelegramBot(botToken, {
                polling: true,
            });
            const botStartStamp = Date.now();
            bot.on("message", async (message) => {
                // Checking if the message is sent during this session
                if (Date.now() - botStartStamp < 1000) {
                    return;
                }
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

export function sendMessage(userId, message, botToken) {
    const bot = new TelegramBot(botToken);
    return bot.sendMessage(userId, message);
}

export function sendPhoto(userId, readStream, botToken) {
    process.env.NTBA_FIX_350 = true; // deprecation message fix
    const bot = new TelegramBot(botToken);
    return bot.sendPhoto(userId, readStream);
}
