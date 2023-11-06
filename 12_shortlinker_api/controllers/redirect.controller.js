export function createRedirectController() {
    return function redirectController(req, res) {
        res.send("redirect");
    };
}
