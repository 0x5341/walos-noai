import type { BusMsg } from "./bus_msg";
import type { FSDirHandle } from "./interface/filesystem";
import type { Process } from "./process/process";
import { RPCPort } from "./util/rpcport";

export class Kernel {
  private fsroot!: FSDirHandle;
  private busport!: RPCPort<BusMsg>;
  private initialized = false;
  private processes: Array<Process> = [];
  private nextProcessID: number = 0;

  static create(option: KernelOption): Kernel {
    let kernel = new Kernel();
    const opt = kernelOptionWithDefault(option);

    kernel.fsroot = opt.fsroot;
    kernel.busport = new RPCPort();
    kernel.busHandleSet();

    return kernel;
  }

  private busHandleSet() {
    this.busport.connect({
      isKernelInitialized: async (_: void) => {
        return [this.initialized, []];
      },
      kernelInitialize: async (_: void) => {
        this.initialized = true;
        return [undefined, []];
      },
      spawnHostProcess: async (_: void) => {
        const pid = this.nextProcessID;
        this.nextProcessID++;

        const ppid = -1;

        
      },
    });
  }
}

export type KernelOption = {
  fsroot: FSDirHandle;
};

function kernelOptionWithDefault(option: KernelOption): Required<KernelOption> {
  return {
    fsroot: option.fsroot,
  };
}
