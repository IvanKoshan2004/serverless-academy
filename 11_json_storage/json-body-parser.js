export async function jsonBodyParser(ctx, next) {
    if (ctx.header["content-type"] == "application/json") {
        const data = [];
        await new Promise((resolve, reject) => {
            ctx.req.on("data", (chunk) => {
                data.push(chunk);
            });
            ctx.req.on("end", () => {
                resolve();
            });
            ctx.req.on("error", (e) => {
                reject(e);
            });
        });
        try {
            const payload = Buffer.concat(data);
            ctx.req.body = JSON.parse(payload.toString("utf-8"));
        } catch (e) {
            ctx.throw(400, e.message);
            return;
        }
    }
    await next();
}
