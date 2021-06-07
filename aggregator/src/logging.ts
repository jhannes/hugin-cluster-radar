import {log} from "../deps.ts";

export async function setupLogging() {
    await log.setup({
        handlers: {
            console: new log.handlers.ConsoleHandler("DEBUG"),
        },
        loggers: {
            default: {
                level: "INFO",
                handlers: ["console"],
            },
        },
    });

}