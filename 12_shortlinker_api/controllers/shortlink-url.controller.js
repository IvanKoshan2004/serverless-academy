import { InvalidLinkError } from "../shortlink/errors/invalid-link.error.js";

export function createShortlinkUrlController(shortlinkService) {
    return async function shortlinkUrlController(req, res) {
        const { link } = req.body;
        if (link === undefined) {
            res.status(400);
            res.send({
                status: false,
                error: "Body must contain link attribute",
            });
            return;
        }
        try {
            const tag = await shortlinkService.createShortLink(link);
            const shortlink = `${req.protocol}://${req.headers.host}/${tag}`;
            res.status(201);
            res.send({ status: true, link: shortlink });
        } catch (e) {
            if (e.name === InvalidLinkError.name) {
                res.status(400);
                res.send({ status: false, error: "Invalid link formal" });
            } else {
                res.status(500);
                res.send({
                    status: false,
                    error: "Couldn't create short link",
                });
            }
        }
    };
}
