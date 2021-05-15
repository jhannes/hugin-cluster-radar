import { BwStatus, PodFilter, PodStatusTree } from "./model.ts";
import React from "react";
import { useRelativeTime } from "../lib/useRelativeTime.ts";
import { noneSelected } from "../lib/filterRecord.tsx";
import { NamespaceStatusView } from "./NamespaceStatusView.tsx";

export function ClusterStatusTree({
  cluster,
  filter,
  startTime,
  connected,
  disconnectTime,
  tree,
  compactView,
}: {
  cluster: string;
  filter: PodFilter;
  startTime?: Date;
  connected: boolean;
  disconnectTime?: Date;
  tree: PodStatusTree<BwStatus>;
  compactView: boolean;
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
              compactView={compactView}
            />
          ))}
      </div>
    </div>
  );
}
