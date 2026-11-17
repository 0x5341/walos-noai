// based on wasi 0.3

import type { Result, ResultE } from "../util/result";

export interface ProcessContext {
  cli: CliCtx;
}

export interface CliCtx {
  environment: CliEnvironmentCtx;
  exit: CliExitCtx;
  stdin: CliStdinCtx;
  stdout: CliStdoutCtx;
  stderr: CliStderrCtx;
}

export interface CliEnvironmentCtx {
  getEnvironment(): Promise<Record<string, string>>;
  getArguments(): Promise<string[]>;
  getInitialCwd(): Promise<string | undefined>;
}

export interface CliExitCtx {
  exit(status: Result): Promise<void>;
  exitWithCode(statusCode: number): Promise<void>;
}

export type CliErrorCode = "io" | "illegal-byte-sequence" | "pipe";

export interface CliStdinCtx {
  readViaStream(): Promise<
    [ReadableStream<Uint8Array>, Promise<ResultE<CliErrorCode>>]
  >;
}

export interface CliStdoutCtx {
  writeViaStream(
    data: ReadableStream<Uint8Array>,
  ): Promise<ResultE<CliErrorCode>>;
}

export interface CliStderrCtx {
  writeViaStream(
    data: ReadableStream<Uint8Array>,
  ): Promise<ResultE<CliErrorCode>>;
}
