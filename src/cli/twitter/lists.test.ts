import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const python = process.env.LOG_PYTHON || "python";
const root = join(import.meta.dir, "..", "..", "..", "python");

function py(script: string): unknown {
  const out = spawnSync(python, ["-c", `import sys, json; sys.path.insert(0, ${JSON.stringify(root)})\n${script}`], { encoding: "utf8", env: { ...process.env, PYTHONUTF8: "1" } });
  if (out.status !== 0) throw new Error(out.stderr);
  return JSON.parse(out.stdout);
}

const LISTS_PAGE = `def a_list(list_id, name, owner):
    return {"id_str": list_id, "created_at": 1762300000000, "default_banner_media": {"media_info": {}}, "description": "", "following": True, "is_member": False, "member_count": 0, "mode": "Private", "muting": False, "name": name, "pinning": False, "subscriber_count": 0, "user_results": {"result": {"rest_id": owner}}}

page = {"data": {"viewer": {"list_management_timeline": {"timeline": {"instructions": [{"type": "TimelineAddEntries", "entries": [
    {"entryId": "ownedSubscribedListModule0", "content": {"items": [
        {"entryId": "a", "item": {"itemContent": {"itemType": "TimelineTwitterList", "list": a_list("2118253450186440992", "Go-Getters", "111")}}},
        {"entryId": "b", "item": {"itemContent": {"itemType": "TimelineTwitterList", "list": a_list("900", "Someone Else's", "222")}}},
    ]}},
    {"entryId": "listToFollowModule1", "content": {"items": [
        {"entryId": "c", "item": {"itemContent": {"itemType": "TimelineUser", "user_results": {"result": {"rest_id": "333"}}}}},
        {"entryId": "d", "item": {"itemContent": {"itemType": "TimelineTwitterList", "list": a_list("901", "Discover This", "444")}}},
    ]}},
    {"entryId": "cursorBottom0", "content": {"value": "nextCursor"}},
]}]}}}}}

class Gql:
    async def list_management_pace_timeline(self, count, cursor):
        return page, None

class Fake:
    gql = Gql()
    async def user_id(self):
        return "111"
`;

describe("X lists: only the account's own lists (rule 141)", () => {
  test("twikit's get_lists reads every module, skipping items that aren't lists, instead of crashing on X's suggestions", () => {
    const got = py(`import asyncio, types
from twitterApi import engine
from twikit import Client
${LISTS_PAGE}
fake = Fake()
fake.get_lists = types.MethodType(Client.get_lists, fake)
found = asyncio.run(fake.get_lists(count=100))
print(json.dumps([[f.id, f.owner_id] for f in found]))`);
    expect(got).toEqual([["2118253450186440992", "111"], ["900", "222"], ["901", "444"]]);
  });

  test("lists_of keeps only the lists the account owns", () => {
    const got = py(`import asyncio, types
from twitterApi import engine
from twikit import Client
${LISTS_PAGE}
fake = Fake()
fake.get_lists = types.MethodType(Client.get_lists, fake)
print(json.dumps(asyncio.run(engine.lists_of(fake))))`);
    expect(got).toEqual([{ id: "2118253450186440992", name: "Go-Getters", mode: "Private", memberCount: 0, description: "" }]);
  });
});
