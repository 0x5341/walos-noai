import type { Process, ProcessSpawnOption } from "./process";
import type { ProcessContext } from "./process_context";

export class HostProcess implements Process {
  pid: number;
  ppid: number;
  ctx!: ProcessContext;

  constructor(option: ProcessSpawnOption) {
    this.pid = option.pid;
    this.ppid = option.ppid;
  }

  init(): Promise<void> {
    return new Promise((resolve, _reject) => resolve()); // without resolve, just keep running
  }

  private mkProcessContext(): ProcessContext {}

  run(): Promise<void> {
    return new Promise((_resolve, _reject) => {}); // without resolve, just keep running
  }
}

export 
