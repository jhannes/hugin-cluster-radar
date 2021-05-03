import { BwStatus, PodStatus } from "./model.ts";
import { PodStatusView } from "./PodStatusView.tsx";
import React from "react";

export function AppStatusView({
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
