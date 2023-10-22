import TelegramBot from "node-telegram-bot-api";
import { config } from "./config.js";
import axios from "axios";

const bot = new TelegramBot(config.botToken, { polling: true });

const availableIntervals = ["3 hours", "6 hours"];

function promptLocation(chatId) {
    return bot.sendMessage(chatId, "Choose location:", {
        reply_markup: {
            keyboard: [["Forecast in Lviv"]],
            resize_keyboard: true,
        },
    });
}
function promptInterval(chatId) {
    return bot.sendMessage(chatId, "Choose interval:", {
        reply_markup: {
            keyboard: [...availableIntervals.map((el) => [el])],
            resize_keyboard: true,
        },
    });
}
async function getWeatherForecastData(interval) {
    //API sends data in intervals of 3 hours
    const request = await axios(
        `https://api.openweathermap.org/data/2.5/forecast?q=lviv,ua&appid=${config.openWeatherAPIKey}&units=metric`
    );
    let { city, list } = request.data;
    let timezoneUTC = (city.timezone / 3600).toFixed(2);
    timezoneUTC = timezoneUTC >= 0 ? "+" : "" + timezoneUTC + " UTC";
    let dataPoints = list.map((el) => ({
        time: new Date(new Date(el.dt_txt).getTime() + city.timezone * 1000),
        temp: el.main.temp,
        wind: el.wind.speed,
        precipitation: {
            chance: el.pop,
            amount: el.rain ? el.rain["3h"] : 0,
        },
        humidity: el.main.humidity,
    }));
    if (interval == "6 hours") {
        dataPoints = dataPoints.filter((_, i) => i % 2 == 0);
    }
    return {
        city: { ...city, timezoneUTC },
        dataPoints,
    };
}
function getDateKey(date) {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let dateDay = date.getDate();
    dateDay = dateDay < 10 ? "0" + date.toString() : dateDay;
    const dateKey = `${weekDays[date.getDay()]} ${dateDay}`;
    return dateKey;
}
function groupDataPointsByDays(dataPoints) {
    const lines = [];
    const daysEntries = [];
    dataPoints.forEach((el) => {
        const day = getDateKey(el.time);
        if (!daysEntries.find((el) => el.day == day)) {
            daysEntries.push({
                day,
                entries: [],
            });
        }
    });
    for (const p of dataPoints) {
        const d = p.time;
        const dayKey = getDateKey(p.time);
        let hour = d.getHours();
        hour = hour < 10 ? "0" + hour.toString() : hour;
        const entry = {
            ...p,
            time: hour,
        };
        daysEntries.find((el) => el.day == dayKey).entries.push(entry);
    }

    return daysEntries;
}
function formatDayEntriesIntoTable(entries) {
    //formatting is hard
    const top = `|Hour|   Temp | Wind m/s | Humid % | Prec. % |`;
    const straightLine = "-".repeat(top.length);
    const lines = [straightLine, top, straightLine];
    function fillSpaces(obj, count) {
        const string = obj.toString();
        if (string.length < count) {
            return " ".repeat(count - string.length) + string;
        }
        return string;
    }
    for (const e of entries) {
        lines.push(
            `| ${fillSpaces(e.time, 2)} | ${fillSpaces(
                e.temp,
                6
            )} | ${fillSpaces(e.wind, 8)} | ${fillSpaces(
                e.humidity,
                7
            )} | ${fillSpaces(e.precipitation.chance, 7)} |`
        );
    }
    lines.push(straightLine);
    return lines.join("\n");
}
async function sendWeatherForecast(chatId, interval) {
    try {
        const { city, dataPoints } = await getWeatherForecastData(interval);
        await bot.sendMessage(
            chatId,
            `Country: ${city.country}\nCity: ${city.name}\nTimezone ${city.timezoneUTC}\nShowing forecast with reference to city's timezone`
        );
        const dataPointsByDays = groupDataPointsByDays(dataPoints);
        let currentDay = getDateKey(new Date());
        const currentDayEntries = dataPointsByDays.find(
            (el) => el.day == currentDay
        ).entries;
        const text = formatDayEntriesIntoTable(currentDayEntries);
        const replyMarkUp = {
            inline_keyboard: [
                dataPointsByDays.map((el) => ({
                    text: el.day,
                    callback_data: el.day,
                })),
            ],
        };
        const forecastMessage = await bot.sendMessage(
            chatId,
            "<pre>" + text + "</pre>",
            {
                parse_mode: "HTML",
                reply_markup: replyMarkUp,
            }
        );
        bot.addListener("callback_query", (query) => {
            if (forecastMessage.message_id == query.message.message_id) {
                if (query.data == currentDay) {
                    return;
                }
                const currentDayEntries = dataPointsByDays.find(
                    (el) => el.day == query.data
                ).entries;
                currentDay = query.data;
                const text = formatDayEntriesIntoTable(currentDayEntries);
                return bot.editMessageText("<pre>" + text + "</pre>", {
                    chat_id: forecastMessage.chat.id,
                    message_id: forecastMessage.message_id,
                    parse_mode: "HTML",
                    reply_markup: replyMarkUp,
                });
            }
        });
    } catch (e) {
        bot.sendMessage(
            chatId,
            "Sorry but the bot can not process your request right now."
        );
        console.log(e);
    }
}

bot.setMyCommands([{ command: "start", description: "starts the bot" }]);
bot.on("message", async (message) => {
    if (message.text.startsWith("/start")) {
        promptLocation(message.chat.id);
    }
    if (message.text == "Forecast in Lviv") {
        promptInterval(message.chat.id);
    }
    if (availableIntervals.find((el) => el == message.text)) {
        const interval = availableIntervals.find((el) => el == message.text);
        sendWeatherForecast(message.chat.id, interval);
    }
});

console.log(`Bot started`);
