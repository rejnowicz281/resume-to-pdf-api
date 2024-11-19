import config from "config";
import * as _nano from "nano";

const nano = _nano.default(config.get<string>("dbUri"));

export const users = nano.db.use("_users");

export default nano;
