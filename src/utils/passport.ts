import { JwtPayload } from "jsonwebtoken";
import passport, { DoneCallback } from "passport";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { getUserId } from "./couchdb.utils";
import { refreshTokenExtractor } from "./jwt.utils";
import logger from "./logger";
import { users } from "./nano";

const jwtAccessToken = () => {
    passport.use(
        "jwtAccessToken",
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
        "jwtRefreshToken",
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

export default function usePassport() {
    jwtAccessToken();
    jwtRefreshToken();
}
