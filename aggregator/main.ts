import { KubeConfigRestClient } from "./deps.ts";
import { PodStatusRepository } from "./src/PodStatusRepository.ts";
import { watchPods } from "./src/watchPods.ts";
import { StatusServer } from "./src/StatusServer.ts";

console.log("Starting...");

const repository = new PodStatusRepository<unknown>();
watchPods(await KubeConfigRestClient.forInCluster(), repository);
new StatusServer(3003, repository);
