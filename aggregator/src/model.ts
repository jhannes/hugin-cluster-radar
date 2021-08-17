import {PodStatus} from "../deps.ts"

export type PodPhase =
  | "Pending"
  | "Running"
  | "Succeeded"
  | "Terminated"
  | "Failed"
  | "Offline";
export const ALL_POD_PHASES: PodPhase[] = [
  "Pending",
  "Running",
  "Succeeded",
  "Terminated",
  "Failed",
  "Offline",
];

export interface HuginStatus<T> {
  name: string;
  app: string;
  namespace: string;
  phase: PodPhase;
  startTime?: Date;
  lastAttempt?: Date;
  lastContact?: Date;
  lastError?: Date;
  statusFunction: () => Promise<T>;
  status?: T;
  podStatus?: PodStatus,
  logs?: string
}
