import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DOCS_INDEX, mergeOperations, operationNamesByDocId, writeOperationDocs } from "./client";
import { domainOf, formFields, importersOf, indexModules, readGraphqlDefinition, renderOperationDoc, requestsInStep, responseErrors, sliceFor, stepLabel, TO_WRITE } from "./helpers/index";
import type { ClientOperation, FacebookModule } from "./types";

const BUNDLE = [
  ";/*FB_PKG_DELIM*/",
  '__d("useMarketplaceComposerAttributesQuery_facebookRelayOperation",[],(function(t,n,r,o,a,i){a.exports="24482075174793922"}),null);',
  '__d("useMarketplaceComposerAttributesQuery.graphql",["useMarketplaceComposerAttributesQuery_facebookRelayOperation"],(function(t,n,r,o,a,i){"use strict";var e=(function(){var e=[{defaultValue:null,kind:"LocalArgument",name:"categoryID"}],t=[{kind:"Variable",name:"category_id",variableName:"categoryID"}];return{fragment:{argumentDefinitions:e,kind:"Fragment",metadata:null,name:"useMarketplaceComposerAttributesQuery",selections:[{alias:null,args:null,concreteType:"Viewer",kind:"LinkedField",name:"viewer",plural:!1,selections:[{alias:"definitions",args:t,concreteType:"X",kind:"LinkedField",name:"marketplace_composer_attribute_definitions",plural:!0,selections:[]},{args:null,kind:"FragmentSpread",name:"MarketplaceComposerFragment"}]}],type:"Query"},params:{id:n("useMarketplaceComposerAttributesQuery_facebookRelayOperation"),operationKind:"query",name:"useMarketplaceComposerAttributesQuery"}}})();a.exports=e}),null);',
  '__d("useMarketplaceComposerAttributes",["useMarketplaceComposerAttributesQuery.graphql","react"],(function(t,n,r,o,a,i,l){l.default=function(){}}),98);',
  '__d("Unrelated",[],(function(){}),1);',
].join("\n");

const modulesOf = (text: string): Map<string, FacebookModule> => new Map(indexModules("script0.js", text).map((m) => [m.name, m]));

describe("indexModules", () => {
  test("cuts every __d module out of a bundle with its dependencies", () => {
    const modules = indexModules("script0.js", BUNDLE);
    expect(modules.map((m) => m.name)).toEqual([
      "useMarketplaceComposerAttributesQuery_facebookRelayOperation",
      "useMarketplaceComposerAttributesQuery.graphql",
      "useMarketplaceComposerAttributes",
      "Unrelated",
    ]);
    expect(modules[2].deps).toEqual(["useMarketplaceComposerAttributesQuery.graphql", "react"]);
    expect(modules[0].text.startsWith('__d("useMarketplaceComposerAttributesQuery_facebookRelayOperation"')).toBe(true);
  });

  test("a request's slice is its definition, its doc_id and what imports it, nothing else", () => {
    const modules = modulesOf(BUNDLE);
    const slice = sliceFor("useMarketplaceComposerAttributesQuery", modules, importersOf(modules.values())).map((m) => m.name);
    expect(slice).toEqual(["useMarketplaceComposerAttributesQuery.graphql", "useMarketplaceComposerAttributesQuery_facebookRelayOperation", "useMarketplaceComposerAttributes"]);
  });
});

describe("readGraphqlDefinition", () => {
  test("reads the kind, the variables and the fields, through minified locals", () => {
    const definition = readGraphqlDefinition(modulesOf(BUNDLE).get("useMarketplaceComposerAttributesQuery.graphql")!.text);
    expect(definition.kind).toBe("query");
    expect(definition.sends).toEqual(["categoryID"]);
    expect(definition.reads).toEqual(["viewer.definitions", "viewer....MarketplaceComposerFragment"]);
  });
});

