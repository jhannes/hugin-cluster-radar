export { serve } from "https://deno.land/std/http/server.ts";
export { exists } from "https://deno.land/std/fs/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";
export { log };
export { readJson } from "https://deno.land/x/jsonfile/mod.ts";

export type {
  Server,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";
export { v4 } from "https://deno.land/std/uuid/mod.ts";
export {
  acceptWebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std/ws/mod.ts";
export type { WebSocket } from "https://deno.land/std/ws/mod.ts";

export { autoDetectClient } from "https://deno.land/x/kubernetes_client/mod.ts";
export { Reflector } from "https://deno.land/x/kubernetes_client/mod.ts";
export type { RestClient } from "https://deno.land/x/kubernetes_client/mod.ts";
export type { Pod } from "https://deno.land/x/kubernetes_apis/builtin/core@v1/mod.ts";
export { CoreV1Api } from "https://deno.land/x/kubernetes_apis/builtin/core@v1/mod.ts";
