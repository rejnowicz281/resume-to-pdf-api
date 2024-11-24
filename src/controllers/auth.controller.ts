import { NextFunction, Request, Response } from "express";
import { User } from "../types/user";
import { generateAccessToken, generateRefreshToken, refreshTokenOptions } from "../utils/jwt.utils";
import logger from "../utils/logger";
import nano, { createNanoInstance, users } from "../utils/nano";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { username, password } = req.body;

        const dbName = `resumes-${username}`;

        const userDoc = {
            _id: `org.couchdb.user:${username}`,
            name: username,
            roles: [],
            type: "user",
            password
        };

        await users.insert(userDoc);

        await nano.db.create(dbName);

        await nano.request({
            db: dbName,
            doc: `_security`,
            method: "put",
            body: {
                admins: {
                    names: [],
                    roles: []
                },
                members: {
                    names: [username],
                    roles: []
                }
            }
        });

        const refreshToken = generateRefreshToken(username);
        const accessToken = generateAccessToken(username);

        const result = { message: "Registration successful", accessToken };
        logger.info(result);

        return res.cookie("refreshToken", refreshToken, refreshTokenOptions).status(200).json(result);
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

    const result = { message: "Token refresh successful", accessToken };
    logger.info(result);
    return res.status(200).json(result);
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const result = { message: "Logout successful" };
    logger.info(result);
    return res.clearCookie("refreshToken").status(200).json(result);
};
