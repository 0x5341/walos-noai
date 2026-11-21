export class RPCPort<Map> {
  public port?: MessagePort;

  public constructor(port?: MessagePort) {
    this.port = port;
  }

  public  async call<Method extends keyof Map>(
    method: Method,
    data: LookUp<Map, Method>[0],
    transfer: Transferable[],
  ): Promise<LookUp<Map, Method>[1]> {
    return new Promise((resolve, _) => {
      const id = Math.floor(Math.random() * 1_000_000),
       listener = (event: MessageEvent) => {
        const msg = event.data as RPCMsg;
        if (msg.type === "response" && msg.id === id) {
          this.port?.removeEventListener("message", listener);
          resolve(msg.data);
        }
      };
      this.port?.addEventListener("message", listener);
      this.port?.postMessage({ data, id, method, type: "request" }, transfer);
    });
  }

  public connect(handler: HandlerList<Map>) {
    addEventListener("message", async (event: MessageEvent) => {
      const msg = event.data as RPCMsg;
      if (msg.type === "request" && msg.method in handler) {
        const response = await handler[msg.method as keyof Map](
          msg.data,
        );
        this.port?.postMessage(
          {
            data: response[0],
            id: msg.id,
            method: msg.method,
            type: "response",
          },
          response[1],
        );
      }
    });
  }
}

export interface RPCMsg {
  method: string;
  type: "request" | "response";
  id: number;
  data: unknown;
}

type LookUp<Map, Key> = Key extends keyof Map
  ? Map[Key] extends [infer Arg, infer Res]
    ? [Arg, Res]
    : never
  : never;

type HandlerList<Map> = {
  [K in keyof Map]: (
    arg: LookUp<Map, K>[0],
  ) => Promise<[LookUp<Map, K>[1], Transferable[]]>;
};
