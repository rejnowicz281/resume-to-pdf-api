import dayjs from "dayjs";
import _logger from "pino";

const logger = _logger({
    transport: {
        target: "pino-pretty"
    },
    base: {
        pid: false
    },
    timestamp: () => `,"time":"${dayjs().format()}"`
});

export default logger;
