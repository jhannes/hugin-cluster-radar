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
  const {namespace, app, name, startTime, status} = pod;
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
  return <div className={"lightbox"}>
    <div ref={ref}>
      <h1>{namespace}: {app}</h1>
      <div><strong>Name:</strong> {name}</div>
      <div><strong>Started:</strong> {startTime}</div>
      <div><strong>Build time:</strong> {status?.buildTime}</div>
      <div><strong>Version:</strong> {status?.version}</div>
      <div><strong>Traffic:</strong> {status?.traffic}</div>
      <div><strong>Errors:</strong> {status?.errors}</div>
      <div><strong>CPU:</strong> {status?.cpu}</div>
      <div><strong>Memory:</strong> {status?.memory}</div>
      {unhealthyHealthChecks.length > 0 && <>
        <h2>Health checks</h2>
        <ul>
          {unhealthyHealthChecks.map(h => <li key={h[0]}><strong>{h[0]}</strong>: {h[1].message}</li>)}
        </ul>
      </>}
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
