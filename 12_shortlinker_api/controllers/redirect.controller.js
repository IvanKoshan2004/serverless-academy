export function createRedirectController(shortlinkService) {
    return async function redirectController(req, res) {
        const { linkTag } = req.params;
        if (linkTag === undefined) {
            res.status(404);
            res.send({ status: false, error: "Route doesn't exist" });
        }
        try {
            const link = await shortlinkService.getLinkByTag(linkTag);
            res.redirect(link);
        } catch (e) {
            res.status(404);
            res.send({ status: false, error: "Short link doesn't exist" });
        }
    };
}
