import * as v from "valibot";

const witWorldId = v.number();
const witInterfaceId = v.number();
const witTypeId = v.number();
const witPackageId = v.number();

const witType = v.union([
  v.literal("bool"),
  v.literal("u8"),
  v.literal("u16"),
  v.literal("u32"),
  v.literal("u64"),
  v.literal("s8"),
  v.literal("s16"),
  v.literal("s32"),
  v.literal("s64"),
  v.literal("f32"),
  v.literal("f64"),
  v.literal("char"),
  v.literal("string"),
  witTypeId,
]);

const witFunction = v.object({
  name: v.string(),
  kind: v.union([
    v.literal("freestanding"),
    v.literal("async-freestanding"),
    v.literal("getter"),
    v.literal("setter"),
    v.object({ method: witTypeId }),
    v.object({ "async-method": witTypeId }),
    v.object({ "method-getter": witTypeId }),
    v.object({ "method-setter": witTypeId }),
    v.object({ static: witTypeId }),
    v.object({ "async-static": witTypeId }),
    v.object({ "static-getter": witTypeId }),
    v.object({ "static-setter": witTypeId }),
    v.object({ constructor: witTypeId }),
  ]),
  params: v.array(
    v.object({
      name: v.string(),
      ty: witType,
    }),
  ),
  result: v.optional(witType),
});

const witWorldItem = v.union([
  v.object({
    interface: v.object({
      id: witInterfaceId,
    }),
  }),
  v.object({
    function: witFunction, // TODO
  }),
  v.object({
    type: v.object({
      id: witTypeId,
    }),
  }),
]);

const witWorld = v.object({
  name: v.string(),
  imports: v.map(v.string(), witWorldItem),
  exports: v.map(v.string(), witWorldItem),
  package: v.optional(witPackageId),
});

const witInterface = v.object({
  name: v.string(),
  types: v.map(v.string(), witTypeId),
  functions: v.map(v.string(), witFunction),
  package: v.optional(witPackageId),
});

const witTypeDef = v.object({
  name: v.optional(v.string()),
  kind: v.union([
    v.object({
      record: v.object({
        fields: v.array(
          v.object({
            name: v.string(),
            ty: witType,
          }),
        ),
      }),
    }),
    v.literal("resource"),
    v.object({
      handle: v.union([
        v.object({
          own: witTypeId,
        }),
        v.object({
          borrow: witTypeId,
        }),
      ]),
    }),
    v.object({
      flags: v.object({
        flags: v.array(v.object({ name: v.string() })),
      }),
    }),
    v.object({
      tuple: v.object({
        types: v.array(witType),
      }),
    }),
    v.object({
      variant: v.object({
        cases: v.array(v.object({ name: v.string(), ty: v.optional(witType) })),
      }),
    }),
    v.object({
      enum: v.object({
        cases: v.array(v.object({ name: v.string() })),
      }),
    }),
    v.object({
      option: witType,
    }),
    v.object({
      result: v.object({
        ok: v.optional(witType),
        err: v.optional(witType),
      }),
    }),
    v.object({
      list: witType,
    }),
    v.object({
      map: v.tuple([witType, witType]),
    }),
    v.object({
      "fixed-length-list": v.tuple([witType, v.number()]),
    }),
    v.object({
      future: v.optional(witType),
    }),
    v.object({
      stream: v.optional(witType),
    }),
    v.object({
      type: witType,
    }),
  ]),
  owner: v.union([
    v.object({
      world: witWorldId,
    }),
    v.object({
      interface: witInterfaceId,
    }),
    v.literal("none"),
  ]),
});

const witPackage = v.object({
  name: v.string(),
  interfaces: v.map(v.string(), witInterfaceId),
  worlds: v.map(v.string(), witWorldId),
});

export const wit = v.object({
  worlds: v.array(witWorld),
  interfaces: v.array(witInterface),
  types: v.array(witTypeDef),
  packages: v.array(witPackage),
});

export type Wit = v.InferOutput<typeof wit>;
