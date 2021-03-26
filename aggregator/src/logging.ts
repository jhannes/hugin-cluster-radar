import {log} from "../deps.ts";

export async function setupLogging() {
    await log.setup({
        handlers: {
            console: new log.handlers.ConsoleHandler("DEBUG", {
                formatter: ({ datetime, levelName, msg, args }) =>
                    `${datetime.toISOString()} [${levelName}] ${msg} ${args}`,
            }),
        },
        loggers: {
            default: {
                level: "INFO",
                handlers: ["console"],
            },
        },
    });

}