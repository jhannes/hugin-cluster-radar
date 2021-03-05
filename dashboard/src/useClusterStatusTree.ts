import { PodStatus, PodStatusTree } from "./model.ts";
import { useMemo, useState } from "react";
import { useWebSocket } from "./useWebSocket.ts";

type PodRepositoryEvent<T> =
  | {
      type: "snapshot";
      snapshot: Record<string, PodStatus<T>>;
    }
  | {
      type: "patch";
      name: string;
      value: T;
    };

export function useClusterStatusTree<T>(url: string): PodStatusTree<T> {
  const [podList, setPodList] = useState<Record<string, PodStatus<unknown>>>(
    {}
  );

  useWebSocket((message: string) => {
    const payload: PodRepositoryEvent<PodStatus<unknown>> = JSON.parse(message);
    if (payload.type === "snapshot") {
      setPodList(payload.snapshot);
    } else if (payload.type === "patch") {
      setPodList({ ...podList, [payload.name]: payload.value });
    } else {
      console.warn("Unknown message type", payload);
    }
  }, url);

  return useMemo(() => {
    const result: PodStatusTree<unknown> = {};
    for (const pod of Object.values(podList)) {
      const { namespace, app, name } = pod;
      if (!result[namespace]) {
        result[namespace] = {};
      }
      if (!result[namespace][app]) {
        result[namespace][app] = {};
      }
      result[namespace][app][name] = pod;
    }
    return result;
  }, [podList]);
}
