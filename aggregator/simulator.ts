import {StatusServer} from "./src/StatusServer.ts";
import {setupLogging} from "./src/logging.ts";
import {VirtualMachineStatus} from "./src/VirtualMachineStatus.ts";

await setupLogging();

const statusServer = new StatusServer(3001);
new VirtualMachineStatus("./config/endpoints.json", statusServer).watch();
