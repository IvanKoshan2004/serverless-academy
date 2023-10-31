import https from "https";
const endpoints = [
    "https://jsonbase.com/sls-team/json-793",
    "https://jsonbase.com/sls-team/json-955",
    "https://jsonbase.com/sls-team/json-231",
    "https://jsonbase.com/sls-team/json-931",
    "https://jsonbase.com/sls-team/json-93",
    "https://jsonbase.com/sls-team/json-342",
    "https://jsonbase.com/sls-team/json-770",
    "https://jsonbase.com/sls-team/json-491",
    "https://jsonbase.com/sls-team/json-281",
    "https://jsonbase.com/sls-team/json-718",
    "https://jsonbase.com/sls-team/json-310",
    "https://jsonbase.com/sls-team/json-806",
    "https://jsonbase.com/sls-team/json-469",
    "https://jsonbase.com/sls-team/json-258",
    "https://jsonbase.com/sls-team/json-516",
    "https://jsonbase.com/sls-team/json-79",
    "https://jsonbase.com/sls-team/json-706",
    "https://jsonbase.com/sls-team/json-521",
    "https://jsonbase.com/sls-team/json-350",
    "https://jsonbase.com/sls-team/json-64",
];

function makeGetRequestWithRetries(endpoint, retryCount = 0) {
    return new Promise((resolve, reject) => {
        https
            .get(endpoint, (res) => {
                const data = [];
                res.on("data", (chunk) => {
                    data.push(chunk);
                });

                res.on("end", () => {
                    resolve(Buffer.concat(data).toString());
                });
            })
            .on("error", (err) => {
                if (retryCount > 0) {
                    // console.log(
                    //     `Request fail, retries left ${retryCount}, retrying`
                    // );
                    resolve(
                        makeGetRequestWithRetries(endpoint, retryCount - 1)
                    );
                } else {
                    reject(err);
                }
            });
    });
}

function findIsDoneProperty(json) {
    if (typeof json["isDone"] == "boolean") {
        return json["isDone"];
    }
    for (const key in json) {
        if (typeof json[key] == "object") {
            const nestedIsDone = findIsDoneProperty(json[key]);
            if (nestedIsDone !== null) {
                return nestedIsDone;
            }
        }
    }
    return null;
}

async function main() {
    let trueCount = 0;
    let falseCount = 0;
    for (const endpoint of endpoints) {
        try {
            const responseBody = await makeGetRequestWithRetries(endpoint, 2);
            const json = JSON.parse(responseBody);
            const isDone = findIsDoneProperty(json);
            trueCount += isDone ? 1 : 0;
            falseCount += !isDone ? 1 : 0;
            console.log(`[SUCCESS] ${endpoint}: isDone: ${isDone}`);
        } catch (e) {
            console.log(`[FAIL] ${endpoint}: The endpoint is unavailable`);
        }
    }
    console.log(`Found True values: ${trueCount},`);
    console.log(`Found False values: ${falseCount}`);
}

main();
