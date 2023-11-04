import express from "express";
import { IpLocator } from "./ip-locator.js";

const PORT = process.env.PORT || 3000;
const IP_RANGES_CSV_FILE = "IP2LOCATION-LITE-DB1.CSV"; // should be in project root

const app = express();
const ipLocator = new IpLocator();
const ipRangesCsvPath = new URL(`./${IP_RANGES_CSV_FILE}`, import.meta.url);
await ipLocator.initialize(ipRangesCsvPath);

app.set("trust proxy", true);
app.get("", (req, res) => {
    try {
        const userIp = req.ip;
        const ipData = ipLocator.findIpData(userIp);
        res.status(200);
        res.send(
            `Hello, your ip is ${userIp}, you live in ${ipData.countryName}.\nIp range: ${ipData.rangeStart} - ${ipData.rangeEnd}`
        );
    } catch (e) {
        res.status(500);
        res.send("Sorry we couldn't process your ip :(");
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
