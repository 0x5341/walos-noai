import { Process } from "../process";
import type { ProcessContext } from "../process_context";

export class HostProcess extends Process {
  public ctx: ProcessContext | undefined;
  public stdin_writer: WritableStream<Uint8Array>;
  public stdout_reader: ReadableStream<Uint8Array>;
  public stderr_reader: ReadableStream<Uint8Array>;

  public constructor(pid: number, ppid: number) {
    const stdin = new TransformStream<Uint8Array, Uint8Array>(),
     stdout = new TransformStream<Uint8Array, Uint8Array>(),
     stderr = new TransformStream<Uint8Array, Uint8Array>();

    super({
      pid,
      ppid,
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

  protected override init(): void {
    return;
  }
  protected override  async start(ctx: ProcessContext): Promise<void> {
    this.ctx = ctx;
    return new Promise(() => { /* empty */ });
  }
}
