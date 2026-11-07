import type { ProcessID } from "./process/pid";

export type BusMsg = {
  isKernelInitialized: [void, boolean];
  kernelInitialize: [void, void];
  spawnHostProcess: [void, [boolean, ProcessID, string]];
  getHostProcessContext: [ProcessID, null];
};
