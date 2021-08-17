import {log} from "../deps.ts";

class Handler extends log.handlers.BaseHandler {
    log(msg: string): void {
        console.log(msg);
    }

    format(logRecord: any): string {
        const args: unknown[] = [];
        const output: LogEvent = {
            loggerName: logRecord.loggerName,
            levelName: logRecord.levelName,
            msg: logRecord.msg,
            error: undefined,
            args
        };
        for (const arg of logRecord.args) {
            if (arg instanceof Error) {
                output.error = {
                    message: arg.message,
                    stack: arg.stack
                };
            } else {
                args.push(arg);
            }
        }

        return JSON.stringify(output);
    }
}

interface LogEvent {
    loggerName: string;
    levelName: string;
    msg: string;
    args: unknown[];
    error?: {
        message: string,
        stack?: string;
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
                level: "DEBUG",
                handlers: ["standard"],
            },
            websocket: {
                level: "DEBUG",
                handlers: ["standard"],
            }
        }
    })
}
