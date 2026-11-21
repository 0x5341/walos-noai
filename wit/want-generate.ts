export interface WalosProcessSpawn {
  spawn: (path: string, args: string[], env: string[]) => Promise<void>;
}

export interface WalosProcessSpawnSpawnHandle {
  terminate: () => Promise<void>;
}

export type WalosProcessProcessOnlySpawn = WalosProcessSpawn;
