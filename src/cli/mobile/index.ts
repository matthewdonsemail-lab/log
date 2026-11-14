import { createMobileRun, findMobileAccount, TWENTY_PLATFORM_BY_PLATFORM } from "../../mobile/device/index.ts";
import type { MobileDeviceInfo, MobileDeviceRecord, MobileDriver, MobileNetworkCapture, MobileOs, MobileServices } from "../../mobile/device/index.ts";
import { findPhoneOfAccount, findPhoneOfSerial, mobileDeviceId, pickOnePhone } from "../../mobile/device/index.ts";
import { SNAPCHAT_ANDROID_APP } from "../../mobile/android/snapchat/index.ts";
import type { PlatformAccount } from "../../platformKit/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError, refuseInput, renderTable } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput, CommandResult, FlagSpec } from "../runner/types.ts";

export const MOBILE_OSES = ["android", "apple"] as const;
export const MOBILE_ACTIONS = ["devices", "attach", "state", "open", "inspect"] as const;

const ACCOUNT_FLAG: FlagSpec = { name: "account", kind: "string", required: true, description: "The SNAPCHAT socialAccount's accountName (its handle)" };
const SERIAL_FLAG: FlagSpec = { name: "serial", kind: "string", required: true, description: "The phone's own serial: the adb serial on Android, the UDID on Apple" };
const NETWORK_FLAG: FlagSpec = { name: "network", kind: "string", description: "The phone's own network route (the proxy it leaves through), kept with the attachment" };
const TAP_FLAG: FlagSpec = { name: "tap", kind: "string", description: "Tap one point on the screen as x,y in the screen's own pixels, then read the screen again" };

export const MOBILE_USAGE = [
  "Usage: log mobile android snapchat devices [--json]",
  "       log mobile android snapchat attach --account <accountName> --serial <serial> [--network <label>] [--json]",
  "       log mobile android snapchat state --account <accountName> [--json]",
  "       log mobile android snapchat open --account <accountName> [--json]",
  "       log mobile android snapchat inspect --account <accountName> [--tap <x,y>] [--json]",
  "       log mobile apple snapchat devices [--json]",
  "       log mobile apple snapchat attach --account <accountName> --serial <serial> [--network <label>] [--json]",
  "       log mobile apple snapchat state --account <accountName> [--json]",
  "       log mobile apple snapchat open --account <accountName> [--json]",
  "       log mobile apple snapchat inspect --account <accountName> [--tap <x,y>] [--json]",
  "One phone per account. Each account has a phone of its own, with its own app and its own network route, and its serial is kept on the account, the way each account has one browser profile.",
  "Android is reached over adb, iPhone over Apple's own device tooling, and every call names the phone's own serial, so nothing can land on the wrong phone. The phone is the truth about what the app did: the screen, the UI tree and the app's own network calls are recorded, the way a browser step is.",
  "Nothing is signed in for you: log in on the phone by hand. No credentials are asked for and none are kept.",
  "A phone of its own is not a clean slate. It does not clear an account's reputation, it does not stop a platform from restricting the account, and it does not stand in for the platform's rules or for the filters a community puts on a low standing account.",
].join("\n");

function form(words: string[], summary: string, flags: FlagSpec[]): CommandInput["forms"][number] {
  return { words, summary, positionals: [], flags };
}

export const MOBILE_INPUT: CommandInput = {
  forms: [
    form(["android", "snapchat", "devices"], "List the Android phones connected, and which account each one belongs to", [JSON_FLAG]),
    form(["android", "snapchat", "attach"], "Attach one Android phone to one account, and keep its network route with it", [ACCOUNT_FLAG, SERIAL_FLAG, NETWORK_FLAG, JSON_FLAG]),
    form(["android", "snapchat", "state"], "Read one account's own phone: online, its model, its Android version, the app in the front and its battery", [ACCOUNT_FLAG, JSON_FLAG]),
    form(["android", "snapchat", "open"], "Open Snapchat on the account's own phone", [ACCOUNT_FLAG, JSON_FLAG]),
    form(["android", "snapchat", "inspect"], "Open Snapchat on the account's own phone and record each step: the screen, the UI tree and the app's network calls", [ACCOUNT_FLAG, TAP_FLAG, JSON_FLAG]),
    form(["apple", "snapchat", "devices"], "List the iPhones connected, and which account each one belongs to", [JSON_FLAG]),
    form(["apple", "snapchat", "attach"], "Attach one iPhone to one account, and keep its network route with it", [ACCOUNT_FLAG, SERIAL_FLAG, NETWORK_FLAG, JSON_FLAG]),
    form(["apple", "snapchat", "state"], "Read one account's own iPhone: online, its model, its iOS version, the app in the front and its battery", [ACCOUNT_FLAG, JSON_FLAG]),
    form(["apple", "snapchat", "open"], "Open Snapchat on the account's own iPhone", [ACCOUNT_FLAG, JSON_FLAG]),
    form(["apple", "snapchat", "inspect"], "Open Snapchat on the account's own iPhone and record each step: the screen, the UI tree and the app's network calls", [ACCOUNT_FLAG, TAP_FLAG, JSON_FLAG]),
  ],
};

