import nano, { users } from "./nano";

export const getUserId = (name: string) => {
    return `org.couchdb.user:${name}`;
};

export const createUserWithDb = async (username: string, additionalInfo?: Record<string, any>) => {
    const dbName = `resumes-${username}`;

    const userDoc = {
        _id: getUserId(username),
        name: username,
        roles: [],
        type: "user",
        ...additionalInfo
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
};
