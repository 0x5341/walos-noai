import { $ } from "bun";
import { wit as wit_schema } from "./json_types";
import * as v from "valibot";

const path = import.meta.dirname;
const worldname = process.argv[2];

const wit_json = await $`wasm-tools component wit ${path} --json`.json();
const wit = v.parse(wit_schema, wit_json);

// Generate base type
const baseType = `// base types

export type Result<T, E> = ResultOK<T> | ResultErr<E>;
export interface ResultOK<T> { kind: "ok", value: T };
export interface ResultErr<E> { kind: "err", error: E };

export type Option<T> = OptionSome<T> | OptionNone;
export interface OptionSome<T> { kind: "some", value: T };
export interface OptionNone { kind: "none" };

export type S8 = number;
export type S16 = number;
export type S32 = number;
export type S64 = bigint;

export type U8 = number;
export type U16 = number;
export type U32 = number;
export type U64 = bigint;

export type F32 = number;
export type F64 = number;

export type Char = string;

export type Own<T> = T;
export type Borrow<T> = T;

export type Feature<T> = Promise<T>

export type StreamReadable<T> = ReadableStream<T>;
export type StreamWritable<T> = WritableStream<T>;
`;
const theworld = (() => {
  const theworlds = wit.worlds.filter((world) => world.name === worldname);
  if (theworlds.length === 0) {
    throw new Error(`World not found: ${worldname}`);
  }
  if (theworlds.length > 1) {
    throw new Error(`Multiple worlds found: ${worldname}`);
  }
  return theworlds[0]!;
})();
