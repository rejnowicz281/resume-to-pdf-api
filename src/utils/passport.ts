import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { MangoResponse } from "nano";
import passport, { DoneCallback } from "passport";
import GithubTokenStrategy from "passport-github-token";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { User } from "../types/user";
import { createUserWithDb, getUserId } from "./couchdb.utils";
import { refreshTokenExtractor } from "./jwt.utils";
import logger from "./logger";
import { users } from "./nano";

const jwtAccessToken = () => {
    passport.use(
        "jwt-access-token",
        new JWTStrategy(
            {
                secretOrKey: process.env.ACCESS_TOKEN_SECRET!,
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
            },
            async (payload: JwtPayload, done: DoneCallback) => {
                try {
                    if (!payload.sub) throw new Error("Invalid access token");

                    const username = payload.sub;
                    const userId = getUserId(payload.sub);

                    const user = await users.get(userId);

                    if (user && user._deleted !== true) {
                        logger.info("Access token valid - proceeding...");
                        return done(null, { name: username });
                    } else {
                        logger.info("Access token invalid - aborting...");
                        return done(null, false);
                    }
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
};

const jwtRefreshToken = () => {
    passport.use(
        "jwt-refresh-token",
        new JWTStrategy(
            {
                secretOrKey: process.env.REFRESH_TOKEN_SECRET!,
                jwtFromRequest: refreshTokenExtractor
            },
            async (payload: JwtPayload, done: DoneCallback) => {
                try {
                    if (!payload.sub) throw new Error("Invalid refresh token");

                    const username = payload.sub;
                    const userId = getUserId(payload.sub);

                    const user = await users.get(userId);

                    if (user && user._deleted !== true) {
                        logger.info("Refresh token valid - proceeding...");
                        return done(null, { name: username });
                    } else {
                        logger.info("Refresh token invalid - aborting...");
                        return done(null, false);
                    }
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
};

const githubToken = () => {
    passport.use(
        new GithubTokenStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                passReqToCallback: true
            },
            async (req: Request, accessToken: string, refreshToken: string, profile: any, next: any) => {
                try {
                    const query = (await users.find({
                        selector: {
                            provider: "https://www.github.com",
                            subject: profile.id
                        }
                    })) as MangoResponse<User>;

                    const user = query.docs[0];

                    if (user) {
                        logger.info("Github User found, logging in...");

                        return next(null, { name: user.name });
                    } else {
                        logger.info("Github User not found, creating new user using profile info...");

                        const username = profile.username;

                        await createUserWithDb(username, { provider: "https://www.github.com", subject: profile.id });

                        logger.info("New Github user created, logging in...");

                        return next(null, { name: username });
                    }
                } catch (error) {
                    logger.error("Error in Github Passport Strategy: ", error);
                    next(error, null);
                }
            }
        )
    );
};

export default function usePassport() {
    jwtAccessToken();
    jwtRefreshToken();
    githubToken();
}
