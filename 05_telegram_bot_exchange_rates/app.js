import TelegramBot from "node-telegram-bot-api";
import { config } from "./config.js";
import axios from "axios";
import { generateKeyboard } from "./helpers.js";

const bot = new TelegramBot(config.botToken, { polling: true });
const currencyButtons = [
    { name: "USD", row: 0, pos: 0 },
    { name: "EUR", row: 0, pos: 1 },
];

function promptOption(chatId) {
    return bot.sendMessage(chatId, "Choose option:", {
        reply_markup: {
            keyboard: [["Exchange Rates"]],
            resize_keyboard: true,
        },
    });
}

function promptCurrency(chatId) {
    return bot.sendMessage(chatId, "Choose currency:", {
        reply_markup: {
            keyboard: generateKeyboard(currencyButtons),
            resize_keyboard: true,
        },
    });
}

function sendCurrencyExchangeRate(chatId, currency) {
    //To do
    return bot.sendMessage(chatId, "To do");
}

bot.setMyCommands([{ command: "start", description: "starts the bot" }]);
bot.on("message", async (message) => {
    if (message.text.startsWith("/start")) {
        promptOption(message.chat.id);
    }
    if (message.text == "Exchange Rates") {
        promptCurrency(message.chat.id);
    }
    if (currencyButtons.find((el) => el.name == message.text)) {
        const currency = currencyButtons.find((el) => el.name == message.text);
        sendCurrencyExchangeRate(message.chat.id, currency);
    }
});
