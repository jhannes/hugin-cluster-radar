import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  serve,
  Server,
  ServerRequest,
  v4,
  WebSocket,
} from "../deps.ts";

import { log } from "../deps.ts";

import {
  PodRepositoryEvent,
  PodStatusRepository,
} from "./PodStatusRepository.ts";

export class StatusServer<T> {
  private readonly startTime = new Date();
  private readonly sockets: Record<string, WebSocket> = {};
  private readonly server: Server;

  constructor(port: number, private repository: PodStatusRepository<T>) {
    this.server = serve(`:${port}`);
    this.requestLoop();
    this.repository.addListener((event: PodRepositoryEvent<T>) => {
      this.broadCast(JSON.stringify(event));
    });
  }

  async requestLoop() {
    for await (const request of this.server) {
      try {
        await this.handleRequest(request);
      } catch (e) {
        log.error("request loop failed", e);
        request.respond({ status: 500 });
      }
    }
  }

  async handleRequest(request: ServerRequest) {
    if (request.url === "/" || request.url === "/hugin-aggregator") {
      const status = Object.values(this.repository.pods).map(
        ({ namespace, app, name, lastAttempt, lastContact, lastError }) => ({
          namespace,
          app,
          name,
          lastContact,
          lastAttempt,
          lastError,
        }),
      );
      const body = JSON.stringify({ status, startTime: this.startTime });
      request.respond({
        body,
        headers: new Headers({ "Content-type": "application/json" }),
      });
    } else if (request.url === "/pods" || request.url === "/hugin-aggregator/pods") {
      request.respond({
        body: JSON.stringify(this.repository.pods),
        headers: new Headers({ "Content-type": "application/json" }),
      });
    } else if (request.url.startsWith("/ws") || request.url.startsWith("/hugin-aggregator/ws")) {
      log.info("Connect web socket");
      const { conn, r: bufReader, w: bufWriter, headers } = request;
      const socketRequest = { conn, bufReader, bufWriter, headers };
      this.websocketLoop(await acceptWebSocket(socketRequest));
    } else {
      log.warning("Not found: " + request.url);
      request.respond({ status: 404 });
    }
  }

  async broadCast(message: string) {
    for (const socket of Object.keys(this.sockets)) {
      log.debug("sending to " + socket);
      if (this.sockets[socket].isClosed) {
        log.warning("socket was closed without being removed! " + socket);
        delete this.sockets[socket];
        continue;
      }
      try {
        await this.sockets[socket].send(message);
      } catch (e) {
        log.warning({message: "failed to send to socket", socket}, e);
      }
    }
  }

  async websocketLoop(socket: WebSocket) {
    const id = v4.generate();
    this.sockets[id] = socket;
    socket.send(
      JSON.stringify({
        type: "snapshot",
        snapshot: this.repository.pods,
        startTime: this.startTime,
      }),
    );

    for await (const event of socket) {
      if (isWebSocketCloseEvent(event)) {
        log.info("Disconnected " + id);
        delete this.sockets[id];
      } else if (typeof event === "string") {
        log.info("From socket " + id + ": " + event);
      } else {
        log.warning("Unused event: " + event);
      }
    }
  }
}
