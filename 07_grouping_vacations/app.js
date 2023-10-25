import json from "./data.json" assert { type: "json" };

function formatVacationsJson(vacationsJson) {
    const userMap = new Map();
    for (const vacationWithUser of vacationsJson) {
        const userId = vacationWithUser.user._id;
        const userName = vacationWithUser.user.name;

        const vacation = JSON.parse(JSON.stringify(vacationWithUser));
        delete vacation.user;

        const user = userMap.get(userId);
        if (user === undefined) {
            const userObject = {
                userId: userId,
                userName: userName,
                vacations: [vacation],
            };
            userMap.set(userId, userObject);
            continue;
        }
        user.vacations.push(vacation);
    }
    return [...userMap.values()];
}

const users = formatVacationsJson(json);

for (const user of users) {
    console.log(user);
}