describe("requests in a step", () => {
  const step = {
    log: {
      entries: [
        {
          startedDateTime: "2026-10-19T09:21:18.000Z",
          time: 412.6,
          request: { method: "POST", url: "https://www.facebook.com/api/graphql/", headers: [], postData: { text: 'fb_dtsg=secret&doc_id=24482075174793922&fb_api_req_friendly_name=useMarketplaceComposerAttributesQuery&variables={"categoryID":"1569171756675761"}' } },
          response: { status: 200, content: { text: '{"data":{}}' } },
        },
        {
          startedDateTime: "2026-10-19T09:21:24.000Z",
          time: 900,
          request: { method: "POST", url: "https://www.facebook.com/api/graphql/", headers: [], postData: { text: '--b\r\nContent-Disposition: form-data; name="doc_id"\r\n\r\n555\r\n--b\r\nContent-Disposition: form-data; name="variables"\r\n\r\n{"input":{}}\r\n--b--' } },
          response: { status: 200, content: { text: "{}" } },
        },
        { startedDateTime: "2026-10-19T09:21:25.000Z", request: { method: "GET", url: "https://static.xx.fbcdn.net/rsrc.php/a.js" }, response: { status: 200, content: {} } },
        {
          startedDateTime: "2026-10-19T09:21:26.000Z",
          time: 50,
          request: { method: "POST", url: "https://www.facebook.com/ajax/bulk-route-definitions/" },
          response: { status: 200, content: { text: 'for (;;);{"error":1357004,"errorSummary":"Sorry, something went wrong"}' } },
        },
      ],
    },
  };
  const seen = requestsInStep(step, { run: "publish/x", action: "publish", step: "Category: Household", stepAt: "2026-10-19T09:21:17.570Z" });

  test("names GraphQL by friendly name and doc_id, other POSTs by path, and skips static files", () => {
    expect(seen.map((s) => s.name)).toEqual(["useMarketplaceComposerAttributesQuery", "apiGraphql", "ajaxBulkRouteDefinitions"]);
    expect(seen[0]).toMatchObject({ docId: "24482075174793922", graphql: true, variables: ["categoryID"], status: 200, ms: 413, afterStepMs: 430 });
  });

  test("never keeps a value: only variable names", () => {
    expect(JSON.stringify(seen)).not.toContain("secret");
    expect(JSON.stringify(seen)).not.toContain("1569171756675761");
  });

  test("reads multipart bodies (the photo step's requests)", () => {
    expect(formFields(step.log.entries[1].request.postData!.text).get("doc_id")).toBe("555");
    expect(seen[1]).toMatchObject({ docId: "555", variables: ["input"] });
  });

  test("reads Facebook's errors, and error:false is not one", () => {
    expect(seen[2].errors).toEqual(["error 1357004: Sorry, something went wrong"]);
    expect(responseErrors('for (;;);{"payload":{},"error":false}')).toEqual([]);
    expect(responseErrors('{"errors":[{"code":1675030,"message":"Error performing query."}]}')).toEqual(["1675030: Error performing query."]);
  });

  test("an unnamed request is named from its doc_id", () => {
    const modules = modulesOf(BUNDLE.replace('"24482075174793922"', '"555"'));
    expect(operationNamesByDocId(modules).get("555")).toBe("useMarketplaceComposerAttributesQuery");
    const operations = mergeOperations(seen, modules);
    const merged = operations.find((o) => o.name === "useMarketplaceComposerAttributesQuery")!;
    expect(merged.sightings).toHaveLength(2);
    expect(merged.calledFrom).toEqual(["useMarketplaceComposerAttributes"]);
    expect(merged.sends).toEqual(["categoryID", "input"]);
  });
});

describe("domainOf", () => {
  test("narrow domains win, and the rest is background", () => {
    expect(domainOf("useUFACSubmitActionMutation")).toBe("checkpoint");
    expect(domainOf("FBScrapingWarningMutation")).toBe("checkpoint");
    expect(domainOf("loginDeviceBasedRegularLogin")).toBe("login");
    expect(domainOf("useMarketplaceComposerAttributesQuery")).toBe("listingForm");
    expect(domainOf("ajaxReactComposerAttachmentsPhotoUpload")).toBe("photos");
    expect(domainOf("CometNotificationsDropdownQuery")).toBe("background");
  });
});

