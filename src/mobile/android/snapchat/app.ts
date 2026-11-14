export const SNAPCHAT_ANDROID_PACKAGE = "com.snapchat.android";

export const SNAPCHAT_ANDROID_APP = {
  platform: "snapchat",
  label: "Snapchat",
  packageName: SNAPCHAT_ANDROID_PACKAGE,
};

export function isSnapchatApp(app: string | null): boolean {
  return Boolean(app && app.startsWith(SNAPCHAT_ANDROID_PACKAGE));
}
