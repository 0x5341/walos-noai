import { Process, type ProcessSpawnOption } from "./process";
import type { ProcessContext } from "./process_context";

export class HostProcess extends Process {
  public ctx: ProcessContext | undefined;
  public stdin_writer: WritableStream<Uint8Array>;
  public stdout_reader: ReadableStream<Uint8Array>;
  public stderr_reader: ReadableStream<Uint8Array>;

  constructor(pid: number, ppid: number) {
    const stdin = new TransformStream<Uint8Array, Uint8Array>();
    const stdout = new TransformStream<Uint8Array, Uint8Array>();
    const stderr = new TransformStream<Uint8Array, Uint8Array>();

    super({
      pid: pid,
      ppid: ppid,
      args: ["@walos/builtin/host"],
      environment: {},
      stdin: stdin.readable,
      stdout: stdout.writable,
      stderr: stderr.writable,
    });

    this.stdin_writer = stdin.writable;
    this.stdout_reader = stdout.readable;
    this.stderr_reader = stderr.readable;
  }

  protected override async init(): Promise<void> {
    return Promise.resolve();
  }
  protected override start(ctx: ProcessContext): Promise<void> {
    this.ctx = ctx;
    return new Promise(() => {});
  }
}
