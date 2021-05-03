import { BwStatus, PodStatus } from "./model.ts";
import { useUptime } from "../lib/useUptime.tsx";
import React from "react";

export function PodStatusView({ pod }: { pod: PodStatus<BwStatus> }) {
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
