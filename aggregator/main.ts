import { autoDetectClient } from "./deps.ts";
import { PodStatusRepository } from "./src/PodStatusRepository.ts";
import { watchPods } from "./src/watchPods.ts";
import { StatusServer } from "./src/StatusServer.ts";
import { pollConfiguredServers } from "./src/pollConfiguredServers.ts";

console.log("INFO: Starting...");

const repository = new PodStatusRepository<unknown>();
watchPods(await autoDetectClient(), repository);
new StatusServer(3003, repository);
pollConfiguredServers("./config/endpoints.json", repository)