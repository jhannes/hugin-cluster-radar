import { ALL_POD_PHASES } from "./model.ts";
import { Random } from "../lib/Random.ts";
import { PodRepositoryEvent } from "./PodStatusRepository.ts";

const random = new Random(new Date().getDate());
const namespaces = ["superapp", "default", "some-ns"];
const apps = ["userapp", "loginapp", "updateapp", "salesapp", "reportapp"];

function statusFunction() {
  return async () => ({
    gitCommit: "gnglnl",
    errors: random.pickOne([0, 0, 0, 0, 0, 0, 0, 0, 1, 2]),
    traffic: random.nextInt(1000),
    healthChecks: {
      database: {
        healthy: true,
        timestamp: random.randomPastDateTime(),
      },
      "ressursRegister/http/quietTime": {
        healthy: true,
        message: "PT11S since last request",
        timestamp: random.randomPastDateTime(),
      },
    },
  });
}

export function generateEvent(repository: PodRepositoryEvent<unknown>) {
  const action = random.pickOne([
    "ADDED",
    "ADDED",
    "MODIFIED",
    "MODIFIED",
    "DELETED",
  ]);
  if (action === "ADDED") {
    const app = random.pickOne(apps);
    repository.onEvent(action, {
      namespace: random.pickOne(namespaces),
      app,
      name: app + "-" + random.randomChars(4) + "-" + random.randomChars(4),
      phase: "Pending",
      startTime: random.randomPastDateTime(),
      lastAttempt: new Date(),
      lastContact: new Date(),
      statusFunction: statusFunction(),
    });
  } else if (action === "MODIFIED") {
    const app = random.pickOne(Object.values(repository.pods));
    repository.onEvent(action, {
      ...app,
      phase: random.pickOne(ALL_POD_PHASES),
    });
  } else if (action === "DELETED") {
    const app = random.pickOne(Object.values(repository.pods));
    repository.onEvent(action, {
      ...app,
    });
  }
  log.trace("generating event", action);
}
