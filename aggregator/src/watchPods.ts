import { PodStatusRepository } from "./PodStatusRepository.ts";
import { PodPhase } from "./model.ts";
import { log, Pod } from "../deps.ts";
import { CoreV1Api, Reflector } from "../deps.ts";
import type { RestClient } from "../deps.ts";
import { fetchJson } from "./fetchJson.ts";

export async function watchPods<T>(
  kubernetes: RestClient,
  repository: PodStatusRepository<T>,
) {
  const coreApi = new CoreV1Api(kubernetes);
  const opts = { labelSelector: "hugin" };

  const reflector = new Reflector(
    () => coreApi.getPodListForAllNamespaces(opts),
    () => coreApi.watchPodListForAllNamespaces(opts),
  );
  reflector.goObserveAll(async (iter) => {
    for await (const event of iter) {
      const { type } = event;
      const pod = event.object as Pod;
      if (pod?.status && pod?.metadata) {
        if (type === "ADDED" || type === "MODIFIED" || type == "DELETED") {
          const { labels, namespace, name } = pod.metadata;
          const { phase, startTime, podIP } = pod.status;

          const port = (pod.spec?.containers || [])
            .map((c) =>
              c.ports && c
                .ports!.filter((p) => p.name === "monitoring-port")
                .map((p) => p.containerPort)
            )
            .flat()[0];
          const statusUrl = podIP && port
            ? "http://" + podIP + ":" + port + "/check"
            : undefined;
          const statusFunction: () => Promise<T | undefined> = statusUrl
            ? () => fetchJson(statusUrl)
            : async () => {};
          repository.onEvent(type, {
            namespace: namespace || "<no namespace>",
            app: labels!["hugin"] || "<no app>",
            name: name || "<no name>",
            phase: phase as PodPhase,
            startTime: startTime || new Date(),
            lastAttempt: new Date(),
            lastContact: new Date(),
            status: undefined,
            statusFunction,
          });
        }
      } else {
        log.info({message: "unhandled event", type, pod });
      }
    }
  });

  reflector.run();
}
