import { NextFunction, Request, Response } from "express";
import log from "../utils/logger";
import nano, { users } from "../utils/nano";

export const register = async (req: Request, res: Response, next: NextFunction) => {
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

        const userResponse = await users.insert(userDoc);

        await nano.db.create(dbName);

        const securityResponse = await nano.request({
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

        const result = { userResponse, securityResponse };

        log.info(`Registration successful\n${JSON.stringify(result, null, 2)}`);

        return res.status(201).json({ result });
    } catch (error: any) {
        log.error("Registration failed", error);
        return res.status(400).json({ error });
    }
};
