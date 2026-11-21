import { $ } from "bun";

interface Wit {
  worlds: WitWorld[];
  interfaces: any[];
  types: WitType[];
  packages: WitPackage[];
}

interface WitWorld {
  name: string;
  imports: { [key: string]: { interface: { id: number } } };
  exports: { [key: string]: { interface: { id: number } } };
  package: number;
}

interface WitInterface {
  name: string;
  types: { [key: string]: number };
  functions: {
    [key: string]: {
      name: string;
      kind: WitFunctionKind;
      params: { name: string; type: number }[];
      result: number;
    };
  };
  package: number;
}

type WitFunctionKind =
  | "freestanding"
  | "async-freestading"
  | {
      method: number;
    };

interface WitType {
  name: string;
  kind: WitTypeType;
  owner: { interface: number };
  docs: { contents: string };
}

interface WitTypeType {
  type: string | number;
}

interface WitPackage {
  name: string;
  interfaces: { [key: string]: number };
  worlds: { [key: string]: number };
}

const path = import.meta.dirname;

const worldname = process.argv[2];

const wit = (await $`wasm-tools component wit ${path} --json`.json()) as Wit;

// generate base type
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
  const theworld = wit.worlds.filter((world) => world.name === worldname);
  if (theworld.length === 0) {
    throw new Error(`World not found: ${worldname}`);
  }
  if (theworld.length > 1) {
    throw new Error(`Multiple worlds found: ${worldname}`);
  }
  return theworld[0]!;
})();

type GeneratedType = {
  type: "alias";
  packageName: string;
  name: string;
  jstype: string;
  comment: string;
};

type GeneratedFunction = {
  name: string;
  args: { name: string; jstype: string }[];
  returnType: string;
  comment: string;
};

let generatedTypes: GeneratedType[] = [];
let generatedInterfaces: any[] = [];

function generateWorld(world: WitWorld) {
  for (const [key, value] of Object.entries(world.imports)) {
    const id = value.interface.id;
    const theinterface = wit.interfaces[id];
  }
}

function generateInterface(iface: WitInterface) {}

function generateType(type: WitType) {}

function generatePrefixName(pkg: WitPackage) {
  const rawName = pkg.name;
  const namespace = rawName;
}