interface Route {
  os: MobileOs;
  platform: string;
  action: string;
  flags: Record<string, string | true>;
}

function parseRoute(argv: string[]): { ok: true; route: Route } | { ok: false; result: CommandResult } {
  const [os, platform, action, ...rest] = argv;
  if (!os || !platform || !action) {
    return { ok: false, result: refuseInput("mobile", "the route is log mobile <android|apple> <platform> <command>", MOBILE_USAGE) };
  }
  if (!(MOBILE_OSES as readonly string[]).includes(os)) {
    return { ok: false, result: refuseInput("mobile", `${os} is not an operating system log knows: ${MOBILE_OSES.join(" or ")}`, MOBILE_USAGE) };
  }
  if (platform !== "snapchat") {
    return { ok: false, result: refuseInput(`mobile ${os}`, `${platform} is not wired yet; Snapchat is the platform that works today.`, MOBILE_USAGE) };
  }
  if (!(MOBILE_ACTIONS as readonly string[]).includes(action)) {
    return { ok: false, result: refuseInput(`mobile ${os} ${platform}`, `pick one of ${MOBILE_ACTIONS.join(", ")}`, MOBILE_USAGE) };
  }
  const parsed = parseArgs(rest, parserSpecOf(MOBILE_INPUT));
  if (!parsed.ok) {
    return { ok: false, result: refuseInput(`mobile ${os} ${platform} ${action}`, parsed.error, MOBILE_USAGE) };
  }
  return { ok: true, route: { os: os as MobileOs, platform, action, flags: parsed.flags } };
}

