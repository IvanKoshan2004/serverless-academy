import express from "express";

const app = express();
app.set("trust proxy", true);

const PORT = process.env.PORT || 3000;
app.get("", (req, res) => {
    const userIp = req.ip;
    const userCountry = "country";
    const ipRangeStart = "0.0.0.0";
    const ipRangeEnd = "255.255.255.255";

    res.status(200);
    res.send(
        `Hello, your ip is ${userIp}, you live in ${userCountry}.\nIp range: ${ipRangeStart} - ${ipRangeEnd}`
    );
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
