import { BwStatus, PodStatus } from "./model.ts";
import { PodStatusView } from "./PodStatusView.tsx";
import React, {useState} from "react";

export function AppStatusView({
  app,
  appTree,
  compactView,
}: {
  app: string;
  appTree: Record<string, PodStatus<BwStatus>>;
  compactView: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={"app " + app}>
      <h3 onClick={() => setExpanded(!expanded)}>{app}</h3>
      <div className="pods">
        {Object.values(appTree)
          .sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          )
          .map((pod) => (
            <PodStatusView key={pod.name} pod={pod} expanded={!compactView || expanded} />
          ))}
      </div>
    </div>
  );
}
