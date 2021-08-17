import {autoDetectClient, CoreV1Api, log} from "./deps.ts";
import {StatusServer} from "./src/StatusServer.ts";
import {setupLogging} from "./src/logging.ts";
import {ClusterStatus} from "./src/ClusterStatus.ts";
import {VirtualMachineStatus} from "./src/VirtualMachineStatus.ts";

await setupLogging();

log.getLogger("server").info("Starting on http://localhost:3001");
const statusServer = new StatusServer(3001);

const kubernetes = await autoDetectClient();
new ClusterStatus(new CoreV1Api(kubernetes), statusServer).watchPods();

new VirtualMachineStatus("./config/endpoints.json", statusServer).watch();
