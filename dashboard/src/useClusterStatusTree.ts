import { PodStatus, PodStatusTree } from "./model.ts";
import { useMemo, useState } from "react";
import { useWebSocket } from "./useWebSocket.ts";

type PodRepositoryEvent<T> =
  | {
      type: "snapshot";
      startTime: Date;
      snapshot: Record<string, PodStatus<T>>;
    }
  | {
      type: "patch";
      name: string;
      value: T;
    };

export function useClusterStatusTree<T>(
  url: string
): {
  tree: PodStatusTree<T>;
  connected: boolean;
  connectTime?: Date;
  startTime?: Date;
  disconnectTime?: Date;
} {
  const [startTime, setStartTime] = useState<Date|undefined>();
  const [podList, setPodList] = useState<Record<string, PodStatus<unknown>>>(
    {}
  );

  const { connectTime, connected, disconnectTime } = useWebSocket(
    (message: string) => {
      const payload: PodRepositoryEvent<PodStatus<unknown>> = JSON.parse(
        message
      );
      if (payload.type === "snapshot") {
        setStartTime(payload.startTime && new Date(payload.startTime));
        setPodList(payload.snapshot);
      } else if (payload.type === "patch") {
        setPodList({ ...podList, [payload.name]: payload.value });
      } else {
        console.warn("Unknown message type", payload);
      }
    },
    url
  );

  const tree = useMemo(() => {
    const result: PodStatusTree<unknown> = {};
    const values: PodStatus<unknown>[] = Object.values(podList);
    for (const pod of values) {
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
  return { tree, startTime, connectTime, connected, disconnectTime };
}
