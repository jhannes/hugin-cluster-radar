import {FilterRecord} from "../lib/filterRecord.tsx";

export type PodPhase =
  | "Pending"
  | "Running"
  | "Succeeded"
  | "Terminated"
  | "Failed";

export interface PodStatus<T> {
  name: string;
  app: string;
  namespace: string;
  phase: PodPhase;
  startTime?: Date;
  lastContact?: Date;
  lastError?: Date;
  statusFunction?: () => Promise<T>;
  status?: T;
}

export type PodStatusTree<T> = Record<
  string,
  Record<string, Record<string, PodStatus<T>>>
>;

export interface BwStatus {
  gitCommit?: string;
  version?: string;
  buildTime?: Date;
  traffic?: number;
  errors?: number;
  errorMessages?: Record<string, string>;
  cpu?: string;
  memory?: string;
  healthChecks?: Record<
    string,
    { healthy: boolean; message?: string; timestamp: Date }
  >;
}

export type PodFilter = FilterRecord<"cluster" | "namespace" | "application">;