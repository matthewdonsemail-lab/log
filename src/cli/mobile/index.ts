import { APP_PACKAGES, APPLE_NOT_BUILT, bindDevice, bindingOf, connectAndroid, createGeeLarkClient, inspectAndroid, inspectFolder, listUsbAndroid, unbindDevice } from "../../mobile/index.ts";
import type { MobileDevice } from "../../mobile/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

const PLATFORMS = Object.keys(APP_PACKAGES);

export const MOBILE_USAGE = [
  "Usage: log mobile android devices [--json]   (every Android phone this machine can reach: USB phones over adb, and GeeLark cloud phones when GEELARK_API_TOKEN is set)",
  "       log mobile android <platform> bind --account <name> (--device <serial> | --geelark <phoneId>) [--json]   (gives the account its phone, kept for good: one phone per account, one account per phone)",
  "       log mobile android <platform> unbind --account <name> [--json]   (only when the phone is gone; the account's next phone is bound again)",
  "       log mobile android <platform> inspect --account <name> [--open] [--json]   (connects the account's phone and records the screen: its UI tree and a screenshot, into the run folder; --open starts the platform's app first)",
  "       log mobile apple <platform> …   (not built yet: iPhones run through Appium XCUITest on a Mac worker, issue #81)",
  `Platforms: ${PLATFORMS.join(", ")}. The OS comes first because each one is reached differently: Android over ADB with uiautomator2 (Android platform-tools on PATH or LOG_ADB, and pip install uiautomator2 for LOG_PYTHON), GeeLark cloud phones over the same ADB once GeeLark starts them (start, ADB on, adb connect, glogin). Bindings live in ~/.logCli/mobile/bindings.json (LOG_MOBILE_DIR). inspect taps nothing.`,
].join("\n");

export const MOBILE_INPUT: CommandInput = {
  forms: [
    {
      words: ["android", "devices"],
      summary: "Every Android phone this machine can reach: USB phones over adb, and GeeLark cloud phones when its key is set",
      positionals: [],
      flags: [JSON_FLAG],
    },
    {
      words: ["android"],
      effect: "write",
      summary: "One account's Android phone for a platform: bind it (one phone per account, kept for good), unbind it, or inspect it (its UI tree and a screenshot, nothing tapped)",
      positionals: [
        { name: "platform", kind: "enum", values: PLATFORMS, description: "The app the phone runs for this account", required: true },
        { name: "action", kind: "enum", values: ["bind", "unbind", "inspect"], description: "bind, unbind or inspect", required: true },
      ],
      flags: [
        { name: "account", kind: "string", description: "The account (its accountName)" },
        { name: "device", kind: "string", description: "bind: a USB phone's adb serial" },
        { name: "geelark", kind: "string", description: "bind: a GeeLark cloud phone's id" },
        { name: "open", kind: "boolean", description: "inspect: start the platform's app before reading the screen" },
        JSON_FLAG,
      ],
    },
    {
      words: ["apple"],
      summary: "iPhones: not built yet (Appium XCUITest on a Mac worker, issue #81)",
      positionals: [{ name: "rest", kind: "rest", description: "Anything after apple" }],
      flags: [],
    },
  ],
};

export const mobileDeps = { listUsb: () => listUsbAndroid(), geelark: () => createGeeLarkClient(), connect: connectAndroid, inspect: inspectAndroid, folder: inspectFolder };

function deviceLine(d: MobileDevice): string {
  return `  ${d.provider.padEnd(8)} ${d.id.padEnd(22)} ${d.state.padEnd(10)} ${d.name}${d.detail ? ` (${d.detail})` : ""}`;
}

