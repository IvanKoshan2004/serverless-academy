import TelegramBot from "node-telegram-bot-api";
import { config } from "./config.js";
import { generateKeyboard } from "./helpers.js";
import { MonobankExchangeService } from "./monobank-exchange-service.js";
import { PrivatBankExchangeService } from "./privatbank-exchange-service.js";

const bot = new TelegramBot(config.botToken, { polling: true });
const monobankExchangeService = new MonobankExchangeService(
    config.monobankApiKey
);
const privatBankExchangeService = new PrivatBankExchangeService();

const CURRENCY_BUTTONS = [
    {
        name: "USD",
        row: 0,
        pos: 0,
        handler: function (chatId) {
            sendCurrencyExchangeRate(chatId, this.name);
        },
    },
    {
        name: "EUR",
        row: 0,
        pos: 1,
        handler: function (chatId) {
            sendCurrencyExchangeRate(chatId, this.name);
        },
    },
];
const MENU_BUTTONS = [
    {
        name: "Exchange Rates",
        row: 0,
        col: 0,
        handler: function (chatId) {
            promptCurrency(chatId);
        },
    },
];
const COMMANDS = [{ command: "start", description: "starts the bot" }];

bot.setMyCommands(COMMANDS);
bot.on("message", async (message) => {
    if (message.text.startsWith("/start")) {
        promptOption(message.chat.id);
    }
    const pressedMenuButton = MENU_BUTTONS.find(
        (el) => el.name == message.text
    );
    if (pressedMenuButton) {
        pressedMenuButton.handler(message.chat.id);
        return;
    }
    const pressedCurrencyButton = CURRENCY_BUTTONS.find(
        (el) => el.name == message.text
    );
    if (pressedCurrencyButton) {
        pressedCurrencyButton.handler(message.chat.id);
        return;
    }
});
console.log("Bot started");
