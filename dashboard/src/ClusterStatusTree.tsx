import { BwStatus, PodStatus, PodStatusTree } from "./model.ts";
import React from "react";
import { useRelativeTime } from "./useRelativeTime.ts";

function noneSelected(filter: Record<string, boolean | undefined>) {
  return Object.values(filter).filter((v) => !!v).length === 0;
}

function useUptime(time?: Date) {
  if (!time) {
    return undefined;
  }

  function period(seconds: number) {
    let secs = seconds;
    const weeks = Math.floor(secs / (7 * 24 * 60 * 60));
    secs -= weeks * 7 * 24 * 60 * 60;
    const days = Math.floor(secs / (24 * 60 * 60));
    secs -= days * 24 * 60 * 60;
    const hours = Math.floor(secs / (60 * 60));
    secs -= hours * 60 * 60;
    const mins = Math.floor(secs / 60);
    secs -= mins * 60;
    return { weeks, days, hours, mins, secs };
  }

  const { weeks, days, hours, mins } = period(
    (new Date().getTime() - time.getTime()) / 1000
  );
  let result = "";
  if (weeks) result += weeks + "w";
  if (days || weeks) result += days + "d";
  if (hours || days || weeks) result += ("00" + hours).slice(-2) + "h";
  result += ("00" + mins).slice(-2) + "m";
  return result;
}

function PodStatusView({ pod }: { pod: PodStatus<BwStatus> }) {
  function handleClickPod() {
    console.log(pod);
  }

  const { name, phase, startTime, lastError, lastContact } = pod;

  const uptime = useUptime(startTime ? new Date(startTime) : undefined);
  const healthChecks = pod.status?.healthChecks || {};
  const unhealthyHealthChecks = Object.values(healthChecks).filter(
    (h) => !h.healthy
  );
  const traffic = pod.status?.traffic || 0;
  const busy = traffic > 100;
  const unhealthy =
    unhealthyHealthChecks.length > 0 ||
    (pod.status?.errors && pod.status.errors > 0);
  let status: string;
  if (!lastContact) {
    status = "down";
  } else if (lastError && new Date(lastError) > new Date(lastContact)) {
    status = "down";
  } else if (unhealthy) {
    status = "unhealthy";
  } else if (busy) {
    status = "busy";
  } else {
    status = "idle";
  }
  return (
    <div className={"pod " + name + " " + status + " " + phase}>
      <div title={name} onClick={handleClickPod}>
        <span className="dot" />
      </div>
      <div title={pod.status?.version}>{uptime}</div>
      {pod.status && (
        <div>
          {pod.status.traffic}
          {pod.status.traffic == 0 ? "⚠" : ""}
        </div>
      )}
      {pod.status && (
        <div>
          {pod.status?.errors}
          {pod.status?.errors ? "⚠" : ""}
          {pod.status?.healthChecks && (
            <span
              title={JSON.stringify(unhealthyHealthChecks, undefined, "  ")}
            >
              {" | "}
              {Object.keys(healthChecks).length - unhealthyHealthChecks.length}/
              {Object.keys(healthChecks).length}
              {unhealthyHealthChecks.length > 0 ? "⚠" : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function AppStatusView({
  app,
  appTree,
}: {
  app: string;
  appTree: Record<string, PodStatus<BwStatus>>;
}) {
  return (
    <div className={"app " + app}>
      <h3>{app}</h3>
      <div className="pods">
        {Object.values(appTree)
          .sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          )
          .map((pod) => (
            <PodStatusView key={pod.name} pod={pod} />
          ))}
      </div>
    </div>
  );
}

function NamespaceStatusView({
  namespace,
  filter,
  namespaceTree,
}: {
  namespace: string;
  filter: Record<
    "cluster" | "namespace" | "application",
    Record<string, boolean | undefined>
  >;
  namespaceTree: Record<string, Record<string, PodStatus<BwStatus>>>;
}) {
  function handleClick() {
    console.table(
      Object.values(namespaceTree).flatMap((o) => Object.values(o))
    );
    console.table(
      Object.values(namespaceTree).flatMap((o) =>
        Object.values(o).map((o) => o.status)
      )
    );
    console.table(
      Object.values(namespaceTree).flatMap((o) =>
        Object.values(o).map((o) =>
          Object.values(o.status?.errorMessages || {})
        )
      )
    );
  }
  return (
    <div className={"namespace " + namespace}>
      <h2 onClick={handleClick}>{namespace}</h2>
      <div className="apps">
        {Object.keys(namespaceTree)
          .filter(
            (app) => noneSelected(filter.application) || filter.application[app]
          )
          .sort()
          .map((app) => (
            <AppStatusView key={app} app={app} appTree={namespaceTree[app]} />
          ))}
      </div>
    </div>
  );
}

export function ClusterStatusTree({
  cluster,
  filter,
  startTime,
  connected,
  disconnectTime,
  tree,
}: {
  cluster: string;
  filter: Record<
    "cluster" | "namespace" | "application",
    Record<string, boolean | undefined>
  >;
  startTime?: Date;
  connected: boolean;
  disconnectTime?: Date;
  tree: PodStatusTree<BwStatus>;
}) {
  const startTimeAgo = useRelativeTime(startTime);
  const disconnectedTimeAgo = useRelativeTime(disconnectTime);
  const status =
    connected && startTime
      ? new Date().getTime() - startTime.getTime() < 60000
        ? "starting"
        : "healthy"
      : "down";

  return (
    <div className={"cluster " + cluster + (!connected ? " disconnected" : "")}>
      <h1 className={status}>
        <div className="dot" />
        {cluster}
      </h1>
      {connected && <div>Aggregator started {startTimeAgo}</div>}
      {disconnectedTimeAgo && <div>Last seen {disconnectedTimeAgo}</div>}
      <div className="namespaces">
        {Object.keys(tree)
          .filter(
            (ns) => noneSelected(filter.namespace) || filter.namespace[ns]
          )
          .sort()
          .map((ns) => (
            <NamespaceStatusView
              namespace={ns}
              filter={filter}
              key={ns}
              namespaceTree={tree[ns]}
            />
          ))}
      </div>
    </div>
  );
}
