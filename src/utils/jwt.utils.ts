import { CookieOptions, Request } from "express";
import jwt from "jsonwebtoken";

export const refreshTokenExtractor = (req: Request) => {
    let token = null;
    if (req && req.cookies) token = req.cookies["refreshToken"];

    return token;
};

export const refreshTokenOptions: CookieOptions = {
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
};

export const generateAccessToken = (username: string) => {
    return jwt.sign(
        {
            sub: username
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "6h" }
    );
};

export const generateRefreshToken = (username: string) => {
    return jwt.sign(
        {
            sub: username
        },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
    );
};
