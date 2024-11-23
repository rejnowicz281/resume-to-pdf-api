import * as _nano from "nano";
import { DB_URI } from "./config";

const nano = _nano.default(DB_URI);

export const users = nano.db.use("_users");

export default nano;
