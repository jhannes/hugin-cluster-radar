import {HuginStatusContainer} from "./StatusServer.ts";
import {exists, log, readJson} from "../deps.ts";
import {fetchJson} from "./fetchJson.ts";

export class VirtualMachineStatus<T> {
    constructor(private configurationFile: string, private statusServer: HuginStatusContainer<T>) {
    }

    async watch() {
        if (!await exists(this.configurationFile)) {
            log.getLogger("server").warning(`${this.configurationFile} doesn't exist`);
            return;
        }
        const json: any = await readJson(this.configurationFile);
        const endpoints: Array<{
            namespace: string;
            apps: Record<string, string[]>;
        }> = json;
        log.getLogger("server").info("Endpoints: " + JSON.stringify(endpoints));
        for (const {namespace, apps} of endpoints) {
            for (const app of Object.keys(apps)) {
                const pods = apps[app!];
                for (const name of pods) {
                    this.statusServer.updatePodData(name, value => ({
                        ...value,
                        name,
                        app,
                        namespace,
                        phase: "Running"
                    }));
                    this.statusServer.pollStatus(name, 15000, async () => await fetchJson(name))
                }
            }
        }
    }
}