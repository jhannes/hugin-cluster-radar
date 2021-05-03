import {BwStatus, PodFilter, PodStatusTree} from "./model.ts";
import { useClusterStatusTree } from "./useClusterStatusTree.ts";
import React, { useEffect } from "react";
import { ClusterStatusTree } from "./ClusterStatusTree.tsx";

export function ClusterStatus({
  url,
  cluster,
  filter,
  setClusterTree,
}: {
  url: string;
  cluster: string;
  filter: PodFilter;
  setClusterTree: (value: PodStatusTree<BwStatus>) => void;
}) {
  const {
    tree,
    startTime,
    connectTime,
    connected,
    disconnectTime,
  } = useClusterStatusTree<BwStatus>(url);
  useEffect(() => {
    setClusterTree(tree);
  }, [tree]);
  return (
    <ClusterStatusTree
      cluster={cluster}
      filter={filter}
      tree={tree}
      startTime={startTime || connectTime}
      connected={connected}
      disconnectTime={disconnectTime}
    />
  );
}
