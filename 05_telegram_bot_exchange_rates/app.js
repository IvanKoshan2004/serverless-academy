import TelegramBot from "node-telegram-bot-api";
import { config } from "./config.js";
import axios from "axios";
import { generateKeyboard } from "./helpers.js";
import { ExchangeService } from "./exchange-service.js";

const bot = new TelegramBot(config.botToken, { polling: true });
const exchangeService = new ExchangeService(config.monobankApiKey);

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

async function sendCurrencyExchangeRate(chatId, currency) {
    try {
        const dataMessage = await bot.sendMessage(
            chatId,
            "Looking up the data..."
        );
        const exchangeData = await exchangeService.getExchangeData(
            currency,
            "UAH"
        );
        const responseMessage = `
Pair ${exchangeData.key}

Buy: ${exchangeData.rateBuy} UAH
Sell: ${exchangeData.rateSell} UAH

Last update at ${new Date(exchangeData.date * 1000).toUTCString()}
`;
        return bot.editMessageText(responseMessage, {
            chat_id: chatId,
            message_id: dataMessage.message_id,
            parse_mode: "Markdown",
        });
    } catch (e) {
        console.log(e);
        return bot.sendMessage(chatId, "Bot cannot process your request");
    }
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
        sendCurrencyExchangeRate(message.chat.id, currency.name);
    }
});
console.log("Bot started");
