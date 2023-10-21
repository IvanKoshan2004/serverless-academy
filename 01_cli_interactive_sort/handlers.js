const floatRegEx = /^[0-9]+\.?[0-9]+$/; // regex matches floats and integers

function compareStringsAlphabetically(a, b) {
    const minLength = Math.min(a.length, b.length);
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    // compare in the same case
    for (let i = 0; i < minLength; i++) {
        if (aLower[i] == bLower[i]) {
            continue;
        }
        return aLower.charCodeAt(i) - bLower.charCodeAt(i);
    }
    // give priority to uppercase if letters match
    for (let i = 0; i < minLength; i++) {
        if (a[i] == b[i]) {
            continue;
        }
        return a.charCodeAt(i) - b.charCodeAt(i);
    }
    // sort by length if all letters match
    return a.length - b.length;
}

export const handlers = [
    {
        description: "Sort words alphabetically",
        handler: (wordsAndNumbers) =>
            wordsAndNumbers
                .filter((el) => !floatRegEx.test(el))
                .sort(compareStringsAlphabetically),
    },
    {
        description: "Show numbers from lesser to greater",
        handler: (wordsAndNumbers) =>
            wordsAndNumbers
                .filter((el) => floatRegEx.test(el))
                .map((el) => parseFloat(el))
                .sort((a, b) => a - b),
    },
    {
        description: "Show numbers from bigger to smaller",
        handler: (wordsAndNumbers) =>
            wordsAndNumbers
                .filter((el) => floatRegEx.test(el))
                .map((el) => parseFloat(el))
                .sort((a, b) => b - a),
    },
    {
        description:
            "Display words in ascending order by number of letters in the word",
        handler: (wordsAndNumbers) =>
            wordsAndNumbers
                .filter((el) => !floatRegEx.test(el))
                .sort((a, b) => a.length - b.length),
    },
    {
        description: "Show only unique words",
        handler: (wordsAndNumbers) => [
            ...new Set(wordsAndNumbers.filter((el) => !floatRegEx.test(el))),
        ],
    },
    {
        description: "Show only unique words and numbers",
        handler: (wordsAndNumbers) => [...new Set(wordsAndNumbers)],
    },
];
