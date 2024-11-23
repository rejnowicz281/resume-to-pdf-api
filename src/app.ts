// prettier-ignore
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import routes from "./routes";
import { DB_URI, PORT } from "./utils/config";
import logger from "./utils/logger";
import middleware from "./utils/middleware";
import usePassport from "./utils/passport";

const app = express();

usePassport();

middleware(app);

app.listen(PORT, async () => {
    logger.info(`Server running on port ${PORT}, connecting to ${DB_URI}`);

    routes(app);
});
