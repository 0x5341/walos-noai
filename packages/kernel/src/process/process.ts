import type { ProcessID } from "./pid";
import type { CliErrorCode, ProcessContext, ResultNoT } from "./process_context";

type ErrorKind = "ok" | "error" | number;

class ExitError extends Error {
  kind: ErrorKind;
  static {
    this.prototype.name = "ExitError";
  }
  constructor(message = "", options: { kind?: ErrorKind } = {}) {
    const { kind, ...rest } = options;
    super(message, rest);
    this.kind = kind ?? "ok";
  }
}

export abstract class Process {
  readonly pid: ProcessID;
  readonly ppid: ProcessID;
  readonly environment: Record<string, string>;
  readonly args: string[];
  readonly stdin: ReadableStream<Uint8Array>;
  readonly stdout: ReadableStream<Uint8Array>;
  readonly stderr: ReadableStream<Uint8Array>;

  constructor(option: ProcessSpawnOption) {
    this.pid = option.pid;
    this.ppid = option.ppid;
    this.environment = option.environment;
    this.args = option.args;

    this.stdin = option.stdin;
    this.stdout = option.stdout;
    this.stderr = option.stderr;
  }

  private mkProcessContext(): ProcessContext {
    const self = this;

    return {
      cli: {
        environment: {
          getEnvironment() {
            return Promise.resolve(self.environment);
          },
          getArguments() {
            return Promise.resolve(self.args);
          },
          getInitialCwd() {
            if (self.environment["CWD"]) {
              return Promise.resolve(self.environment["CWD"]);
            } else {
              return Promise.resolve(undefined);
            }
          },
        },
        exit: {
          exit(status) {
            if (status.kind === "ok") {
              throw new ExitError("", { kind: "ok" });
            } else {
              throw new ExitError("", { kind: "error" });
            }
          },
          exitWithCode(statusCode) {
            throw new ExitError("", { kind: statusCode });
          },
        },
        stdin: {
          async readViaStream() {
            let resolver: (value: ResultNoT<CliErrorCode> | PromiseLike<ResultNoT<CliErrorCode>>) => void;
            const promise = new Promise<ResultNoT<CliErrorCode>>((r) => { resolver = r; });
            const stream = new TransformStream<Uint8Array, Uint8Array>({
              async flush(ctl) {
                ctl.
              }
            });
            const stream2 = self.stdin.pipeThrough(stream);
            return [stream2, promise];
          },
        },
        stdout: {
          async writeViaStream(data) {
            let resolver: ((value: ResultNoT<CliErrorCode> | PromiseLike<ResultNoT<CliErrorCode>>) => void);
            const promise = new Promise<ResultNoT<CliErrorCode>>((resolve) => { resolver = resolve; });
            const stream = new TransformStream<Uint8Array, Uint8Array>({
              async flush() {
                resolver({ kind: "error", err: "pipe" });
              }
            })
            const stream2 = self.stdout.pipeThrough(stream);

          }
        }
      },
    }
  }

  public async run(): Promise<void> {
    try {
      await this.start();
    } catch (err) {
      if 
    }
  }

  abstract init(): Promise<void>;
  abstract start(): Promise<void>;
}

export type ProcessSpawnOption = {
  pid: ProcessID;
  ppid: ProcessID;
  environment: Record<string, string>;
  args: string[];

  stdin: ReadableStream<Uint8Array>;
  stdout: ReadableStream<Uint8Array>;
  stderr: ReadableStream<Uint8Array>;
};
