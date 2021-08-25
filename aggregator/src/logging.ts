import {log} from "../deps.ts";

class Handler extends log.handlers.BaseHandler {
    log(msg: string): void {
        console.log(msg);
    }

    format(logRecord: any): string {
        const args: unknown[] = [];
        let error: {message: string, stack?: string} | undefined;
        for (const arg of logRecord.args) {
            if (arg instanceof Error) {
                error = {
                    message: arg.message,
                    stack: arg.stack
                };
            } else {
                args.push(arg);
            }
        }

        return JSON.stringify({
            logger: logRecord.loggerName,
            level: logRecord.levelName,
            message: logRecord.msg,
            fullMessage: JSON.stringify(logRecord),
            error,
            args
        });
    }
}

export async function setupLogging() {
    await log.setup({
        handlers: {
            standard: new Handler("DEBUG"),
        },

        loggers: {
            default: {
                level: "DEBUG",
                handlers: ["standard"],
            },
            server: {
                level: "DEBUG",
                handlers: ["standard"],
            },
            pods: {
                level: "INFO",
                handlers: ["standard"],
            },
            websocket: {
                level: "INFO",
                handlers: ["standard"],
            }
        }
    })
}
