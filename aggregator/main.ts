import {autoDetectClient, CoreV1Api, log} from "./deps.ts";
import { PodStatusRepository } from "./src/PodStatusRepository.ts";
import { watchPods } from "./src/watchPods.ts";
import { StatusServer } from "./src/StatusServer.ts";
import { pollConfiguredServers } from "./src/pollConfiguredServers.ts";
import {setupLogging} from "./src/logging.ts";

await setupLogging();

log.getLogger("server").info("Starting on http://localhost:3001");

const kubernetes = await autoDetectClient();
const repository = new PodStatusRepository<unknown>(new CoreV1Api(kubernetes));
watchPods(kubernetes, repository);
new StatusServer(3001, repository);
pollConfiguredServers("./config/endpoints.json", repository);
