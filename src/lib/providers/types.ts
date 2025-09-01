export type Provider = "auto" | "runway" | "luma";
export type GenStatus = "pending" | "running" | "succeeded" | "failed";

export interface StartResult {
  id: string;
  provider: Provider;
}

export interface StatusResult {
  status: GenStatus;
  url?: string;
  raw?: any;
}
