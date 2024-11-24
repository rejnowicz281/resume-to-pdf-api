import axios from "axios";
import { NextFunction, Request, Response } from "express";
// @ts-ignore
import queryString from "query-string";
import { User } from "../types/user";
import { createUserWithDb } from "../utils/couchdb.utils";
import { generateAccessToken, generateRefreshToken, refreshTokenOptions } from "../utils/jwt.utils";
import logger from "../utils/logger";
import { createNanoInstance } from "../utils/nano";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { username, password } = req.body;

        await createUserWithDb(username, { password });

        const refreshToken = generateRefreshToken(username);
        const accessToken = generateAccessToken(username);

        const data = { message: "Registration successful", accessToken };
        logger.info(data);

        return res.cookie("refreshToken", refreshToken, refreshTokenOptions).status(200).json(data);
    } catch (error: any) {
        logger.error("Registration failed", error.reason);
        return res.status(400).json({ error: error.reason });
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { username, password } = req.body;

        const temporaryNanoInstance = createNanoInstance();

        const authResponse = await temporaryNanoInstance.auth(username, password);

        if (!authResponse.ok) return res.status(401).json({ error: "Invalid username or password" });

        const refreshToken = generateRefreshToken(username);
        const accessToken = generateAccessToken(username);

        return res
            .cookie("refreshToken", refreshToken, refreshTokenOptions)
            .status(200)
            .json({ message: "Login successful", accessToken });
    } catch (error: any) {
        logger.error("Login failed", error.reason);
        return res.status(400).json({ error: error.reason });
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as User;

    const username = user.name;

    const accessToken = generateAccessToken(username);

    const data = { message: "Token refresh successful", accessToken };
    logger.info(data);
    return res.status(200).json(data);
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const data = { message: "Logout successful" };
    logger.info(data);
    return res.clearCookie("refreshToken").status(200).json(data);
};

export const getGithubToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const code = req.body.code;

    const params =
        "?client_id=" +
        process.env.GITHUB_CLIENT_ID +
        "&client_secret=" +
        process.env.GITHUB_CLIENT_SECRET +
        "&code=" +
        code;

    const response = await axios.post("https://github.com/login/oauth/access_token" + params);

    const parsed = queryString.parse(response.data);

    if (!parsed.access_token) return res.status(500).json({ message: "Failed to retrieve Github Token" });

    const data = {
        message: "Github Token Retrieved",
        token: parsed.access_token
    };
    logger.info(data);
    res.status(200).json(data);
};

export const githubLogin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as User;
    const username = user.name;

    const refreshToken = generateRefreshToken(username);
    const accessToken = generateAccessToken(username);

    const data = { message: "Github Login Successful", accessToken, username };
    logger.info(data);

    res.cookie("refreshToken", refreshToken, refreshTokenOptions).status(200).json(data);
};
