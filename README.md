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
* For local cluster development with Minikube, you also need to install a docker registry on localhost:5000: `docker run -d -p 5000:5000 registry`

### Development with simulated cluster

If you don't want to deploy the aggregator in a cluster, it comes with a simulator. This is useful when developing the aggregator itself

1. `cd aggregator`
2. `vr run start`
3. In a new terminal: `cd dashboard`
4. `npm start`

### Deploying to a local Minikube Kubernetes cluster

1. `cd aggregator`
2. `vr run redeploy`

**NB: This assumes Docker registry running on localhost:5000**

To deploy on your own cluster:

1. Build the docker image with `vr run build`
2. `docker tag hugin-aggregator <your docker registry>/hugin-aggregator`
3. `docker push <your docker registry>/hugin-aggregator`
4. Create a copy of `aggregator/deployment/hugin-aggregator.yml` and update the url of the container image
5. Install a pull secret in your Kubernetes cluster named `deploy-secret`
6. `kubectl apply -f hugin-aggregator.yml`


### Running the dashboard with a cluster

1. Create a file in `dashboard/public/config/servers.js` with the following content: `window.servers = { <clustername>: "<URL to aggregator service>" };`
2. `npm start`

### Deploying the dashboard to a local Minikube Kubernetes cluster

1. `cd dashboard`
2. `npm run redeploy`

To deploy from another docker registry, update the image url in deployment/hugin-dashboard-minikube.yml

1. Build the docker image with `npm run docker:build`
2. `docker tag hugin-dashboard <your docker registry>/hugin-dashboard`
3. `docker push <your docker registry>/hugin-dashboard`
4. Create a copy of `aggregator/deployment/hugin-dashboard-minikube.yml` and update the url of the container image
5. Install a pull secret in your Kubernetes cluster named `deploy-secret`
6. `kubectl apply -f hugin-dashboard.yml`


To access other clusters from the dashboard, you can update the `hugin-config` configmap with a manifest like so:

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  namespace: kube-system
  name: hugin-config
data:
  servers.js: |+
    window.servers = {
      "My Cluster": "ws://hugin-aggregator-url.example.com/ws"
    };
```

1. Apply the configmap with `kubectl apply -f hugin-config.yml`
2. Restart the hugin-dashboard to apply the change `kubectl rollout restart deployment/hugin-dashboard`
