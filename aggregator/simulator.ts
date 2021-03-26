import {PodStatusRepository} from "./src/PodStatusRepository.ts";
import {StatusServer} from "./src/StatusServer.ts";
import {pollConfiguredServers} from "./src/pollConfiguredServers.ts";
import {setupLogging} from "./src/logging.ts";

await setupLogging();
const repository = new PodStatusRepository<unknown>();

//setInterval(() => generateEvent(repository), 10000);
//generateEvent();

new StatusServer(3001, repository);

await pollConfiguredServers("./config/endpoints.json", repository);
