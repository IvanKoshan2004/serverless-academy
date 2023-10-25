import { readFileSync } from "fs";
// files out{i}.txt should be present in the script folder

function timeIt(func) {
    const startTime = Date.now();
    const res = func();
    const endTime = Date.now();
    console.log(
        `Tested '${func.name}' function. Took ${
            endTime - startTime
        } ms to execute.`
    );
    return res;
}

function uniqueValues() {
    const set = new Set();
    for (let i = 0; i < 20; i++) {
        const fileContent = readFileSync(`./out${i}.txt`, "utf-8");
        const array = fileContent.split("\n");
        for (let j = 0; j < array.length; j++) {
            set.add(array[j]);
        }
    }
    return set.size;
}
function existInAllFiles() {
    const map = new Map();
    for (let i = 0; i < 20; i++) {
        const fileContent = readFileSync(`./out${i}.txt`, "utf-8");
        const array = fileContent.split("\n");
        for (let j = 0; j < array.length; j++) {
            let currCount = map.get(array[j]);
            currCount = currCount === undefined ? 0 : currCount;
            map.set(array[j], currCount + 1);
        }
    }
    let count = 0;
    map.forEach((el) => {
        count += el == 20 ? 1 : 0;
    });
    return count;
}
function existInAtleastTen() {
    const map = new Map();
    for (let i = 0; i < 20; i++) {
        const fileContent = readFileSync(`./out${i}.txt`, "utf-8");
        const array = fileContent.split("\n");
        for (let j = 0; j < array.length; j++) {
            let curr = map.get(array[j]);
            curr = curr === undefined ? 0 : curr;
            map.set(array[j], curr + 1);
        }
    }
    let count = 0;
    map.forEach((el) => {
        count += el >= 10 ? 1 : 0;
    });
    return count;
}

function main() {
    console.log("Result:", timeIt(uniqueValues));
    console.log("Result:", timeIt(existInAllFiles));
    console.log("Result:", timeIt(existInAtleastTen));
    return "";
}
timeIt(main);
