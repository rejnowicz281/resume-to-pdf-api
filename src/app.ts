// prettier-ignore
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import routes from "./routes";
import logger from "./utils/logger";
import middleware from "./utils/middleware";

const port = process.env.PORT || 3000;

const app = express();

middleware(app);

app.listen(port, async () => {
    logger.info(`Server running on port ${port}`);

    routes(app);
});
