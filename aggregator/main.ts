import { autoDetectClient, log } from "./deps.ts";
import { PodStatusRepository } from "./src/PodStatusRepository.ts";
import { watchPods } from "./src/watchPods.ts";
import { StatusServer } from "./src/StatusServer.ts";
import { pollConfiguredServers } from "./src/pollConfiguredServers.ts";
import {setupLogging} from "./src/logging.ts";

await setupLogging();

log.info("Starting on http://localhost:3001");

const repository = new PodStatusRepository<unknown>();
watchPods(await autoDetectClient(), repository);
new StatusServer(3001, repository);
pollConfiguredServers("./config/endpoints.json", repository);
