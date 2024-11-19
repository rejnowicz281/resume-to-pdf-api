import { Express, Request, Response } from "express";
import authRouter from "./auth.router";

export default function routes(app: Express) {
    app.get("/", (req: Request, res: Response) => {
        res.send("Hello, World!");
    });

    app.use(authRouter);
}
