import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BwStatus, PodStatusTree } from "./model.ts";
import { useClusterStatusTree } from "./useClusterStatusTree.ts";
import { ClusterStatusTree } from "./ClusterStatusTree.tsx";

function ClusterStatus({
  url,
  cluster,
  filter,
  setClusterTree,
}: {
  url: string;
  cluster: string;
  filter: Record<
    "cluster" | "namespace" | "application",
    Record<string, boolean | undefined>
  >;
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

function useHash<T extends string>(
  initialValue: Record<T, Record<string, boolean | undefined>>
): [
  Record<T, Record<string, boolean | undefined>>,
  (value: Record<T, Record<string, boolean | undefined>>) => void
] {
  const [value, setValue] = useState<
    Record<T, Record<string, boolean | undefined>>
  >(() => {
    let value = initialValue;
    if (window.location.hash) {
      const hash = Object.fromEntries(
        new URLSearchParams(window.location.hash.substr(1))
      );
      Object.entries(hash).forEach(([k, v]) => {
        value = {
          ...value,
          [k]: Object.fromEntries(v.split(",").map((s) => [s, true])),
        };
      });
    }
    return value;
  });
  useEffect(() => {
    window.location.hash = new URLSearchParams(
      Object.fromEntries(
        Object.entries(value)
          .map(([k, v]) => [
            k,
            Object.entries(v)
              .filter(([, v1]) => !!v1)
              .map(([k1]) => k1),
          ])
          .filter(([, v]) => Object.entries(v).length > 0)
      )
    ).toString();
  }, [value]);
  return [value, setValue];
}

function CheckboxList({
  options,
  value,
  setValue,
}: {
  options: string[];
  value: Record<string, boolean | undefined>;
  setValue: (v: string, k: boolean) => void;
}) {
  return (
    <>
      {options.map((s) => (
        <div>
          <label key={s}>
            <input
              type="checkbox"
              checked={value[s] || false}
              onChange={(e) => setValue(s, e.target.checked)}
            />
            {s}
          </label>
        </div>
      ))}
    </>
  );
}

function AppMenu({
  clusters,
  apps,
  namespaces,
  value,
  setValue,
}: {
  clusters: Record<string, string>;
  apps: string[];
  namespaces: string[];
  value: Record<
    "cluster" | "namespace" | "application",
    Record<string, boolean | undefined>
  >;
  setValue: (
    value?: Record<
      "cluster" | "namespace" | "application",
      Record<string, boolean | undefined>
    >
  ) => void;
}) {
  useEffect(() => {
    console.log(value);
  }, [value]);
  
  function handleClickClear() {
      setValue({
          cluster: {},
          namespace: {},
          application: {}
      })
  }

  return (
    <>
      <h3>Clusters</h3>
      <CheckboxList
        options={Object.keys(clusters)}
        value={value.cluster}
        setValue={(k, v) => {
          setValue({
            ...value,
            cluster: {
              ...value.cluster,
              [k]: v,
            },
          });
        }}
      />
      <h3>Namespaces</h3>
      <CheckboxList
        options={namespaces}
        value={value.namespace}
        setValue={(k, v) => {
          setValue({
            ...value,
            namespace: {
              ...value.namespace,
              [k]: v,
            },
          });
        }}
      />
      <h3>Applications</h3>
      <CheckboxList
        options={apps}
        value={value.application}
        setValue={(k, v) => {
          setValue({
            ...value,
            application: {
              ...value.application,
              [k]: v,
            },
          });
        }}
      />
      <button onClick={handleClickClear}>Clear</button>
    </>
  );
}

function noneSelected(filter: Record<string, boolean | undefined>) {
  return Object.values(filter).filter((v) => !!v).length === 0;
}

function ShowAllClusters({ clusters }: { clusters: Record<string, string> }) {
  const [filter, setFilter] = useHash<"cluster" | "namespace" | "application">({
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
        <AppMenu
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

function App() {
  // @ts-ignore
  const servers: Record<string, string> = window.servers || {
    Simulator: "ws://localhost:3004/ws",
  };
  return <ShowAllClusters clusters={servers} />;
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
