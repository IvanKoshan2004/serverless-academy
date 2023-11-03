import TelegramBot from "node-telegram-bot-api";
import { config } from "./config.js";
import axios from "axios";

const bot = new TelegramBot(config.botToken, { polling: true });

const AVAILABLE_INTERVALS = {
    threeHourInterval: {
        name: "3 hours",
    },
    sixHourInterval: {
        name: "6 hours",
    },
};

const AVAILABLE_CITY = {
    name: "Львів, Україна",
    query: "lviv,ua",
};

function promptLocation(chatId) {
    return bot.sendMessage(chatId, "Choose location:", {
        reply_markup: {
            keyboard: [[AVAILABLE_CITY.name]],
            resize_keyboard: true,
        },
    });
}
function promptInterval(chatId) {
    return bot.sendMessage(chatId, "Choose interval:", {
        reply_markup: {
            keyboard: [...AVAILABLE_INTERVALS.map((el) => [el])],
            resize_keyboard: true,
        },
    });
}

function fillChars(obj, count, char = " ") {
    if (char.length != 1) {
        throw Error("Invalid fill char lenght");
    }
    const string = obj.toString();
    if (string.length < count) {
        return char.repeat(count - string.length) + string;
    }
    return string;
}

async function getWeatherForecastData() {
    //API sends data in intervals of 3 hours
    const request = await axios(
        `https://api.openweathermap.org/data/2.5/forecast?q=${AVAILABLE_CITY.query}&appid=${config.openWeatherAPIKey}&units=metric`
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
    return {
        city: { ...city, timezoneUTC },
        dataPoints,
    };
}
function getDayKey(time) {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = fillChars(time.getDate().toString(), 2, "0");
    const dayKey = `${weekDays[time.getDay()]} ${day}`;
    return dayKey;
}
function groupDataPointsByDays(dataPoints) {
    const lines = [];
    const daysEntries = [];
    dataPoints.forEach((el) => {
        const dayKey = getDayKey(el.time);
        if (!daysEntries.find((el) => el.day == dayKey)) {
            daysEntries.push({
                day: dayKey,
                entries: [],
            });
        }
    });
    for (const dataPoint of dataPoints) {
        const time = dataPoint.time;
        const dayKey = getDayKey(time);
        const hour = time.getHours();
        const entry = {
            ...dataPoint,
            hour: hour,
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
    for (const e of entries) {
        lines.push(
            `| ${fillChars(e.hour, 2)} | ${fillChars(e.temp, 6)} | ${fillChars(
                e.wind,
                8
            )} | ${fillChars(e.humidity, 7)} | ${fillChars(
                e.precipitation.chance,
                7
            )} |`
        );
    }
    lines.push(straightLine);
    return lines.join("\n");
}
function filterDataPoints(dataPoints, intervalName) {
    switch (intervalName) {
        case AVAILABLE_INTERVALS.sixHourInterval.name:
            return dataPoints.filter((_, i) => {
                return i % 2 == 0;
            });
        case AVAILABLE_INTERVALS.threeHourInterval.name:
            return dataPoints;
        default:
            throw Error("Invalid interval");
    }
}
async function sendWeatherForecast(chatId, intervalName) {
    try {
        const { city, dataPoints } = await getWeatherForecastData();
        const filteredDataPoints = filterDataPoints(dataPoints, intervalName);
        const dataPointsByDays = groupDataPointsByDays(filteredDataPoints);
        let currentDayKey = getDayKey(new Date());
        const currentDayEntries = dataPointsByDays.find(
            (el) => el.day == currentDayKey
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
        await bot.sendMessage(
            chatId,
            `Country: ${city.country}\nCity: ${city.name}\nTimezone ${city.timezoneUTC}\nShowing forecast with reference to city's timezone`
        );
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
                if (query.data == currentDayKey) {
                    return;
                }
                const currentDayEntries = dataPointsByDays.find(
                    (el) => el.day == query.data
                ).entries;
                currentDayKey = query.data;
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
    if (message.text == AVAILABLE_CITY.name) {
        promptInterval(message.chat.id);
    }
    if (
        Object.values(AVAILABLE_INTERVALS).find((el) => el.name == message.text)
    ) {
        const intervalName = Object.values(AVAILABLE_INTERVALS).find(
            (el) => el.name == message.text
        ).name;
        sendWeatherForecast(message.chat.id, intervalName);
    }
});

console.log(`Bot started`);
