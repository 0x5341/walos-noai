import { RPCPort } from "./util/rpcport";
import type { BusMsg } from "./bus_msg";
import type { KernelOption } from "./kernel_option";

export class KernelBus {
  private worker!: SharedWorker;
  private rpcport!: RPCPort<BusMsg>;

  public async create(
    option?: KernelBusOption,
    kernelOption?: KernelOption,
  ): Promise<KernelBus> {
    const opt = kernelBusOptionWithDefault(option);
    this.worker = new SharedWorker(opt.workerUrl, { name: opt.kernelName });
    this.rpcport = new RPCPort(this.worker.port);

    if (!(await this.rpcport.call("isKernelInitialized", undefined, []))) {
      if (kernelOption === undefined) {
        throw new Error(
          "Kernel is not initialized, please provide kernelOption",
        );
      }

      await this.rpcport.call("kernelInitialize", kernelOption, []);
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
