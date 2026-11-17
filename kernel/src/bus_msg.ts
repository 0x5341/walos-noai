import type { KernelOption } from "./kernel_option";
import type { ProcessID } from "./process/pid";
import type { ProcessContext } from "./process/process_context";

export type BusMsg = {
  isKernelInitialized: [void, boolean];
  kernelInitialize: [KernelOption, void];
  spawnHostProcess: [void, ProcessID | "alreadySpawned"];
  getHostProcessContext: [void, ProcessContext];
};
