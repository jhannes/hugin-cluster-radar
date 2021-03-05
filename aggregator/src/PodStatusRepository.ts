import { PodStatus } from "./model.ts";

export type PodRepositoryEvent<T> =
  | {
      type: "snapshot";
      snapshot: Record<string, PodStatus<T>>;
    }
  | {
      type: "patch";
      name: string;
      value: PodStatus<T>;
    };

export class PodStatusRepository<T> {
  readonly pods: Record<string, PodStatus<T> & { timer: number }> = {};
  readonly listeners: ((event: PodRepositoryEvent<T>) => void)[] = [];

  onEvent(event: "ADDED" | "MODIFIED" | "DELETED", data: PodStatus<T>) {
    if (event === "DELETED") {
      if (this.pods[data.name]) {
        clearInterval(this.pods[data.name].timer);
        delete this.pods[data.name];
      }
    } else if (event === "ADDED") {
      const timer = setInterval(
        () =>
          (async () => {
            if (this.pods[data.name]) {
              const status = await data.statusFunction!();
              this.pods[data.name].status = status;
              this.listeners.forEach((listener) =>
                listener({
                  type: "patch",
                  name: data.name,
                  value: { ...this.pods[data.name], status },
                })
              );
            }
          })(),
        5000
      );
      this.pods[data.name] = { ...data, timer };
    } else if (this.pods[data.name]) {
      this.pods[data.name].phase = data.phase;
    }
    this.listeners.forEach((listener) =>
      listener({ type: "snapshot", snapshot: this.pods })
    );
  }

  addListener(listener: (event: PodRepositoryEvent<T>) => void) {
    this.listeners.push(listener);
  }
}
