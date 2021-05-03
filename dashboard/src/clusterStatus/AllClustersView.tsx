import { useRecordHash } from "../lib/useRecordHash.tsx";
import React, { useEffect, useState } from "react";
import { BwStatus, PodStatusTree } from "./model.ts";
import { noneSelected } from "../lib/filterRecord.tsx";
import { ClusterStatus } from "./ClusterStatus.tsx";
import { PodFilterMenu } from "./PodFilterMenu.tsx";

export function AllClustersView({
  clusters,
}: {
  clusters: Record<string, string>;
}) {
  const [filter, setFilter] = useRecordHash<
    "cluster" | "namespace" | "application"
  >({
    cluster: {},
    namespace: {},
    application: {},
  });
  const [showNav, setShowNav] = useState(false);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [apps, setApps] = useState<string[]>([]);
  const [clusterTrees, setClusterTrees] = useState<
    Record<string, PodStatusTree<BwStatus>>
  >({});

  useEffect(() => {
    setNamespaces(
      [
        ...new Set(
          Object.values(clusterTrees).flatMap((o: any) => Object.keys(o))
        ),
      ].sort()
    );
    setApps(
      [
        ...new Set(
          Object.values(clusterTrees).flatMap((o: any) =>
            Object.values(o).flatMap((o1: any) => Object.keys(o1))
          )
        ),
      ].sort()
    );
  }, [clusterTrees]);

  return (
    <>
      <header>
        <h1>
          <button onClick={() => setShowNav(!showNav)}>☰</button>
          HUGIN
        </h1>
      </header>
      <main>
        {Object.keys(clusters)
          .filter((s) => noneSelected(filter.cluster) || filter.cluster[s])
          .map((s) => (
            <ClusterStatus
              key={s}
              cluster={s}
              filter={filter}
              url={clusters[s]}
              setClusterTree={(tree) => {
                setClusterTrees({ ...clusterTrees, [s]: tree });
              }}
            />
          ))}
      </main>
      <footer>Monitoring</footer>
      <nav className={showNav ? "show-nav" : ""}>
        <PodFilterMenu
          clusters={clusters}
          apps={apps}
          namespaces={namespaces}
          value={filter}
          setValue={setFilter}
        />
      </nav>
    </>
  );
}
