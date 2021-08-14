import React from "react";
import ReactDOM from "react-dom";
import {AllClustersView} from "./clusterStatus/AllClustersView.tsx";

function App() {
  // @ts-ignore
  const servers: Record<string, string> = window.servers || {
    Simulator: "ws://localhost:3001/ws",
  };
  return <AllClustersView clusters={servers} />;
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
