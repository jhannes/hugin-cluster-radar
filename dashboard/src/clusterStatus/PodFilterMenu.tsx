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
    </>
  );
}
