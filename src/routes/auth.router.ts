import express from "express";
import passport from "passport";
import { login, logout, refresh, register } from "../controllers/auth.controller";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.delete("/logout", logout);
authRouter.post("/refresh", passport.authenticate("jwtRefreshToken", { session: false }), refresh);

export default authRouter;