export const mobileCommand: Command = {
  usage: MOBILE_USAGE,
  platform: "any",
  name: "mobile",
  effect: "write",
  input: MOBILE_INPUT,
  summary: "Real phones as a device layer: `log mobile android|apple <platform>`, one phone per account, USB phones over ADB and GeeLark cloud phones",
  args: "android devices | android <platform> bind|unbind|inspect --account <a> [--device <serial>|--geelark <id>] [--open] [--json]",
  async run(context, argv) {
    const [os, second] = argv;
    if (os === "apple") return { code: 1, stderr: `log mobile apple: appleNotBuilt: ${APPLE_NOT_BUILT}` };
    if (os !== "android") return { code: 1, stderr: `log mobile: say android or apple first\n${MOBILE_USAGE}` };
    if (second === "devices") {
      const parsed = parseArgs(argv.slice(2), parserSpecOf({ forms: [{ ...MOBILE_INPUT.forms[0], words: [] }] }));
      if (!parsed.ok) return { code: 1, stderr: `log mobile android devices: ${parsed.error}` };
      const usb = mobileDeps.listUsb();
      const lines: string[] = [];
      const devices: MobileDevice[] = [];
      if (usb.ok) devices.push(...usb.devices);
      else lines.push(`usb: ${usb.error}`);
      const listed = await mobileDeps.geelark().list();
      if (listed.ok) devices.push(...listed.data.map((p) => ({ os: "android" as const, provider: "geelark" as const, id: p.id, state: p.status, name: p.serialName, detail: p.detail })));
      else lines.push(`geelark: ${listed.error}`);
      if (parsed.flags["json"] === true) return { code: 0, stdout: JSON.stringify({ devices, notes: lines }, null, 2) };
      return { code: 0, stdout: [`log mobile android devices: ${devices.length} phone${devices.length === 1 ? "" : "s"}`, ...devices.map(deviceLine), ...lines.map((l) => `  ${l}`)].join("\n") };
    }
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...MOBILE_INPUT.forms[1], words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log mobile android: ${parsed.error}\n${MOBILE_USAGE}` };
    const [platform, action] = parsed.positionals;
    if (!platform || !PLATFORMS.includes(platform)) return { code: 1, stderr: `log mobile android: name the platform (${PLATFORMS.join(", ")})\n${MOBILE_USAGE}` };
    const account = typeof parsed.flags["account"] === "string" ? parsed.flags["account"].trim() : "";
    if (!account) return { code: 1, stderr: `log mobile android ${platform} ${action ?? ""}: --account is needed` };
    const json = parsed.flags["json"] === true;
    if (action === "bind") {
      const device = typeof parsed.flags["device"] === "string" ? parsed.flags["device"].trim() : "";
      const cloud = typeof parsed.flags["geelark"] === "string" ? parsed.flags["geelark"].trim() : "";
      if (!device === !cloud) return { code: 1, stderr: "log mobile android bind: give one of --device <serial> (a USB phone) or --geelark <phoneId> (a GeeLark cloud phone)" };
      const bound = bindDevice({ account, platform, os: "android", provider: device ? "usb" : "geelark", deviceId: device || cloud, by: "log mobile android bind" });
      if (!bound.ok) return { code: 1, stderr: `log mobile android bind: ${bound.code}: ${bound.error}` };
      if (json) return { code: 0, stdout: JSON.stringify(bound, null, 2) };
      return { code: 0, stdout: `log mobile android ${platform} bind: ${account} ${bound.already ? "already has" : "now has"} ${bound.binding.provider} phone ${bound.binding.deviceId}` };
    }
    if (action === "unbind") {
      const gone = unbindDevice(account);
      if (!gone) return { code: 1, stderr: `log mobile android unbind: ${account} has no phone bound` };
      return { code: 0, stdout: json ? JSON.stringify({ unbound: gone }, null, 2) : `log mobile android ${platform} unbind: ${account} no longer has ${gone.provider} phone ${gone.deviceId}` };
    }
    if (action === "inspect") {
      const binding = bindingOf(account);
      if (!binding) return { code: 1, stderr: `log mobile android inspect: phoneNotBound: ${account} has no phone; bind one first (log mobile android ${platform} bind --account ${account} --device <serial> | --geelark <id>)` };
      context.err(`mobile: connecting ${account}'s ${binding.provider} phone ${binding.deviceId}`);
      const connected = await mobileDeps.connect(binding, undefined, (line) => context.err(`mobile: ${line}`));
      if (!connected.ok) return { code: 1, stderr: `log mobile android inspect: ${connected.code}: ${connected.error}` };
      const folder = mobileDeps.folder(account);
      const open = parsed.flags["open"] === true ? APP_PACKAGES[platform]!.android : null;
      context.err(`mobile: reading the screen of ${connected.connection.serial}${open ? ` after starting ${open}` : ""} into ${folder}`);
      const read = mobileDeps.inspect(connected.connection.serial, folder, open);
      if (!read.ok) return { code: 1, stderr: `log mobile android inspect: ${read.code}: ${read.error}` };
      if (json) return { code: 0, stdout: JSON.stringify({ binding, connection: connected.connection, ...read.result }, null, 2) };
      return { code: 0, stdout: [`log mobile android ${platform} inspect: ${account} on ${connected.connection.provider} ${connected.connection.serial}`, `  app on screen: ${read.result.currentApp || "unknown"}`, `  UI tree: ${read.result.elements} elements, ${read.result.hierarchy}`, `  screenshot: ${read.result.screenshot}`].join("\n") };
    }
    return { code: 1, stderr: `log mobile android ${platform}: say bind, unbind or inspect\n${MOBILE_USAGE}` };
  },
};
