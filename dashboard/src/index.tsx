import React, { useMemo } from "react";
import ReactDOM from "react-dom";
import { BwStatus } from "./model.ts";
import { useClusterStatusTree } from "./useClusterStatusTree.ts";
import { ClusterStatusTree } from "./ClusterStatusTree.tsx";

function ClusterStatus({ url, cluster }: { url: string; cluster: string }) {
  const tree = useClusterStatusTree<BwStatus>(url);
  const lastStatus = useMemo(() => new Date(), [tree]);
  return (
    <ClusterStatusTree cluster={cluster} tree={tree} lastStatus={lastStatus} />
  );
}

function App() {
  // @ts-ignore
  const servers: Record<string, string> = window.servers || {
    "Simulator": "ws://localhost:3004/ws"
  };
  return (
    <>
      {Object.keys(servers).map((s) => (
        <ClusterStatus key={s} cluster={s} url={servers[s]} />
      ))}
    </>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// @ts-ignore
if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept();
}
