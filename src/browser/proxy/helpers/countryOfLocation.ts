const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const US_STATES = "al ak az ar ca co ct de dc fl ga hi id il in ia ks ky la me md ma mi mn ms mo mt ne nv nh nj nm ny nc nd oh ok or pa ri sc sd tn tx ut vt va wa wv wi wy".split(" ");

const CODE_BY_NAME: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b);
      const name = regionNames.of(code);
      if (name && name !== code && name !== "Unknown Region") map.set(name.toLowerCase(), code);
    }
  }
  for (const [alias, code] of [["uk", "GB"], ["england", "GB"], ["scotland", "GB"], ["wales", "GB"], ["northern ireland", "GB"], ["usa", "US"], ["us", "US"]]) {
    map.set(alias, code);
  }
  for (const state of US_STATES) map.set(state, "US");
  return map;
})();

export function countryOfLocation(location: string): string | null {
  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  return CODE_BY_NAME.get(parts.at(-1)!.toLowerCase()) ?? null;
}

export function countryName(code: string): string {
  return regionNames.of(code) ?? code;
}
