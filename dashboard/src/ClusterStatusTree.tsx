import { BwStatus, PodStatus, PodStatusTree } from "./model.ts";
import React from "react";
import { useRelativeTime } from "./useRelativeTime.ts";

function useUptime(startTime: Date) {
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
    (new Date().getTime() - startTime.getTime()) / 1000
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

  const uptime = useUptime(new Date(pod.startTime));
  const healthChecks = pod.status?.healthChecks || {};
  const unhealthyHealthChecks = Object.values(healthChecks).filter(
    (h) => !h.healthy
  );
  const traffic = pod.status?.traffic || 0;
  const busy = traffic > 100;
  const unhealthy =
    unhealthyHealthChecks.length > 0 ||
    (pod.status?.errors && pod.status.errors > 0);
  const status = unhealthy ? "unhealthy" : busy ? "busy" : "idle";
  return (
    <div className={"pod " + pod.name + " " + status + " " + pod.phase}>
      <div title={pod.name} onClick={handleClickPod}>
        <span className="dot" />
      </div>
      <div title={pod.status?.version}>{uptime}</div>
      <div>
        {traffic == 0 ? "⚠" : ""}
        {traffic}
      </div>
      <div>
        {pod.status?.errors ? "⚠" : ""}
        {pod.status?.errors}
      </div>
      {pod.status?.healthChecks && (
        <div title={JSON.stringify(unhealthyHealthChecks, undefined, "  ")}>
          {Object.keys(healthChecks).length - unhealthyHealthChecks.length} /{" "}
          {Object.keys(healthChecks).length}
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
  namespaceTree,
}: {
  namespace: string;
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
  lastStatus,
  tree,
}: {
  cluster: string;
  lastStatus: Date;
  tree: PodStatusTree<BwStatus>;
}) {
  const lastUpdate = useRelativeTime(lastStatus);

  return (
    <div className={"cluster " + cluster}>
      <h1>{cluster}</h1>
      <div>Last update: {lastUpdate}</div>
      <div className="namespaces">
        {Object.keys(tree)
          .sort()
          .map((ns) => (
            <NamespaceStatusView
              namespace={ns}
              key={ns}
              namespaceTree={tree[ns]}
            />
          ))}
      </div>
    </div>
  );
}
