import { RPCPort } from "./util/rpcport";
import type { BusMsg } from "./bus_msg";

export class KernelBus {
  private worker!: SharedWorker;
  private rpcport!: RPCPort<BusMsg>;

  public async create(option?: KernelBusOption): Promise<KernelBus> {
    const opt = kernelBusOptionWithDefault(option);
    this.worker = new SharedWorker(opt.workerUrl, { name: opt.kernelName });
    this.rpcport = new RPCPort(this.worker.port);

    if (!(await this.rpcport.call("isKernelInitialized", undefined, []))) {
    }

    return this;
  }
}

export type KernelBusOption = {
  workerUrl?: string;
  kernelName?: string;
};

function kernelBusOptionWithDefault(
  option?: KernelBusOption,
): Required<KernelBusOption> {
  return {
    workerUrl: option?.workerUrl ?? "./kernel.worker.js",
    kernelName: option?.kernelName ?? "walos-kernel",
  };
}
