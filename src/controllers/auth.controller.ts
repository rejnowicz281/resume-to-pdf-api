import { NextFunction, Request, Response } from "express";
import { generateAccessToken, generateRefreshToken, refreshTokenOptions } from "../utils/jwt.utils";
import log from "../utils/logger";
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

        return res
            .cookie("refreshToken", refreshToken, refreshTokenOptions)
            .status(200)
            .json({ message: "Registration successful", accessToken });
    } catch (error: any) {
        log.error("Registration failed", error);
        return res.status(400).json({ error });
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
        log.error("Login failed", error);
        return res.status(400).json({ error });
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;

    const username = user.name;

    const accessToken = generateAccessToken(username);
    console.log("sending new access token", accessToken);

    return res.status(200).json({ message: "Token refresh successful", accessToken });
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    return res.clearCookie("refreshToken").status(200).json({ message: "Logout successful" });
};
