import * as _nano from "nano";
import { DB_URI } from "./config";

export const createNanoInstance = (dbUri = DB_URI) => {
    return _nano.default(dbUri);
};

const nano = createNanoInstance();

export const users = nano.db.use("_users");

export default nano;
