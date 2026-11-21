import type { ResultE, ResultTE } from "../util/result";

export interface Instant {
  seconds: bigint; // s64
  nanoseconds: number; // u32
}

export type Filesize = bigint;

export type DescriptorType =
  | "block-device"
  | "character-device"
  | "directory"
  | "fifo"
  | "symbolic-link"
  | "regular-file"
  | "socket"
  | string
  | null;

export enum DescriptorFlags {
  Read = Math.trunc(1),
  Write = 1 << 1,
  FileIntegritySync = 1 << 2,
  DataIntegritySync = 1 << 3,
  RequestedWriteSync = 1 << 4,
  MutateDirectory = 1 << 5,
}
export type DescriptorFlagsType = number;

export interface DescriptorStat {
  type: DescriptorType;
  linkCount: number;
  size: bigint;

  lastAccessed: Instant | null;
  lastModified: Instant | null;
  lastStatusChanged: Instant | null;
}

export enum PathFlags {
  SymlinkFollow = Math.trunc(1),
}
export type PathFlagsType = number;

export enum OpenFlags {
  Create = Math.trunc(1),
  Directory = 1 << 1,
  Exclusive = 1 << 2,
  Truncate = 1 << 3,
}
export type OpenFlagsType = number;

export type LinkCount = number;

export type NewTimestamp = "no-change" | "now" | Instant;

export interface DirectoryEntry {
  type: DescriptorType;
  name: string;
}

export type ErrorCode =
  | "access"
  | "already"
  | "bad-descriptor"
  | "busy"
  | "deadlock"
  | "quota"
  | "exist"
  | "file-too-large"
  | "illegal-byte-sequence"
  | "in-progress"
  | "invalid"
  | "io"
  | "is-directory"
  | "loop"
  | "too-many-links"
  | "message-size"
  | "name-too-long"
  | "no-device"
  | "no-entry"
  | "no-lock"
  | "insufficient-memory"
  | "insufficient-space"
  | "not-directory"
  | "not-empty"
  | "not-recoverable"
  | "unsupported"
  | "no-tty"
  | "no-such-device"
  | "overflow"
  | "not-permitted"
  | "pipe"
  | "read-only"
  | "invalid-seek"
  | "text-file-busy"
  | "cross-device"
  | string
  | null;

export type Advice =
  "normal" | "sequential" | "random" | "will-need" | "dont-need" | "no-reuse";

export interface MetadataHashValue {
  lower: bigint;
  upper: bigint;
}

export interface Descriptor {
  // Always
  getType(): Promise<ResultTE<DescriptorType, ErrorCode>>;
  stat(): Promise<ResultTE<DescriptorStat, ErrorCode>>;
  getFlags(): Promise<ResultTE<DescriptorFlags, ErrorCode>>;
  [Symbol.asyncDispose](): Promise<void>;

  // For file & directory
  setTimes();

  // For file
  read(
    offset: Filesize,
  ): Promise<[ReadableStream<Uint8Array>, Promise<ResultE<ErrorCode>>]>;
  write(
    data: ReadableStream<Uint8Array>,
    offset: Filesize,
  ): Promise<ResultE<ErrorCode>>;
  append(data: ReadableStream<Uint8Array>): Promise<ResultE<ErrorCode>>;
  advice(
    offset: Filesize,
    length: Filesize,
    advice: Advice,
  ): Promise<ResultE<ErrorCode>>;
  sync(): Promise<ResultE<ErrorCode>>;
  setSize(size: Filesize): Promise<ResultE<ErrorCode>>;

  // For directory
  createDirectoryAt(path: string): Promise<ResultE<ErrorCode>>;
  createSymlinkAt(
    oldPath: string,
    newPath: string,
  ): Promise<ResultE<ErrorCode>>;
  createHardlinkAt(
    oldPath: string,
    newDescriptor: Descriptor,
    newPath: string,
  ): Promise<ResultE<ErrorCode>>;
}
