import {CoreV1Api, log, Pod, Reflector} from "../deps.ts";
import {HuginStatusContainer} from "./StatusServer.ts";
import {PodPhase} from "./model.ts";
import {fetchJson} from "./fetchJson.ts";

export class ClusterStatus<T> {
    
    constructor(private coreApi: CoreV1Api, private statusServer: HuginStatusContainer<T>) {}
    
    private getStatusUrl(pod: Pod) {
        const { podIP } = pod.status!;
        const port = (pod.spec?.containers || [])
            .map((c) =>
                c.ports && c
                    .ports!.filter((p) => p.name === "monitoring-port")
                    .map((p) => p.containerPort)
            )
            .flat()[0];
        return podIP && port
            ? "http://" + podIP + ":" + port + "/check"
            : undefined;
    }

    private updatePodStatus(event: string, pod: Pod) {
        const { labels, namespace, name } = pod.metadata!;
        const { phase, startTime } = pod.status!;
        if (!name) {
            log.getLogger("pods").error("Missing pod name", pod);
            return;
        }
        log.getLogger("pods").debug("Pod status", pod.status);

        if (event === "ADDED" || event === "MODIFIED") {
            this.statusServer.updatePodData(name, value => ({
                ...value,
                name,
                app: labels!["hugin"] || "<no app>",
                namespace: namespace!,
                phase: phase as PodPhase,
                startTime: startTime!,
                lastAttempt: new Date(),
                lastContact: new Date(),
                podStatus: pod.status!
            }));

            this.fetchLog(pod);

            const statusUrl = this.getStatusUrl(pod);
            if (statusUrl) {
                this.statusServer.pollStatus(
                    name,
                    15000,
                    async () => await fetchJson(statusUrl)
                );
            }
        }
        if (event === "DELETED") {
            this.statusServer.deletePodData(name);
        }
    }

    private fetchLog(pod: Pod) {
        const { namespace, name } = pod.metadata!;
        const {status} = pod;

        if (!namespace || !name || !status?.containerStatuses) {
            return;
        }
        status.containerStatuses.forEach(container => {
            if (!container.ready) {
                log.getLogger("pods").info("Fetching log for container", container.containerID);
                this.coreApi.namespace(namespace).getPodLog(name, {
                    container: container.name,
                    tailLines: 10
                }).then(logs => {
                    this.statusServer.updatePodData(name, (value) => ({
                        ...value, logs
                    }), false);
                });
            }
        });
    }


    watchPods() {
        const opts = { labelSelector: "hugin" };

        const reflector = new Reflector(
            () => this.coreApi.getPodListForAllNamespaces(opts),
            () => this.coreApi.watchPodListForAllNamespaces(opts),
        );
        reflector.goObserveAll(async (iter) => {
            for await (const event of iter) {
                const { type } = event;
                const pod = event.object as Pod;
                if (pod?.status && pod?.metadata) {
                    if (type === "ADDED" || type === "MODIFIED" || type == "DELETED") {
                        this.updatePodStatus(type, pod);
                    }
                } else {
                    log.getLogger("pods").info({message: "unhandled event", type, pod });
                }
            }
        });

        reflector.run();
    }

}
