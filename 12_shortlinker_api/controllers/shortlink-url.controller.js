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
        const tag = await shortlinkService.createShortLink(link);
        res.status(201);
        const shortlink = `${req.protocol}://${req.headers.host}/${tag}`;
        res.send({ status: true, link: shortlink });
    };
}
