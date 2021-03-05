import {
  serve,
  Server,
  ServerRequest,
  v4,
  acceptWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "../deps.ts";
import {
  PodRepositoryEvent,
  PodStatusRepository,
} from "./PodStatusRepository.ts";

export class StatusServer<T> {
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
        console.error(e);
        request.respond({ status: 500 });
      }
    }
  }

  async handleRequest(request: ServerRequest) {
    console.log(request.url);
    if (request.url === "/hello") {
      request.respond({ body: "Hello from your Deno" });
    } else if (request.url === "/pods") {
      request.respond({
        body: JSON.stringify(this.repository.pods),
        headers: new Headers({ "Content-type": "application/json" }),
      });
    } else if (request.url.startsWith("/ws")) {
      console.log("Connect web socket");
      const { conn, r: bufReader, w: bufWriter, headers } = request;
      const socketRequest = { conn, bufReader, bufWriter, headers };
      this.websocketLoop(await acceptWebSocket(socketRequest));
    } else {
      console.log("Not found", request.url);
      request.respond({ status: 404 });
    }
  }

  async broadCast(message: string) {
    for (const socket of Object.keys(this.sockets)) {
      console.log("sending to", socket);
      try {
        await this.sockets[socket].send(message);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  async websocketLoop(socket: WebSocket) {
    const id = v4.generate();
    this.sockets[id] = socket;
    socket.send(
      JSON.stringify({ type: "snapshot", snapshot: this.repository.pods })
    );

    for await (const event of socket) {
      if (isWebSocketCloseEvent(event)) {
        console.log("Disconnected", id);
        delete this.sockets[id];
      } else if (typeof event === "string") {
        console.log("From socket", id, event);
      } else {
        console.log("Unused event", event);
      }
    }
  }
}
