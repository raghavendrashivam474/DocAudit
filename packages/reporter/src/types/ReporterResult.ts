export type ReporterStatus = "success" | "failure";

export interface ReporterResult {
  readonly status:      ReporterStatus;
  readonly output:      string;
  readonly writtenPath?: string;
}
