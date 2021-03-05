Hugin: Cluster radar
====================

Hugin aggregates health checks from all labeled pods in Kubernetes clusters and displays these in a comprehensive dashboard.

It consists of an aggregator running in the clusters and a responsive web app dashboard.

The aggregator is deployed as a pod in a cluster. It uses the Kubernetes API to discover all pods with a "hugin"-label and polls these on their "monitoring-port". It publishes the results on websockets. The aggregator is implemented in Typescript and runs on Deno.

The dashboard listens to web sockets and generate a tree of the clusters, namespaces, apps and pods to display to the user. It updates in real-time. The dashboard is implemented in React with Typescript.

## Developers guide

### Pre-requisites

* Deno (for running the aggregator)
  * Veloraptor (for running scripts with Deno with the `vr`-command)
  * Kubectl must be in PATH to execute `vr run apply` and `vr run restart`
* Node (for compiling the React in the dashboard) - I'd like to use Deno for this eventually

### Development with simulated cluster

If you don't want to deploy the aggregator in a cluster, it comes with a simulator. This is useful when developing the aggregator itself

1. `cd aggregator`
2. `vr run start`
3. In a new terminal: `cd dashboard`
4. `npm start`

### Deploying to a Kubernetes cluster

**NB: `vr run push` and `vr run apply` assumes Docker registry running on localhost:5000** This will be improved going forward

1. `cd aggregator`
2. `vr run redeploy`

### Running the dashboard in a cluster

1. Create a file in `dashboard/public/config/servers.js` with the following content: `window.servers = { <clustername>: "<URL to aggregator service>" };`
2. `npm start`