function flagText(route: Route, name: string): string | null {
  const value = route.flags[name];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function driverOf(services: MobileServices, os: MobileOs): MobileDriver | null {
  return services.drivers.find((driver) => driver.os === os) ?? null;
}

async function resolveAccount(context: CommandContext, route: Route, accountName: string): Promise<{ ok: true; account: PlatformAccount } | { ok: false; result: CommandResult }> {
  const name = `mobile ${route.os} ${route.platform}`;
  const twentyPlatform = TWENTY_PLATFORM_BY_PLATFORM[route.platform];
  if (!twentyPlatform) {
    return { ok: false, result: refuse(name, "accountNotFound", `${route.platform} has no account platform to look in`) };
  }
  try {
    const account = await findMobileAccount(context.twenty, twentyPlatform, accountName);
    if (account.status === "deactivated") {
      return { ok: false, result: refuse(name, "accountNotUsable", `${account.accountName} is deactivated`) };
    }
    return { ok: true, account };
  } catch (error) {
    return { ok: false, result: refuseError(name, error) };
  }
}

function pickPhone(route: Route, records: MobileDeviceRecord[], accountName: string): { ok: true; phone: MobileDeviceRecord } | { ok: false; result: CommandResult } {
  const name = `mobile ${route.os} ${route.platform}`;
  const phones = findPhoneOfAccount(records, route.os, accountName);
  const picked = pickOnePhone(phones);
  if (picked.ok) return picked;
  if (picked.count === 0) {
    return { ok: false, result: refuse(name, "noPhoneAttached", `${accountName} has no phone of its own; attach one with --serial`) };
  }
  return { ok: false, result: refuse(name, "noPhoneSelected", `${accountName} has ${picked.count} phones attached; name one with --serial`) };
}

function deviceRow(device: MobileDeviceInfo): string[] {
  return [
    device.serial,
    device.state,
    device.model ?? "?",
    device.osVersion ?? "?",
    device.foregroundApp ?? "none",
    device.battery === null ? "?" : `${device.battery}%`,
  ];
}

function attachmentRow(phone: MobileDeviceRecord): string[] {
  return [phone.accountName, phone.serial, phone.os, phone.platform, phone.network ?? "none", phone.attachedAt];
}

function renderDevices(devices: MobileDeviceInfo[], attached: MobileDeviceRecord[]): string {
  const lines: string[] = [];
  if (devices.length === 0) {
    lines.push("No phones are connected.");
  } else {
    lines.push(`${devices.length} phone(s) connected:`);
    lines.push(renderTable(["serial", "state", "model", "android", "foreground app", "battery"], devices.map(deviceRow)));
  }
  lines.push("");
  if (attached.length === 0) {
    lines.push("No phone is attached to an account yet.");
  } else {
    lines.push(`${attached.length} attachment(s), one phone per account:`);
    lines.push(renderTable(["account", "serial", "os", "platform", "network", "attached"], attached.map(attachmentRow)));
  }
  return lines.join("\n");
}

function renderState(route: Route, phone: MobileDeviceRecord, device: MobileDeviceInfo): string {
  const name = `log mobile ${route.os} ${route.platform} state`;
  const parts = [
    `${phone.accountName} runs on ${device.serial}, which is ${device.state}`,
    device.model ? `(${device.model}${device.osVersion ? `, ${route.os === "android" ? "Android" : "iOS"} ${device.osVersion}` : ""})` : "",
    device.foregroundApp ? `, ${device.foregroundApp} is in the front` : ", nothing is in the front",
    device.battery === null ? "" : `, battery ${device.battery}%`,
  ].filter(Boolean);
  return `${name}: ${parts.join("")}.`;
}

function parseTap(route: Route, value: string | null): { ok: true; tap: { x: number; y: number } | null } | { ok: false; result: CommandResult } {
  if (!value) return { ok: true, tap: null };
  const parts = value.split(",").map((part) => part.trim());
  const x = Number(parts[0]);
  const y = Number(parts[1]);
  if (parts.length !== 2 || !Number.isInteger(x) || !Number.isInteger(y)) {
    return { ok: false, result: refuseInput(`mobile ${route.os} ${route.platform} inspect`, "--tap is one point as x,y in the screen's own pixels", MOBILE_USAGE) };
  }
  return { ok: true, tap: { x, y } };
}

async function wait(context: CommandContext, ms: number): Promise<void> {
  if (context.sleep) {
    await context.sleep(ms);
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureStep(
  context: CommandContext,
  driver: MobileDriver,
  serial: string,
  accountName: string,
  run: ReturnType<typeof createMobileRun>,
  action: string,
  taps: { x: number; y: number }[],
): Promise<{ network: MobileNetworkCapture | null }> {
  const screen = await driver.screenshot(serial).catch(() => null);
  const uiTree = await driver.uiTree(serial).catch(() => null);
  const network = await driver.networkCalls(serial).catch(() => null);
  const device = await driver.readState(serial).catch(() => null);
  run.add(
    {
      at: (context.now?.() ?? new Date()).toISOString(),
      action,
      serial,
      accountName,
      taps,
      foregroundApp: device?.foregroundApp ?? null,
      screen: screen ? "recorded" : null,
      uiTree: uiTree ? "recorded" : null,
      network,
    },
    screen,
    uiTree,
  );
  return { network };
}

export const mobileCommand: Command = {
  usage: MOBILE_USAGE,
  platform: "any",
  name: "mobile",
  effect: "read",
  input: MOBILE_INPUT,
  summary: "One phone per account: list the phones, attach one to an account, and read or drive the account's own phone",
  args: "<android|apple> <platform> <devices|attach|state|open|inspect> [--account <a>] [--serial <s>]",
  async run(context, argv) {
    const parsedRoute = parseRoute(argv);
    if (!parsedRoute.ok) return parsedRoute.result;
    const route = parsedRoute.route;
    const name = `mobile ${route.os} ${route.platform}`;
    const services = context.mobile;
    if (!services) return refuse(name, "deviceLayerNotWired");
    const driver = driverOf(services, route.os);
    if (!driver) return refuse(name, "appleDeviceNotWired", `no driver for ${route.os}`);
    const records = services.registry.read();
    try {
      if (route.action === "devices") {
        const devices = await driver.listDevices();
        const attached = records.filter((phone) => phone.os === route.os);
        if (route.flags["json"]) {
          return { code: 0, stdout: JSON.stringify({ os: route.os, devices, attached, registry: services.registry.path }, null, 2) };
        }
        return { code: 0, stdout: renderDevices(devices, attached) };
      }

      const accountName = flagText(route, "account");
      if (!accountName) return refuseInput(`${name} ${route.action}`, "--account is needed", MOBILE_USAGE);
      const resolved = await resolveAccount(context, route, accountName);
      if (!resolved.ok) return resolved.result;
      const account = resolved.account;

      if (route.action === "attach") {
        const serial = flagText(route, "serial");
        if (!serial) return refuseInput(`${name} attach`, "--serial is needed", MOBILE_USAGE);
        const held = findPhoneOfSerial(records, route.os, serial);
        if (held.length) return refuse(name, "phoneAlreadyAttached", `${serial} is already attached to ${held[0].accountName}`);
        const mine = findPhoneOfAccount(records, route.os, account.accountName);
        if (mine.length) return refuse(name, "phoneAlreadyAttached", `${account.accountName} already runs on ${mine[0].serial}`);
        const devices = await driver.listDevices();
        const device = devices.find((entry) => entry.serial === serial);
        if (!device) return refuse(name, "phoneNotFound", `${serial} is not connected`);
        if (device.state !== "online") return refuse(name, "phoneNotOnline", `${serial} is ${device.state}`);
        const phone: MobileDeviceRecord = {
          id: mobileDeviceId(route.os, serial),
          os: route.os,
          serial,
          accountName: account.accountName,
          platform: route.platform,
          network: flagText(route, "network"),
          attachedAt: (context.now?.() ?? new Date()).toISOString(),
        };
        services.registry.write([...records, phone]);
        if (route.flags["json"]) return { code: 0, stdout: JSON.stringify({ attached: phone, registry: services.registry.path }, null, 2) };
        return { code: 0, stdout: `log ${name} attach: ${account.accountName} now runs on ${serial} (${device.model ?? "phone"}${device.osVersion ? `, ${route.os === "android" ? "Android" : "iOS"} ${device.osVersion}` : ""}), kept in ${services.registry.path}.` };
      }

      const picked = pickPhone(route, records, account.accountName);
      if (!picked.ok) return picked.result;
      const phone = picked.phone;

      if (route.action === "state") {
        const device = await driver.readState(phone.serial);
        if (device.state !== "online") return refuse(name, "phoneNotOnline", `${phone.serial} is ${device.state}`);
        if (route.flags["json"]) return { code: 0, stdout: JSON.stringify({ account: account.accountName, phone, device }, null, 2) };
        return { code: 0, stdout: renderState(route, phone, device) };
      }

      if (route.action === "open") {
        await driver.openApp(phone.serial, SNAPCHAT_ANDROID_APP.packageName);
        const device = await driver.readState(phone.serial);
        if (route.flags["json"]) return { code: 0, stdout: JSON.stringify({ account: account.accountName, phone, device }, null, 2) };
        return { code: 0, stdout: `log ${name} open: Snapchat is in the front on ${phone.serial} for ${account.accountName}${device.foregroundApp ? ` (${device.foregroundApp})` : ""}.` };
      }

      const tap = parseTap(route, flagText(route, "tap"));
      if (!tap.ok) return tap.result;
      const run = createMobileRun({ accountName: account.accountName, now: context.now?.() ?? new Date() });
      await driver.openApp(phone.serial, SNAPCHAT_ANDROID_APP.packageName);
      await wait(context, 1500);
      const first = await captureStep(context, driver, phone.serial, account.accountName, run, "open", []);
      let steps = 1;
      if (tap.tap) {
        await driver.tap(phone.serial, tap.tap.x, tap.tap.y);
        await wait(context, 1200);
        await captureStep(context, driver, phone.serial, account.accountName, run, "tap", [tap.tap]);
        steps = 2;
      }
      run.save();
      const network = first.network;
      if (route.flags["json"]) {
        return { code: 0, stdout: JSON.stringify({ account: account.accountName, phone, run: { id: run.id, dir: run.dir, steps: run.steps }, network }, null, 2) };
      }
      return {
        code: 0,
        stdout: `log ${name} inspect: ${steps} step(s) recorded for ${account.accountName} on ${phone.serial} in ${run.dir} (the screen, the UI tree, ${network ? network.lines.length : 0} network call(s) read with ${network ? network.mode : "nothing"}).`,
      };
    } catch (error) {
      return refuseError(name, error);
    }
  },
};
