import Koa from "koa";

const app = new Koa();
const PORT = process.env.PORT || 3000;
const JSON_ROUTE = "/json";

app.use((ctx) => {
    if (ctx.path == JSON_ROUTE) {
        switch (ctx.method) {
            case "GET":
                ctx.body = { hello: new Date() };
                break;
            case "PUT":
                ctx.body = { status: true, message: "saved json with id 1" };
                break;
            default:
                ctx.throw(405, "Method not allowed");
                break;
        }
        return;
    }
    ctx.throw(404, "Route not found");
});

app.listen(PORT, () => {
    console.log(`Server listens at port ${PORT}`);
});
