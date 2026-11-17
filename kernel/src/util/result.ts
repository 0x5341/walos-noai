export type ResultTE<T, E> = { kind: "ok"; ok: T } | { kind: "error"; err: E };
export type Result = ResultTE<undefined, undefined>;
export type ResultT<T> = ResultTE<T, undefined>;
export type ResultE<E> = ResultTE<undefined, E>;
