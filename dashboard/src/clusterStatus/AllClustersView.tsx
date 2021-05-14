import { useRecordHash } from "../lib/useRecordHash.tsx";
import React, {useEffect, useRef, useState} from "react";
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
  const menuRef = useRef();
  
  function handleClick(event: Event) {
      console.log("Click click")
      if (menuRef.current && !menuRef.current.contains(event.target)) {
          setShowNav(false);
      }
  }

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
  useEffect(() => {
      if (showNav) {
          document.addEventListener("click", handleClick);
      } else {
          document.removeEventListener("click", handleClick);
      }
      return () => document.removeEventListener("click", handleClick);
  }, [showNav])

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
      <nav className={showNav ? "show-nav" : ""} ref={menuRef}>
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
