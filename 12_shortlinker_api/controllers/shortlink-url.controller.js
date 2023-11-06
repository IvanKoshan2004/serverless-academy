export function createShortlinkUrlController(shortlinkService) {
    return function shortlinkUrlController(req, res) {
        res.send("create short link");
    };
}
