import { BwStatus, PodStatus } from "./model.ts";
import { useUptime } from "../lib/useUptime.tsx";
import React, {useEffect, useRef, useState} from "react";

export function podStatus(pod: PodStatus<BwStatus>) {
  const { lastError, lastContact } = pod;
  const healthChecks = pod.status?.healthChecks || {};
  const unhealthyHealthChecks = Object.values(healthChecks).filter(
    (h) => !h.healthy
  );
  const traffic = pod.status?.traffic || 0;
  const busy = traffic > 100;
  const unhealthy =
    unhealthyHealthChecks.length > 0 ||
    (pod.status?.errors && pod.status.errors > 0);
  if (!lastContact) {
    return "down";
  } else if (lastError && new Date(lastError) > new Date(lastContact)) {
    return "down";
  } else if (unhealthy) {
    return "unhealthy";
  } else if (busy) {
    return "busy";
  } else {
    return "idle";
  }
}

function PodLightbox({pod, onClose}: { pod: PodStatus<BwStatus>, onClose(): void }) {
  const ref = useRef();
  function handleClick(event: Event) {
    if (ref.current && !ref.current.contains(event.target)) {
      onClose();
    }
  }
  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [])

  const unhealthyHealthChecks = Object.entries(pod.status?.healthChecks || {}).filter(
      ([, h]) => !h.healthy
  );
  return <div style={{position: "absolute", left: 0, right: 0, top: 0, bottom: 0, background: "rgba(.60, .60, .60, .25)", display: "flex"}}>
    <div style={{background: "white", width: "clamp(100vw, auto, 50em)", margin: "auto", padding: "2em"}} ref={ref}>
      <h1>Pod info</h1>
      <div>Name: {pod.name}</div>
      <div>Started: {pod.startTime}</div>
      <div>Build time: {pod.status?.buildTime}</div>
      <div>Version: {pod.status?.version}</div>
      <h3>Health checks</h3>
      <ul>
        {unhealthyHealthChecks.map(h => <li key={h[0]}><strong>{h[0]}</strong>: {h[1].message}</li>)}
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  </div>;
}

export function PodStatusView({
  pod,
  expanded,
}: {
  pod: PodStatus<BwStatus>;
  expanded: boolean;
}) {
  const [showPod, setShowPod] = useState<boolean>();
  function handleClickPod() {
    console.log(pod);
    setShowPod(!showPod);
  }

  const { name, phase, startTime } = pod;

  const uptime = useUptime(startTime ? new Date(startTime) : undefined);
  const healthChecks = pod.status?.healthChecks || {};
  const unhealthyHealthChecks = Object.values(healthChecks).filter(
    (h) => !h.healthy
  );
  const status = podStatus(pod);
  return (
    <div className={"pod " + name + " " + status + " " + phase}>
      {showPod && <PodLightbox pod={pod} onClose={() => setShowPod(false)} />}
      <div title={name} onClick={handleClickPod}>
        <span className="dot" />
      </div>
      {expanded && (
        <>
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
                  {Object.keys(healthChecks).length -
                    unhealthyHealthChecks.length}
                  /{Object.keys(healthChecks).length}
                  {unhealthyHealthChecks.length > 0 ? "⚠" : ""}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
