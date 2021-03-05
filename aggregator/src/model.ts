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

export interface PodStatus<T> {
  name: string;
  app: string;
  namespace: string;
  phase: PodPhase;
  startTime: Date;
  lastContact: Date;
  statusFunction?: () => Promise<T>;
  status?: T;
}
