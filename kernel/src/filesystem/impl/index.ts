import { Dexie, type EntityTable } from "dexie";
import type { ResultTE, ResultE } from "../../util/result";
import type {
  Descriptor,
  DescriptorStat,
  DescriptorType,
  ErrorCode,
} from "../interface";

export type BrowserFSRootOption = {
  opfsRoot: FileSystemDirectoryHandle;
  dbName: string;
};

type MainDBFormat = {
  path: string[];
  cid: string;
  type: DescriptorType;
  size: bigint;

  lastAccessed: bigint; // only seconds
  lastModified: bigint; // only seconds
  lastStatusChanged: bigint; // only seconds

  // type species
  symlinkTarget?: string;
};

type DB = Dexie & {
  main: EntityTable<MainDBFormat, "path">;
};

export class BrowserDescriptor implements Descriptor {
  static async createRoot(
    option: BrowserFSRootOption,
  ): Promise<BrowserDescriptor> {
    const { opfsRoot, dbName } = option;

    // create opfs
    const contentsHandle = await opfsRoot.getDirectoryHandle("contents", {
      create: true,
    });

    const db = new Dexie(dbName) as DB;
    db.version(1).stores({
      main: "*path, cid", // type, lastModified, size
    });
    await db.open();

    return new BrowserDescriptor([], contentsHandle, db);
  }

  public readonly path: string[];
  private db?: DB;
  private dbName: string;
  private contentsHandle: FileSystemDirectoryHandle;

  private constructor(
    path: string[],
    contentsHandle: FileSystemDirectoryHandle,
    db_or_name: DB | string,
  ) {
    this.path = path;
    if (typeof db_or_name === "string") {
      this.dbName = db_or_name;
    } else {
      this.db = db_or_name;
      this.dbName = db_or_name.name;
    }
    this.contentsHandle = contentsHandle;
  }

  private async getDB(): Promise<DB> {
    if (!this.db) {
      const db = new Dexie(this.dbName) as DB;
      await db.open();
      this.db = db;
    }
    return this.db;
  }

  async getType(): Promise<ResultTE<DescriptorType, ErrorCode>> {
    const db = await this.getDB();
    const entry = await db.main.get(this.path);
    if (!entry) {
      return { kind: "error", err: "no-entry" };
    }
    return { kind: "ok", ok: entry.type };
  }
  async stat(): Promise<ResultTE<DescriptorStat, ErrorCode>> {
    const db = await this.getDB();
    const entry = await db.main.get(this.path);
    if (!entry) {
      return { kind: "error", err: "no-entry" };
    }

    switch (entry.type) {
      case "hardlink":
        const count = await db.main.where("cid").equals(entry.cid).count();
        return {
          kind: "ok",
          ok: {
            type: entry.type,
            linkCount: count,
            size: entry.size,

            lastAccessed: { seconds: entry.lastAccessed, nanoseconds: 0 },
            lastModified: { seconds: entry.lastModified, nanoseconds: 0 },
            lastStatusChanged: {
              seconds: entry.lastStatusChanged,
              nanoseconds: 0,
            },
          },
        };

      case "symlink":
      case "file":
      case "directory":
        return {
          kind: "ok",
          ok: {
            type: entry.type,
            linkCount: 1,
            size: entry.size,

            lastAccessed: { seconds: entry.lastAccessed, nanoseconds: 0 },
            lastModified: { seconds: entry.lastModified, nanoseconds: 0 },
            lastStatusChanged: {
              seconds: entry.lastStatusChanged,
              nanoseconds: 0,
            },
          },
        };

      default:
        throw new Error(`Unknown descriptor type: ${entry.type}`);
    }
  }
  async read(): Promise<
    [ReadableStream<Uint8Array>, Promise<ResultE<ErrorCode>>]
  > {}
  write(data: ReadableStream<Uint8Array>): Promise<ResultE<ErrorCode>> {
    throw new Error("Method not implemented.");
  }
  sync(): Promise<ResultE<ErrorCode>> {
    throw new Error("Method not implemented.");
  }
  createDirectoryAt(path: string): Promise<ResultE<ErrorCode>> {
    throw new Error("Method not implemented.");
  }
  createSymlinkAt(
    oldPath: string,
    newPath: string,
  ): Promise<ResultE<ErrorCode>> {
    throw new Error("Method not implemented.");
  }
  createHardlinkAt(
    oldPath: string,
    newDescriptor: Descriptor,
    newPath: string,
  ): Promise<ResultE<ErrorCode>> {
    throw new Error("Method not implemented.");
  }
  [Symbol.asyncDispose](): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
