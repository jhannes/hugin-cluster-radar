import {BwStatus, PodFilter, PodStatus} from "./model.ts";
import { noneSelected } from "../lib/filterRecord.tsx";
import { AppStatusView } from "./AppStatusView.tsx";
import React from "react";

export function NamespaceStatusView({
  namespace,
  filter,
  namespaceTree,
}: {
  namespace: string;
  filter: PodFilter;
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
