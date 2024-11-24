import express from "express";
import passport from "passport";
import { getGithubToken, githubLogin, login, logout, refresh, register } from "../controllers/auth.controller";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.delete("/logout", logout);
authRouter.post("/refresh", passport.authenticate("jwt-refresh-token", { session: false }), refresh);
authRouter.post("/github/token", getGithubToken);
authRouter.post("/github/login", passport.authenticate("github-token", { session: false }), githubLogin);

export default authRouter;
