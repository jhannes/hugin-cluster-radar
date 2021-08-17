import {FilterRecord} from "../lib/filterRecord.tsx";

export type PodPhase =
  | "Pending"
  | "Running"
  | "Succeeded"
  | "Terminated"
  | "Failed";

export interface HuginStatus<T> {
  name: string;
  app: string;
  namespace: string;
  phase: PodPhase;
  startTime?: Date;
  lastContact?: Date;
  lastError?: Date;
  statusFunction?: () => Promise<T>;
  status?: T;
  podStatus?: PodStatus;
  logs?: string;
}

export interface PodStatus {
  conditions?: Array<PodCondition>;
  containerStatuses?: Array<ContainerStatus>;
  phase?: string;
}

interface ContainerStatus {
  containerID?: string;
  image: string;
  imageID: string;
  lastState?: ContainerState;
  message?: string;
  name: string;
  ready: boolean;
  restartCount: number;
  started?: boolean;
  state?: ContainerState;
}

export interface ContainerState {
  running?: ContainerStateRunning;
  terminated?: ContainerStateTerminated | null;
  waiting?: ContainerStateWaiting | null;
}

interface ContainerStateRunning {
  startedAt?: Date;
}

interface ContainerStateTerminated {
  containerID?: string;
  exitCode: number;
  finishedAt?: Date;
  message?: string;
  reason?: string;
  signal?: number;
  startedAt?: Date;
}

interface ContainerStateWaiting {
  message?: string;
  reason?: string;
}

export interface PodCondition {
  lastProbeTime?: Date;
  lastTransitionTime?: Date;
  message?: string;
  reason?: string;
  status: string;
  type: string;
}

export type PodStatusTree<T> = Record<
  string,
  Record<string, Record<string, HuginStatus<T>>>
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