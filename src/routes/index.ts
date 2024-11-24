import { Express, Request, Response } from "express";
import passport from "passport";
import authRouter from "./auth.router";

export default function routes(app: Express) {
    app.get("/", passport.authenticate("jwt-access-token", { session: false }), (req: Request, res: Response) => {
        res.send({
            hello: "world"
        });
    });

    app.use(authRouter);
}
