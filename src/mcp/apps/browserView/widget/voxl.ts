export interface VoxlStream {
  kind: "voxl";
  url: string;
  page: { width: number; height: number };
  window: { left: number; top: number; width: number; height: number };
}

export interface VoxlConnection {
  close: () => void;
}

const VIDEO = 0x01;
const HEADER_BYTES = 16;

interface Stripe {
  decoder: VideoDecoder | null;
  codec: string | null;
  waitingKey: boolean;
  stamp: number;
}

function socketUrl(stream: VoxlStream): string {
  const address = new URL("ws", stream.url.endsWith("/") ? stream.url : `${stream.url}/`);
  address.protocol = address.protocol === "https:" ? "wss:" : "ws:";
  address.search = new URL(stream.url).search;
  return address.toString();
}

function codecOf(data: Uint8Array): string | null {
  for (let index = 0; index + 7 < data.length; index++) {
    const start = data[index] === 0 && data[index + 1] === 0 && data[index + 2] === 1 ? index + 3 : data[index] === 0 && data[index + 1] === 0 && data[index + 2] === 0 && data[index + 3] === 1 ? index + 4 : -1;
    if (start < 0 || (data[start] & 0x1f) !== 7) continue;
    const hex = (value: number) => value.toString(16).padStart(2, "0");
    return `avc1.${hex(data[start + 1])}${hex(data[start + 2])}${hex(data[start + 3])}`;
  }
  return null;
}

export function voxlSupported(): boolean {
  return typeof WebSocket !== "undefined" && typeof VideoDecoder !== "undefined" && typeof EncodedVideoChunk !== "undefined";
}

export function connectVoxl(stream: VoxlStream, canvas: HTMLCanvasElement, onFrame: () => void, onLost: (reason: string) => void): VoxlConnection {
  const context = canvas.getContext("2d");
  const socket = new WebSocket(socketUrl(stream));
  socket.binaryType = "arraybuffer";
  const stripes = new Map<number, Stripe>();
  let layout: [number, number][] = [[0, 0]];
  let closed = false;
  const send = (text: string) => {
    if (socket.readyState === WebSocket.OPEN) socket.send(text);
  };
  const lose = (reason: string) => {
    if (closed) return;
    closed = true;
    for (const stripe of stripes.values()) if (stripe.decoder && stripe.decoder.state !== "closed") stripe.decoder.close();
    try {
      socket.close();
    } catch {
    }
    onLost(reason);
  };
  const stripeOf = (index: number): Stripe => {
    let stripe = stripes.get(index);
    if (!stripe) {
      stripe = { decoder: null, codec: null, waitingKey: true, stamp: 0 };
      stripes.set(index, stripe);
    }
    return stripe;
  };
  socket.addEventListener("open", () => {
    send("v,1");
    send("au,0");
  });
  socket.addEventListener("close", () => lose("voxlClosed"));
  socket.addEventListener("error", () => lose("voxlUnreachable"));
  socket.addEventListener("message", (event: MessageEvent<string | ArrayBuffer>) => {
    if (typeof event.data === "string") {
      let message: { t?: string; s?: number; w?: number; h?: number; stripes?: [number, number][] };
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (message.t === "ping" && typeof message.s === "number") send(`po,${message.s}`);
      if (message.t === "close") lose("voxlClosed");
      if (message.t === "hello" && typeof message.w === "number" && typeof message.h === "number") {
        canvas.width = message.w;
        canvas.height = message.h;
        layout = message.stripes?.length ? message.stripes : [[0, message.h]];
        stripes.clear();
      }
      return;
    }
    const bytes = new Uint8Array(event.data);
    if (bytes[0] !== VIDEO || bytes.length <= HEADER_BYTES) return;
    const key = (bytes[1] & 1) === 1;
    const frame = ((bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5]) >>> 0;
    const index = bytes[11];
    const data = bytes.subarray(HEADER_BYTES);
    const stripe = stripeOf(index);
    if (stripe.waitingKey && !key) {
      send("kf");
      send(`a,${frame}`);
      return;
    }
    if (key) {
      const codec = codecOf(data) ?? "avc1.640034";
      if (!stripe.decoder || stripe.decoder.state === "closed" || codec !== stripe.codec) {
        if (stripe.decoder && stripe.decoder.state !== "closed") stripe.decoder.close();
        const y = layout[index]?.[0] ?? 0;
        stripe.decoder = new VideoDecoder({
          output: (picture) => {
            context?.drawImage(picture, 0, y);
            picture.close();
            onFrame();
          },
          error: () => {
            stripe.waitingKey = true;
            send("kf");
          },
        });
        stripe.decoder.configure({ codec, optimizeForLatency: true });
        stripe.codec = codec;
      }
      stripe.waitingKey = false;
    }
    try {
      stripe.decoder?.decode(new EncodedVideoChunk({ type: key ? "key" : "delta", timestamp: ++stripe.stamp, data }));
    } catch {
      stripe.waitingKey = true;
      send("kf");
    }
    send(`a,${frame}`);
  });
  return { close: () => lose("voxlStopped") };
}
