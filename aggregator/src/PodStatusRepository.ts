import { HuginStatus } from "./model.ts";
import { log, PodStatus } from "../deps.ts";

export type PodRepositoryEvent<T> =
  | {
    type: "snapshot";
    snapshot: Record<string, HuginStatus<T | undefined>>;
  }
  | {
    type: "patch";
    name: string;
    value: HuginStatus<T | undefined>;
  };

export class PodStatusRepository<T> {
  readonly pods: Record<
    string,
    HuginStatus<T | undefined> & { timer: number }
  > = {};
  readonly listeners: ((event: PodRepositoryEvent<T>) => void)[] = [];

  async updateStatus(
    name: string,
    statusFunction: () => Promise<T | undefined>,
  ) {
    const pod = this.pods[name];
    if (pod) {
      try {
        pod.lastAttempt = new Date();
        const json: any = await statusFunction();
        pod.status = json;
        pod.lastContact = new Date();
        if (json && json.startTime) {
          pod.startTime = json.startTime;
        }
        if (json && json.id) {
          pod.name = json.id;
        }
        this.notifyListeners({ type: "patch", name, value: { ...pod } });
      } catch (e) {
        log.warning("Failed to get status from " + name + ": " + e, e);
        pod.lastError = new Date();
      }
    }
  }

  onEvent(
    event: "ADDED" | "MODIFIED" | "DELETED",
    data: HuginStatus<T | undefined>,
    podStatus?: PodStatus
  ) {
    if (event === "DELETED") {
      if (this.pods[data.name]) {
        log.info("Pod removed " + data.name);
        clearInterval(this.pods[data.name].timer);
        delete this.pods[data.name];
      }
    } else if (event === "ADDED") {
      const { name, statusFunction } = data;
      if (this.pods[name]) {
        log.warning("Pod already exists " + name);
        return;
      }
      log.info("Pod added " + name);
      const timer = setInterval(
        () => (async () => await this.updateStatus(name, statusFunction))(),
        15000,
      );
      this.pods[name] = { ...data, timer, podStatus };
      this.updateStatus(name, statusFunction);
    } else if (this.pods[data.name]) {
      this.pods[data.name].phase = data.phase;
      this.pods[data.name].podStatus = podStatus;
    }
    this.notifyListeners({ type: "snapshot", snapshot: this.pods });
  }

  addListener(listener: (event: PodRepositoryEvent<T>) => void) {
    this.listeners.push(listener);
  }

  private async notifyListeners(event: PodRepositoryEvent<T>): Promise<void> {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        log.error("Failed to notify listener", e);
      }
    });
  }
}
