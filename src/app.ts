// prettier-ignore
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import routes from "./routes";
import { DB_URI, PORT } from "./utils/config";
import logger from "./utils/logger";
import middleware from "./utils/middleware";

const app = express();

middleware(app);

app.listen(PORT, async () => {
    logger.info(`Server running on port ${PORT}, connecting to ${DB_URI}`);

    routes(app);
});
