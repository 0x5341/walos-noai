import type { ProcessID } from "./pid";
import type { CliErrorCode, ProcessContext, ResultE } from "./process_context";

type ErrorKind = "ok" | "error" | number;

class ExitError extends Error {
  public kind: ErrorKind;
  static {
    this.prototype.name = "ExitError";
  }
  public constructor(options: { kind: ErrorKind }) {
    const { kind, ...rest } = options;
    super(`Exit with kind:${kind}`, rest);
    this.kind = kind ?? "ok";
  }
}

export abstract class Process {
  public readonly pid: ProcessID;
  public readonly ppid: ProcessID;
  public readonly environment: Record<string, string>;
  public readonly args: string[];
  public readonly stdin: ReadableStream<Uint8Array>;
  public readonly stdout: WritableStream<Uint8Array>;
  public readonly stderr: WritableStream<Uint8Array>;

  public constructor(option: ProcessSpawnOption) {
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
           async getArguments() {
            return Promise.resolve(self.args);
          },
           async getEnvironment() {
            return Promise.resolve(self.environment);
          },
           async getInitialCwd() {
            if (self.environment.CWD) {
              return Promise.resolve(self.environment.CWD);
            } else {
              return Promise.resolve(undefined);
            }
          },
        },
        exit: {
          exit(status) {
            if (status.kind === "ok") {
              throw new ExitError({ kind: "ok" });
            } else {
              throw new ExitError({ kind: "error" });
            }
          },
          exitWithCode(statusCode) {
            throw new ExitError({ kind: statusCode });
          },
        },
        stderr: {
          async writeViaStream(data) {
            return data
              .pipeTo(self.stderr)
              .then(() => {
                return {
                  kind: "ok",
                  ok: undefined,
                } satisfies ResultE<CliErrorCode>;
              })
              .catch(() => {
                return {
                  kind: "error",
                  err: "pipe",
                } satisfies ResultE<CliErrorCode>;
              });
          },
        },
        stdin: {
          readViaStream() {
            let resolver: (result: ResultE<CliErrorCode>) => void;
            const promise = new Promise<ResultE<CliErrorCode>>((resolve) => {
              resolver = resolve;
            });

            const reader = self.stdin.getReader({ mode: "byob" });
            const stream = new ReadableStream<Uint8Array>({
              type: "bytes",
              autoAllocateChunkSize: 1024,
              async pull(ctl) {
                try {
                  const buffer = new Uint8Array(1024);
                  const { done, value } = await reader.read(buffer);
                  if (done) {
                    resolver({ kind: "ok", ok: undefined });
                    ctl.close();
                  } else {
                    ctl.enqueue(value);
                  }
                } catch (err) {
                  resolver({ kind: "error", err: "pipe" });
                  ctl.error(err);
                }
              },
              cancel(reason) {
                void reader.cancel(reason);
                resolver({ kind: "error", err: "pipe" });
              },
            });

            return [stream, promise];
          },
        },
        stdout: {
          async writeViaStream(data) {
            // let resolver: (result: ResultE<CliErrorCode>) => void;
            // const promise = new Promise<ResultE<CliErrorCode>>((resolve) => { resolver = resolve; });

            // const stream = new WritableStream<Uint8Array>({
            //   async write(chunk, ctl) {
            //     try {
            //       await writer.write(chunk);
            //     } catch (err) {
            //       resolver({ kind: "error", err: "pipe" });
            //       await writer.abort(err);
            //       ctl.error(err);
            //     }
            //   },
            //   async close() {
            //     try {
            //       await writer.close();
            //       resolver({ kind: "ok", ok: undefined });
            //     } catch (err) {
            //       await writer.abort(err);
            //       resolver({ kind: "error", err: "pipe" });
            //     }
            //   },
            //   async abort(reason) {
            //     await writer.abort(reason);
            //     resolver({ kind: "error", err: "pipe" });
            //   }
            // })

            return data
              .pipeTo(self.stdout)
              .then(() => {
                return {
                  kind: "ok",
                  ok: undefined,
                } satisfies ResultE<CliErrorCode>;
              })
              .catch(() => {
                return {
                  kind: "error",
                  err: "pipe",
                } satisfies ResultE<CliErrorCode>;
              });
          },
        },
      },
    };
  }

  public async initial(): Promise<void> {
    await this.init();
  }

  public async run(): Promise<number> {
    try {
      const ctx = this.mkProcessContext();
      await this.start(ctx);
    } catch (error) {
      if (error instanceof ExitError) {
        if (error.kind === "ok") {
          return 0;
        } else if (error.kind === "error") {
          return 1;
        } else {
          return error.kind;
        }
      } else {
        throw error;
      }
    }
    return 0;
  }

  protected abstract init(): Promise<void>;
  protected abstract start(ctx: ProcessContext): Promise<void>;
}

export interface ProcessSpawnOption {
  pid: ProcessID;
  ppid: ProcessID;
  environment: Record<string, string>;
  args: string[];

  stdin: ReadableStream<Uint8Array>;
  stdout: WritableStream<Uint8Array>;
  stderr: WritableStream<Uint8Array>;
}
