import { describe, expect, test } from "bun:test";
import { copiedRequestProblem, parseCopiedRequest } from "./index.ts";

const LI_AT = "AQEDA".padEnd(120, "x");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.7444.59 Safari/537.36";

describe("a linkedin.com request copied as cURL", () => {
  test("Copy as cURL (cmd) on Windows: the caret escapes are undone", () => {
    const cmd = [
      'curl ^"https://www.linkedin.com/voyager/api/me^" ^',
      `  -b ^"bcookie=^\\^"v=2^&abc^\\^"; bscookie=^\\^"v=1^&def^\\^"; li_at=${LI_AT}; JSESSIONID=^\\^"ajax:1234567890123^\\^"^" ^`,
      `  -H ^"user-agent: ${UA}^" ^`,
      '  -H ^"sec-ch-ua-platform: ^\\^"Windows^\\^"^"',
    ].join("\r\n");
    const request = parseCopiedRequest(cmd);
    expect(copiedRequestProblem(request)).toBeNull();
    expect(request!.cookies).toMatchObject({ bcookie: '"v=2&abc"', li_at: LI_AT, JSESSIONID: '"ajax:1234567890123"' });
    expect(request!.browser).toEqual({ userAgent: UA, secChUaPlatform: '"Windows"' });
  });

  test("a cookie header given with -H cookie works like -b", () => {
    const request = parseCopiedRequest(`curl 'https://www.linkedin.com/feed/' -H 'cookie: bcookie=a; bscookie=b; li_at=${LI_AT}; JSESSIONID="ajax:1234567890123"' -H 'user-agent: ${UA}' --compressed`);
    expect(copiedRequestProblem(request)).toBeNull();
  });

  test("text that isn't a cURL copy, or has no session, names what is wrong", () => {
    expect(copiedRequestProblem(parseCopiedRequest("li_at=x"))).toBe("notCurl");
    expect(copiedRequestProblem(parseCopiedRequest(`curl 'https://www.linkedin.com/feed/' -b 'bcookie=a; bscookie=b' -H 'user-agent: ${UA}'`))).toBe("noSessionCookies");
  });

  test("a request copied with Chrome's device toolbar on is refused as a phone browser", () => {
    const base = `curl 'https://www.linkedin.com/voyager/api/me' -b 'bcookie=a; bscookie=b; li_at=${LI_AT}; JSESSIONID="ajax:1234567890123"'`;
    const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";
    expect(copiedRequestProblem(parseCopiedRequest(`${base} -H 'user-agent: ${iphone}'`))).toBe("mobileBrowser");
    expect(copiedRequestProblem(parseCopiedRequest(`${base} -H 'user-agent: ${UA}' -H 'sec-ch-ua-mobile: ?1'`))).toBe("mobileBrowser");
    expect(copiedRequestProblem(parseCopiedRequest(`${base} -H 'user-agent: ${UA}' -H 'sec-ch-ua-platform: "Android"'`))).toBe("mobileBrowser");
    expect(copiedRequestProblem(parseCopiedRequest(`${base} -H 'user-agent: ${UA}' -H 'sec-ch-ua-mobile: ?0'`))).toBeNull();
  });
});
