import { PodStatusRepository } from "./PodStatusRepository.ts";
import { exists, readJson } from "../deps.ts";
import { fetchJson } from "./fetchJson.ts";

export async function pollConfiguredServers(
  configurationFile: string,
  repository: PodStatusRepository<unknown>
) {
  if (await exists(configurationFile)) {
    const json: any = await readJson(configurationFile);
    const endpoints: Array<{
      namespace: string;
      apps: Record<string, string[]>;
    }> = json;
    console.info("INFO: Endpoints :", JSON.stringify(endpoints));
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
    console.warn(`WARN: ${configurationFile} doesn't exist`);
  }
}