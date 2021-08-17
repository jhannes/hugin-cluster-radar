import { PodStatusRepository } from "./PodStatusRepository.ts";
import { exists, log, readJson } from "../deps.ts";
import { fetchJson } from "./fetchJson.ts";

export async function pollConfiguredServers(
  configurationFile: string,
  repository: PodStatusRepository<unknown>,
) {
  if (await exists(configurationFile)) {
    const json: any = await readJson(configurationFile);
    const endpoints: Array<{
      namespace: string;
      apps: Record<string, string[]>;
    }> = json;
    log.getLogger("server").info("Endpoints: " + JSON.stringify(endpoints));
    for (const { namespace, apps } of endpoints) {
      for (const app of Object.keys(apps)) {
        const pods = apps[app!];
        for (const name of pods) {
          repository.onEvent("ADDED", {
            name,
            namespace,
            phase: "Running",
            statusFunction: () => fetchJson(name),
            app,
          });
        }
      }
    }
  } else {
    log.getLogger("server").warning(`${configurationFile} doesn't exist`);
  }
}
