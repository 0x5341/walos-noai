import type { BusMsg } from "./bus_msg";
import type { FSDirHandle } from "./interface/filesystem";
import type { KernelOption } from "./kernel_option";
import { HostProcess } from "./process/kind/host";
import type { Process } from "./process/process";
import { RPCPort } from "./util/rpcport";

export class Kernel {
  private fsroot!: FSDirHandle;
  private busport: RPCPort<BusMsg>;
  private initialized = false;
  private processes: Array<Process> = [];
  private nextProcessID: number = 0;
  private hostProcess: HostProcess | undefined;

  constructor() {
    this.busport = new RPCPort();
    this.busHandleSet();
  }

  private checkInitialized() {
    if (!this.initialized) {
      throw new Error("Kernel is not initialized");
    }
  }

  private busHandleSet() {
    this.busport.connect({
      isKernelInitialized: async () => {
        return [this.initialized, []];
      },
      kernelInitialize: async (option) => {
        this.initialized = true;

        const opt = kernelOptionWithDefault(option);
        this.fsroot = opt.fsroot;

        return [undefined, []];
      },
      spawnHostProcess: async () => {
        this.checkInitialized();

        if (this.hostProcess !== undefined) {
          return ["alreadySpawned", []];
        }

        const pid = this.nextProcessID;
        this.nextProcessID++;

        const ppid = -1;

        const process = new HostProcess(pid, ppid);
        this.processes.push(process);
        this.hostProcess = process;
        process.initial();
        process.run();
        return [pid, []];
      },
      getHostProcessContext: async () => {
        this.checkInitialized();

        if (this.hostProcess === undefined) {
          throw new Error("Host process is not spawned");
        }
        
        if (this.hostProcess.ctx === undefined) {
          throw new Error("Host process context is not initialized");
        }

        return [this.hostProcess.ctx, []];
      },
    });
  }
}

function kernelOptionWithDefault(option: KernelOption): Required<KernelOption> {
  return {
    fsroot: option.fsroot,
  };
}