describe("the docs index is cumulative", () => {
  const op = (name: string, seen: number): ClientOperation => ({
    name, domain: "checkpoint", kind: "mutation", docId: name, path: "/api/graphql/", sends: [], reads: [], calledFrom: [],
    sightings: Array.from({ length: seen }, () => ({ run: "runs/connect/x", action: "connect", step: "s", status: 200, ms: 1, afterStepMs: 1, errors: [] })),
    reaEvidenceId: `ev_${name}`,
  });

  test("a request missing from today's recordings keeps its entry and doc; one seen again keeps its larger count", () => {
    const dir = mkdtempSync(join(tmpdir(), "logDocs"));
    writeOperationDocs([op("oldMutation", 5), op("bothMutation", 4)], dir, 47);
    writeOperationDocs([op("bothMutation", 1), op("newMutation", 1)], dir, 4);
    const index = JSON.parse(readFileSync(join(dir, DOCS_INDEX), "utf8")) as { operations: { name: string; seen: number }[] };
    expect(index.operations.map((o) => [o.name, o.seen])).toEqual([["bothMutation", 4], ["newMutation", 1], ["oldMutation", 5]]);
  });
});

describe("the doc", () => {
  const operation: ClientOperation = {
    name: "useUFACSubmitActionMutation",
    domain: "checkpoint",
    kind: "mutation",
    docId: "1",
    path: "/api/graphql/",
    sends: ["input"],
    reads: [],
    calledFrom: [],
    sightings: [{ run: "runs/connect/20261019T073942_61500000000001", action: "connect", step: "Page: checkpoint https://www.facebook.com/checkpoint/1234567890123/ from 203.0.113.7", status: 200, ms: 300, afterStepMs: 1200, errors: [] }],
    reaEvidenceId: "ev_1",
  };

  test("step lines lose exit IPs, account ids and URLs before they are committed", () => {
    expect(stepLabel(operation.sightings[0].step)).toBe("Page: checkpoint /checkpoint/<id>/ from <ip>");
    expect(renderOperationDoc(operation, null)).not.toContain("61500000000001");
  });

  test("a new doc asks for its reasoning; a rebuild keeps what was written", () => {
    const fresh = renderOperationDoc(operation, null);
    expect(fresh.split(TO_WRITE)).toHaveLength(4);
    const written = fresh.replaceAll(`${TO_WRITE} `, "Written by matt. ");
    const rebuilt = renderOperationDoc({ ...operation, reaEvidenceId: "ev_2" }, written);
    expect(rebuilt).toContain("`ev_2`");
    expect(rebuilt).not.toContain("`ev_1`");
    expect(rebuilt).toContain("Written by matt.");
    expect(rebuilt).not.toContain(TO_WRITE);
  });
});

describe("the groups domain (rule 48)", () => {
  test("the group requests recorded on Bethlehem's groups are groups; the chat sidebar's group chats stay background", async () => {
    const { domainOf } = await import("./index");
    for (const name of ["CometGroupRootQuery", "GroupsCometDiscussionLayoutRootQuery", "useGroupsCometVisitMutation", "GroupCometJoinForumMutation", "useGroupRequestToJoinMutation", "GroupsCometRequestToParticipateOnJoinDialogQuery", "GroupsCometMembershipQuestionsPreloadedDialogQuery", "useGroupMembershipAnswersSaveMutation"]) {
      expect(domainOf(name)).toBe("groups");
    }
    expect(domainOf("CometHomeContactGroupsContainerQuery")).toBe("background");
  });
});

describe("the reels domain, from the first Reels recording (rule 49)", () => {
  test("desktop Reels' unified video requests are reels; Messenger's video setting stays background", async () => {
    const { domainOf } = await import("./index");
    for (const name of ["FBUnifiedVideoSeenStateMutation", "FBUnifiedVideoContainerQuery", "FBUnifiedVideoFeedbackRightRailWithCommentPreloadingQuery", "FBUnifiedVideoProfileSavedReelsQuery", "FBUnifiedVideoEntityDialogImplQuery"]) expect(domainOf(name)).toBe("reels");
    expect(domainOf("fetchMWChatVideoAutoplaySettingQuery")).toBe("background");
  });
});
