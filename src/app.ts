import config from "config";
import dotenv from "dotenv";
import express from "express";
import routes from "./routes";
import logger from "./utils/logger";
import middleware from "./utils/middleware";
dotenv.config();

const port = config.get("port");

const app = express();

middleware(app);

app.listen(port, async () => {
    logger.info(`Server running on port ${port}`);

    routes(app);
});
