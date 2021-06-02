import React, { useEffect } from "react";
import { CheckboxList } from "../components/CheckboxList.tsx";
import { PodFilter } from "./model.ts";

export function PodFilterMenu({
  clusters,
  apps,
  namespaces,
  value,
  setValue,
  compactView,
  setCompactView,
}: {
  clusters: Record<string, string>;
  apps: string[];
  namespaces: string[];
  value: PodFilter;
  setValue(value: PodFilter): void;
  compactView: boolean;
  setCompactView(value: boolean): void;
}) {
  useEffect(() => {
    console.log(value);
  }, [value]);

  function handleClickClear() {
    setValue({
      cluster: {},
      namespace: {},
      application: {},
    });
  }

  function setFilterValue(
    filter: "namespace" | "application" | "cluster",
    k: string,
    v: boolean
  ) {
    setValue({
      ...value,
      [filter]: {
        ...value[filter],
        [k]: v,
      },
    });
  }

  return (
    <>
      <div>
        <label>
          <input
            type="checkbox"
            checked={compactView}
            onChange={(e) => setCompactView(e.target.checked)}
          />
          Compact view
        </label>
      </div>
      <h3>Clusters</h3>
      <CheckboxList
        options={Object.keys(clusters)}
        value={value.cluster}
        setValue={(k, v) => setFilterValue("cluster", k, v)}
      />
      <h3>Namespaces</h3>
      <CheckboxList
        options={namespaces}
        value={value.namespace}
        setValue={(k, v) => setFilterValue("namespace", k, v)}
      />
      <h3>Applications</h3>
      <CheckboxList
        options={apps}
        value={value.application}
        setValue={(k, v) => setFilterValue("application", k, v)}
      />
      <button onClick={handleClickClear}>Clear</button>
      <h2>Legend</h2>
      <div className={"down"}>
        <span className="dot" /> No contact
      </div>
      <div className={"unhealthy"}>
        <span className="dot" /> Health checks fail
      </div>
      <div className={"idle"}>
        <span className="dot" /> No traffic (&lt; 100)
      </div>
      <div className={"busy"}>
        <span className="dot" /> Normal operation
      </div>
      <div className={"starting"}>
        <span className="dot" /> Recently started
      </div>
      <h2>Numbers are</h2>
      <div>
        Uptime (e.g. 3w4d04h12m = 3 weeks, 2 days, 4 hours and 12 minutes). This
        is kept in full detail so the length of the string gives a visual
        indication of the uptime
      </div>
      <div>
        Traffic as reported by the underlying pod. Implementation specific for
        the pod health check
      </div>
      <div>
        Errors in the error log and successful health checks. Reads healthcheck
        on the format of Dropwizard and reports the failing ones. If any health
        check fails, the status of the pod becomes yellow
      </div>
    </>
  );
}
