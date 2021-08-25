import {
    acceptWebSocket,
    isWebSocketCloseEvent,
    serve,
    Server,
    ServerRequest,
    v4,
    WebSocket,
} from "../deps.ts";

import {log} from "../deps.ts";

import {HuginStatus} from "./model.ts";

export type PodRepositoryEvent<T> =
    | {
    type: "snapshot";
    snapshot: Record<string, HuginStatus<T | undefined>>;
}
    | {
    type: "patch";
    name: string;
    value: HuginStatus<T | undefined>;
}
    | {
    type: "delete",
    name: string
};

export interface HuginStatusContainer<T> {
    updatePodData(
        name: string,
        updater: (oldValue: Partial<HuginStatus<T>>) => Partial<HuginStatus<T>>,
        create?: boolean
    ): void;

    deletePodData(name: string): void;

    fetchStatus(name: string, fetcher: () => Promise<unknown>): void;

    pollStatus(name: string, interval: number, fetcher: () => Promise<unknown>): void;
}

export class StatusServer<T> implements HuginStatusContainer<T> {
    private readonly startTime = new Date();
    private readonly sockets: Record<string, WebSocket> = {};
    private readonly server: Server;
    private readonly serverStatus: Record<string, HuginStatus<T | undefined>> = {};
    private readonly statusTimers: Record<string, {timer: number}> = {};

    constructor(port: number) {
        this.server = serve(`:${port}`);
        this.requestLoop();
    }

    updatePodData(
        name: string,
        updater: (oldValue: Partial<HuginStatus<T>>) => Partial<HuginStatus<T>>,
        create: boolean = true
    ) {
        if (!create && !this.serverStatus[name]) {
            log.getLogger("pods").info("Don't update deleted pod", name);
            return;
        } else if (!this.serverStatus[name]) {
            log.getLogger("pods").info("Adding pod", name);
        } else {
            log.getLogger("pods").debug("Update pod", name);
        }
        const newValue: any = this.serverStatus[name] || {};
        const value = updater(newValue) as any;
        this.serverStatus[name] = value;
        const event: PodRepositoryEvent<T> = {type: "patch", name, value};
        this.broadCast(JSON.stringify(event));
    }
    
    pollStatus(name: string, timeout: number, fetcher: () => Promise<unknown>) {
        if (this.statusTimers[name]?.timer) {
            clearInterval(this.statusTimers[name].timer);
            delete this.statusTimers[name];
        }
        const timer = setInterval(() => {
            this.fetchStatus(name, fetcher);
        }, timeout)
        this.statusTimers[name] = {timer};
        this.fetchStatus(name, fetcher);
    }

    async fetchStatus(name: string, fetcher: () => Promise<unknown>) {
        log.getLogger("pods").debug("Status check", name);
        if (!this.serverStatus[name]) {
            return;
        }
        this.serverStatus[name].lastAttempt = new Date();
        try {
            const status: T = await fetcher() as T;
            log.getLogger("pods").debug("Status", name, status);
            if (!this.serverStatus[name]) {
                return;
            }
            this.serverStatus[name].lastContact = new Date();
            this.serverStatus[name].status = status;
            const event: PodRepositoryEvent<T> = {type: "patch", name, value: this.serverStatus[name]};
            this.broadCast(JSON.stringify(event));
        } catch (e) {
            log.getLogger("pods").warning("Failed to get status from pod", name, e);
            if (!this.serverStatus[name]) {
                return;
            }
            this.serverStatus[name].lastError = new Date();
            this.serverStatus[name].status = undefined;
            const event: PodRepositoryEvent<T> = {type: "patch", name, value: this.serverStatus[name]};
            this.broadCast(JSON.stringify(event));
        }
    }

    deletePodData(name: string) {
        log.getLogger("pods").info("Pod removed", name);
        if (this.statusTimers[name]?.timer) {
            clearInterval(this.statusTimers[name].timer);
            delete this.statusTimers[name];
        }
        delete this.serverStatus[name];
        const event: PodRepositoryEvent<T> = {type: "delete", name};
        this.broadCast(JSON.stringify(event));
    }

    private async broadCast(message: string) {
        for (const socket of Object.keys(this.sockets)) {
            log.getLogger("websocket").debug("sending to websocket", socket);
            if (this.sockets[socket].isClosed) {
                log.getLogger("websocket").warning("websocket was closed without being removed!", socket);
                delete this.sockets[socket];
                continue;
            }
            try {
                await this.sockets[socket].send(message);
            } catch (e) {
                log.getLogger("websocket").warning({message: "failed to send to socket", socket}, e);
            }
        }
    }

    private async requestLoop() {
        for await (const request of this.server) {
            try {
                await this.handleRequest(request);
            } catch (e) {
                log.getLogger("websocket").error("request loop failed", e);
                request.respond({status: 500});
            }
        }
    }

    private async handleRequest(request: ServerRequest) {
        if (request.url === "/" || request.url === "/hugin-aggregator") {
            const status = Object.values(this.serverStatus).map(
                ({namespace, app, name, lastAttempt, lastContact, lastError}) => ({
                    namespace,
                    app,
                    name,
                    lastContact,
                    lastAttempt,
                    lastError,
                }),
            );
            const body = JSON.stringify({status, startTime: this.startTime});
            request.respond({
                body,
                headers: new Headers({"Content-type": "application/json"}),
            });
        } else if (request.url === "/pods" || request.url === "/hugin-aggregator/pods") {
            request.respond({
                body: JSON.stringify(this.serverStatus),
                headers: new Headers({"Content-type": "application/json"}),
            });
        } else if (request.url.startsWith("/ws") || request.url.startsWith("/hugin-aggregator/ws")) {
            log.getLogger("websocket").info("Connect web socket");
            const {conn, r: bufReader, w: bufWriter, headers} = request;
            const socketRequest = {conn, bufReader, bufWriter, headers};
            this.websocketLoop(await acceptWebSocket(socketRequest));
        } else {
            log.getLogger("server").warning("Resource not found for URL", request.url);
            request.respond({status: 404});
        }
    }

    private async websocketLoop(socket: WebSocket) {
        const id = v4.generate();
        this.sockets[id] = socket;
        socket.send(
            JSON.stringify({
                type: "snapshot",
                snapshot: this.serverStatus,
                startTime: this.startTime,
            }),
        );

        for await (const event of socket) {
            if (isWebSocketCloseEvent(event)) {
                log.getLogger("websocket").info("Socket disconnected", id);
                delete this.sockets[id];
            } else if (typeof event === "string") {
                log.getLogger("websocket").info("Event from socket", id, event);
            } else {
                log.getLogger("websocket").warning("Unused event from socket", id, event);
            }
        }
    }
}
