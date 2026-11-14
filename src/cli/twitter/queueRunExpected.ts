export const EXPECTED: Record<string, unknown> = {
  "fullRun": {
    "lines": [
      "+10s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeBird/status/190000000000000010\",\"text\":\"nice one\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "+40s engine {\"action\":\"like\",\"tweetUrl\":\"https://x.com/fakeBird/status/190000000000000010\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "+70s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeFinch/status/190000000000000011\",\"text\":\"love this\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 0",
      "out log twitter queue run: finished. 2 replies sent, 0 skipped. {\"sent\":2} (log: queue log replyQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:00 random run: 3 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "err 2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
      "err 2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
      "err 2026-11-14 10:00:10 [waiting] next like #1 @fakeBird at 2026-11-14T10:00:40.000Z",
      "err 2026-11-14 10:00:40 LIKED #1 @fakeBird",
      "err 2026-11-14 10:00:40 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:01:10.000Z",
      "err 2026-11-14 10:01:10 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
      "err 2026-11-14 10:01:10 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:01:10 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err 2026-11-14 10:01:10 SENT #2 @fakeFinch https://x.com/xQueue/status/881",
      "err 2026-11-14 10:01:10 [finished] random run done: 2 replies sent, 0 skipped"
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "sent",
          "text": "nice one",
          "sentId": "880",
          "sentUrl": "https://x.com/xQueue/status/880",
          "result": "{\"event\":\"sent\",\"tweetId\":\"880\"}",
          "attemptedAt": "2026-11-14T10:00:10.000Z",
          "likedAt": "2026-11-14T10:00:40.000Z"
        },
        {
          "n": 2,
          "status": "sent",
          "text": "love this",
          "sentId": "881",
          "sentUrl": "https://x.com/xQueue/status/881",
          "result": "{\"event\":\"sent\",\"tweetId\":\"881\"}",
          "attemptedAt": "2026-11-14T10:01:10.000Z"
        }
      ],
      "events": [
        "1r@10:done@10",
        "1l@40:done@40",
        "2r@70:done@70"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": [
        "2026-11-14 10:00:00 random run: 3 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
        "2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
        "2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
        "2026-11-14 10:00:10 [waiting] next like #1 @fakeBird at 2026-11-14T10:00:40.000Z",
        "2026-11-14 10:00:40 LIKED #1 @fakeBird",
        "2026-11-14 10:00:40 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:01:10.000Z",
        "2026-11-14 10:01:10 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
        "2026-11-14 10:01:10 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:01:10 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:01:10 SENT #2 @fakeFinch https://x.com/xQueue/status/881",
        "2026-11-14 10:01:10 [finished] random run done: 2 replies sent, 0 skipped"
      ]
    }
  },
  "dmRun": {
    "lines": [
      "+10s engine {\"action\":\"dm\",\"userId\":\"4300\",\"text\":\"yo the new tool is up\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "+40s engine {\"action\":\"dm\",\"userId\":\"4301\",\"text\":\"yo made a free tool\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 0",
      "out {\n  \"state\": \"finished\",\n  \"reason\": null,\n  \"sent\": 2,\n  \"skipped\": 0,\n  \"counts\": {\n    \"sent\": 2\n  },\n  \"log\": \"queue log dmQueue in ~/.logCli/log.db\"\n}",
      "err 2026-11-14 10:00:00 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "err 2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
      "err 2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:10 SENT #1 @fakeBird dm 4300-1",
      "err 2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err 2026-11-14 10:00:40 SENT #2 @fakeFinch dm 4301-1",
      "err 2026-11-14 10:00:40 [finished] random run done: 2 replies sent, 0 skipped"
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "sent",
          "text": "yo the new tool is up",
          "sentId": "4300-1",
          "sentUrl": null,
          "result": "{\"event\":\"sent\",\"conversationId\":\"4300-1\"}",
          "attemptedAt": "2026-11-14T10:00:10.000Z"
        },
        {
          "n": 2,
          "status": "sent",
          "text": "yo made a free tool",
          "sentId": "4301-1",
          "sentUrl": null,
          "result": "{\"event\":\"sent\",\"conversationId\":\"4301-1\"}",
          "attemptedAt": "2026-11-14T10:00:40.000Z"
        }
      ],
      "events": [
        "1r@10:done@10",
        "2r@40:done@40"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": [
        "2026-11-14 10:00:00 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
        "2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
        "2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:10 SENT #1 @fakeBird dm 4300-1",
        "2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
        "2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
        "2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:40 SENT #2 @fakeFinch dm 4301-1",
        "2026-11-14 10:00:40 [finished] random run done: 2 replies sent, 0 skipped"
      ]
    }
  },
  "forced": {
    "lines": [
      "+10s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeBird/status/190000000000000010\",\"text\":\"nice one\",\"live\":true,\"approvedBy\":\"fakeOwner\",\"force\":true}",
      "exit 0",
      "out log twitter queue run: finished. 1 replies sent, 0 skipped. {\"sent\":1} (log: queue log replyQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:00 random run: 1 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "err 2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
      "err 2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
      "err 2026-11-14 10:00:10 [finished] random run done: 1 replies sent, 0 skipped"
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "sent",
          "text": "nice one",
          "sentId": "880",
          "sentUrl": "https://x.com/xQueue/status/880",
          "result": "{\"event\":\"sent\",\"tweetId\":\"880\"}",
          "attemptedAt": "2026-11-14T10:00:10.000Z"
        }
      ],
      "events": [
        "1r@10:done@10"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": [
        "2026-11-14 10:00:00 random run: 1 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
        "2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
        "2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
        "2026-11-14 10:00:10 [finished] random run done: 1 replies sent, 0 skipped"
      ]
    }
  },
  "governorRefusal": {
    "lines": [
      "+10s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeBird/status/190000000000000010\",\"text\":\"nice one\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "+40s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeFinch/status/190000000000000011\",\"text\":\"love this\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 5",
      "out log twitter queue run: halted: x refused reply #2 @fakeFinch: governorBlocked: cooldown active for 660s. 1 replies sent, 0 skipped. {\"pending\":2,\"sent\":1} (log: queue log replyQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:00 random run: 3 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "err 2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
      "err 2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
      "err 2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err 2026-11-14 10:00:40 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
      "err 2026-11-14 10:00:40 STOPPED: REFUSED reply #2 @fakeFinch: x answered at 2026-11-14 10:00:40 UTC: governorBlocked: cooldown active for 660s. The run stopped here: #2 stays pending and nothing more was sent. Nothing goes out on @xQueue until matt starts a run again (rule 94). (1 sent in total)",
      "err 2026-11-14 10:00:40 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "sent",
          "text": "nice one",
          "sentId": "880",
          "sentUrl": "https://x.com/xQueue/status/880",
          "result": "{\"event\":\"sent\",\"tweetId\":\"880\"}",
          "attemptedAt": "2026-11-14T10:00:10.000Z"
        },
        {
          "n": 2,
          "status": "pending",
          "text": "love this",
          "result": "governorBlocked: cooldown active for 660s",
          "attemptedAt": "2026-11-14T10:00:40.000Z"
        },
        {
          "n": 3,
          "status": "pending",
          "text": "so good"
        }
      ],
      "events": [
        "1r@10:done@10",
        "2r@40",
        "3r@70"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": [
        "2026-11-14 10:00:00 random run: 3 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
        "2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
        "2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
        "2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
        "2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
        "2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:40 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
        "2026-11-14 10:00:40 STOPPED: REFUSED reply #2 @fakeFinch: x answered at 2026-11-14 10:00:40 UTC: governorBlocked: cooldown active for 660s. The run stopped here: #2 stays pending and nothing more was sent. Nothing goes out on @xQueue until matt starts a run again (rule 94). (1 sent in total)",
        "2026-11-14 10:00:40 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
      ]
    }
  },
  "platformRefusal": {
    "lines": [
      "+10s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeBird/status/190000000000000010\",\"text\":\"nice one\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 5",
      "out log twitter queue run: halted: x refused reply #1 @fakeBird: rateLimited: status: 429, Rate limit exceeded. 0 replies sent, 0 skipped. {\"pending\":2} (log: queue log replyQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:00 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "err 2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
      "err 2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:10 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
      "err 2026-11-14 10:00:10 STOPPED: REFUSED reply #1 @fakeBird: x answered at 2026-11-14 10:00:10 UTC: rateLimited: status: 429, Rate limit exceeded. The run stopped here: #1 stays pending and nothing more was sent. Nothing goes out on @xQueue until matt starts a run again (rule 94). (0 sent in total)",
      "err 2026-11-14 10:00:10 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "pending",
          "text": "nice one",
          "result": "rateLimited: status: 429, Rate limit exceeded",
          "attemptedAt": "2026-11-14T10:00:10.000Z"
        },
        {
          "n": 2,
          "status": "pending",
          "text": "love this"
        }
      ],
      "events": [
        "1r@10",
        "2r@40"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": [
        "2026-11-14 10:00:00 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
        "2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
        "2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:10 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
        "2026-11-14 10:00:10 STOPPED: REFUSED reply #1 @fakeBird: x answered at 2026-11-14 10:00:10 UTC: rateLimited: status: 429, Rate limit exceeded. The run stopped here: #1 stays pending and nothing more was sent. Nothing goes out on @xQueue until matt starts a run again (rule 94). (0 sent in total)",
        "2026-11-14 10:00:10 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
      ]
    }
  },
  "crashThenResume": {
    "lines": [
      "+10s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeBird/status/190000000000000010\",\"text\":\"nice one\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "+40s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeFinch/status/190000000000000011\",\"text\":\"love this\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 2",
      "err 2026-11-14 10:00:00 random run: 3 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "err 2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
      "err 2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
      "err 2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err log twitter queue run: crashed: A step threw an error the command didn't expect, so nothing after it ran (a publish that throws after its Publish click is crashedAfterPublish instead). (Error: socket closed)\nRead the detail (exception and message). Run again.",
      "lock 0",
      "+40s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeFinch/status/190000000000000011\",\"text\":\"love this\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "+70s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeWren/status/190000000000000012\",\"text\":\"so good\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 0",
      "out log twitter queue run: finished. 3 replies sent, 0 skipped. {\"sent\":3} (log: queue log replyQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:40 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:40 SENT #2 @fakeFinch https://x.com/xQueue/status/881",
      "err 2026-11-14 10:00:40 [waiting] next reply #3 @fakeWren at 2026-11-14T10:01:10.000Z",
      "err 2026-11-14 10:01:10 #3 @fakeWren: voice gate: passed for @fakeWren (test)",
      "err 2026-11-14 10:01:10 #3 @fakeWren: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:01:10 #3 @fakeWren: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err 2026-11-14 10:01:10 SENT #3 @fakeWren https://x.com/xQueue/status/882",
      "err 2026-11-14 10:01:10 [finished] random run done: 3 replies sent, 0 skipped"
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "sent",
          "text": "nice one",
          "sentId": "880",
          "sentUrl": "https://x.com/xQueue/status/880",
          "result": "{\"event\":\"sent\",\"tweetId\":\"880\"}",
          "attemptedAt": "2026-11-14T10:00:10.000Z"
        },
        {
          "n": 2,
          "status": "sent",
          "text": "love this",
          "sentId": "881",
          "sentUrl": "https://x.com/xQueue/status/881",
          "result": "{\"event\":\"sent\",\"tweetId\":\"881\"}",
          "attemptedAt": "2026-11-14T10:00:40.000Z"
        },
        {
          "n": 3,
          "status": "sent",
          "text": "so good",
          "sentId": "882",
          "sentUrl": "https://x.com/xQueue/status/882",
          "result": "{\"event\":\"sent\",\"tweetId\":\"882\"}",
          "attemptedAt": "2026-11-14T10:01:10.000Z"
        }
      ],
      "events": [
        "1r@10:done@10",
        "2r@40:done@40",
        "3r@70:done@70"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": [
        "2026-11-14 10:00:00 random run: 3 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
        "2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
        "2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
        "2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
        "2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
        "2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:40 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
        "2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:40 SENT #2 @fakeFinch https://x.com/xQueue/status/881",
        "2026-11-14 10:00:40 [waiting] next reply #3 @fakeWren at 2026-11-14T10:01:10.000Z",
        "2026-11-14 10:01:10 #3 @fakeWren: voice gate: passed for @fakeWren (test)",
        "2026-11-14 10:01:10 #3 @fakeWren: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:01:10 #3 @fakeWren: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:01:10 SENT #3 @fakeWren https://x.com/xQueue/status/882",
        "2026-11-14 10:01:10 [finished] random run done: 3 replies sent, 0 skipped"
      ]
    }
  },
  "diedThenResume": {
    "lines": [
      "+10s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeBird/status/190000000000000010\",\"text\":\"nice one\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 2",
      "err 2026-11-14 10:00:00 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "err 2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
      "err 2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
      "err 2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "err log twitter queue run: crashed: A step threw an error the command didn't expect, so nothing after it ran (a publish that throws after its Publish click is crashedAfterPublish instead). (Error: the process died)\nRead the detail (exception and message). Run again.",
      "lock 4194301",
      "+40s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeFinch/status/190000000000000011\",\"text\":\"love this\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 0",
      "out log twitter queue run: finished. 2 replies sent, 0 skipped. {\"sent\":2} (log: queue log replyQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:20 random run: 1 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:20 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:40 SENT #2 @fakeFinch https://x.com/xQueue/status/881",
      "err 2026-11-14 10:00:40 [finished] random run done: 2 replies sent, 0 skipped"
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "sent",
          "text": "nice one",
          "sentId": "880",
          "sentUrl": "https://x.com/xQueue/status/880",
          "result": "{\"event\":\"sent\",\"tweetId\":\"880\"}",
          "attemptedAt": "2026-11-14T10:00:10.000Z"
        },
        {
          "n": 2,
          "status": "sent",
          "text": "love this",
          "sentId": "881",
          "sentUrl": "https://x.com/xQueue/status/881",
          "result": "{\"event\":\"sent\",\"tweetId\":\"881\"}",
          "attemptedAt": "2026-11-14T10:00:40.000Z"
        }
      ],
      "events": [
        "1r@10:done@10",
        "2r@40:done@40"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": [
        "2026-11-14 10:00:00 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
        "2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
        "2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
        "2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
        "2026-11-14 10:00:20 random run: 1 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:20 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
        "2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
        "2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:40 SENT #2 @fakeFinch https://x.com/xQueue/status/881",
        "2026-11-14 10:00:40 [finished] random run done: 2 replies sent, 0 skipped"
      ]
    }
  },
  "lockBusy": {
    "lines": [
      "exit 1",
      "err log twitter queue run: queueBusy: Another run holds the queue's lock (<queue>.lock), or nudge was asked for with no run going. (a run (pid <pid>) is already going on this queue)\nWait for the run to end; delete the lock only if no run is going.",
      "lock true"
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "pending",
          "text": "nice one"
        }
      ],
      "events": [
        "1r@10"
      ],
      "approvedBy": "fakeOwner",
      "lock": "<pid>",
      "log": []
    }
  },
  "cancelMidWaitThenResume": {
    "lines": [
      "+10s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeBird/status/190000000000000010\",\"text\":\"nice one\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 5",
      "out log twitter queue run: halted: cancelled. 1 replies sent, 0 skipped. {\"pending\":2,\"sent\":1} (log: queue log replyQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:00 random run: 3 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "err 2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
      "err 2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
      "err 2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "err 2026-11-14 10:00:25 [waiting] cancelled while waiting for reply #2: nothing more is sent, 1 sent in total. Running it again resumes.",
      "+40s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeFinch/status/190000000000000011\",\"text\":\"love this\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "+70s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeWren/status/190000000000000012\",\"text\":\"so good\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 0",
      "out log twitter queue run: finished. 3 replies sent, 0 skipped. {\"sent\":3} (log: queue log replyQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:25 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:25 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:40 SENT #2 @fakeFinch https://x.com/xQueue/status/881",
      "err 2026-11-14 10:00:40 [waiting] next reply #3 @fakeWren at 2026-11-14T10:01:10.000Z",
      "err 2026-11-14 10:01:10 #3 @fakeWren: voice gate: passed for @fakeWren (test)",
      "err 2026-11-14 10:01:10 #3 @fakeWren: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:01:10 #3 @fakeWren: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err 2026-11-14 10:01:10 SENT #3 @fakeWren https://x.com/xQueue/status/882",
      "err 2026-11-14 10:01:10 [finished] random run done: 3 replies sent, 0 skipped"
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "sent",
          "text": "nice one",
          "sentId": "880",
          "sentUrl": "https://x.com/xQueue/status/880",
          "result": "{\"event\":\"sent\",\"tweetId\":\"880\"}",
          "attemptedAt": "2026-11-14T10:00:10.000Z"
        },
        {
          "n": 2,
          "status": "sent",
          "text": "love this",
          "sentId": "881",
          "sentUrl": "https://x.com/xQueue/status/881",
          "result": "{\"event\":\"sent\",\"tweetId\":\"881\"}",
          "attemptedAt": "2026-11-14T10:00:40.000Z"
        },
        {
          "n": 3,
          "status": "sent",
          "text": "so good",
          "sentId": "882",
          "sentUrl": "https://x.com/xQueue/status/882",
          "result": "{\"event\":\"sent\",\"tweetId\":\"882\"}",
          "attemptedAt": "2026-11-14T10:01:10.000Z"
        }
      ],
      "events": [
        "1r@10:done@10",
        "2r@40:done@40",
        "3r@70:done@70"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": [
        "2026-11-14 10:00:00 random run: 3 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
        "2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
        "2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
        "2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
        "2026-11-14 10:00:25 [waiting] cancelled while waiting for reply #2: nothing more is sent, 1 sent in total. Running it again resumes.",
        "2026-11-14 10:00:25 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:25 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
        "2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
        "2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:40 SENT #2 @fakeFinch https://x.com/xQueue/status/881",
        "2026-11-14 10:00:40 [waiting] next reply #3 @fakeWren at 2026-11-14T10:01:10.000Z",
        "2026-11-14 10:01:10 #3 @fakeWren: voice gate: passed for @fakeWren (test)",
        "2026-11-14 10:01:10 #3 @fakeWren: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:01:10 #3 @fakeWren: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:01:10 SENT #3 @fakeWren https://x.com/xQueue/status/882",
        "2026-11-14 10:01:10 [finished] random run done: 3 replies sent, 0 skipped"
      ]
    }
  },
  "cancelMidSend": {
    "lines": [
      "+10s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeBird/status/190000000000000010\",\"text\":\"nice one\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 5",
      "out log twitter queue run: halted: cancelled. 1 replies sent, 0 skipped. {\"pending\":1,\"sent\":1} (log: queue log replyQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:00 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "err 2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
      "err 2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
      "err 2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "err 2026-11-14 10:00:15 [waiting] cancelled while waiting for reply #2: nothing more is sent, 1 sent in total. Running it again resumes."
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "sent",
          "text": "nice one",
          "sentId": "880",
          "sentUrl": "https://x.com/xQueue/status/880",
          "result": "{\"event\":\"sent\",\"tweetId\":\"880\"}",
          "attemptedAt": "2026-11-14T10:00:10.000Z"
        },
        {
          "n": 2,
          "status": "pending",
          "text": "love this"
        }
      ],
      "events": [
        "1r@10:done@10",
        "2r@40"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": [
        "2026-11-14 10:00:00 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
        "2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
        "2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
        "2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
        "2026-11-14 10:00:15 [waiting] cancelled while waiting for reply #2: nothing more is sent, 1 sent in total. Running it again resumes."
      ]
    }
  },
  "nudgeAndAddWhileRunning": {
    "lines": [
      "+10s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeBird/status/190000000000000010\",\"text\":\"nice one\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 0",
      "out log twitter queue add: 1 reply handed to the run going on <dir>/replyQueue.json; it fits them between what is planned and sends them through the account's one X session (log: queue log replyQueue in ~/.logCli/log.db).",
      "err 2026-11-14 10:00:20 add: 1 reply handed to the running run, approved by fakeOwner",
      "exit 0",
      "out log twitter queue nudge: the run sends its next 1 replies now (log: queue log replyQueue in ~/.logCli/log.db).",
      "err 2026-11-14 10:00:45 nudge: send the next 1 replies now",
      "+45s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeWren/status/1900000000000000555\",\"text\":\"added while it runs\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "+600s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeFinch/status/190000000000000011\",\"text\":\"love this\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 0",
      "out log twitter queue run: finished. 3 replies sent, 0 skipped. {\"sent\":3} (log: queue log replyQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:00 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "err 2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
      "err 2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
      "err 2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:10:00.000Z",
      "err 2026-11-14 10:00:20 added 1 to the queue while it runs, each fitted in its window and what was planned after it moved back to keep the gap: #3 at 2026-11-14T10:08:34.000Z",
      "err 2026-11-14 10:00:20 [waiting] next reply #3 @fakeWren at 2026-11-14T10:08:34.000Z",
      "err 2026-11-14 10:00:45 [waiting] nudged: reply #3 @fakeWren now (was 2026-11-14T10:08:34.000Z, 1 replies in the nudge)",
      "err 2026-11-14 10:00:45 #3 @fakeWren: voice gate: passed for @fakeWren (test)",
      "err 2026-11-14 10:00:45 #3 @fakeWren: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:20.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:45 #3 @fakeWren: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err 2026-11-14 10:00:45 SENT #3 @fakeWren https://x.com/xQueue/status/885",
      "err 2026-11-14 10:00:45 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:10:00.000Z",
      "err 2026-11-14 10:10:00 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
      "err 2026-11-14 10:10:00 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:10:00 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err 2026-11-14 10:10:00 SENT #2 @fakeFinch https://x.com/xQueue/status/881",
      "err 2026-11-14 10:10:00 [finished] random run done: 3 replies sent, 0 skipped"
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "sent",
          "text": "nice one",
          "sentId": "880",
          "sentUrl": "https://x.com/xQueue/status/880",
          "result": "{\"event\":\"sent\",\"tweetId\":\"880\"}",
          "attemptedAt": "2026-11-14T10:00:10.000Z"
        },
        {
          "n": 2,
          "status": "sent",
          "text": "love this",
          "sentId": "881",
          "sentUrl": "https://x.com/xQueue/status/881",
          "result": "{\"event\":\"sent\",\"tweetId\":\"881\"}",
          "attemptedAt": "2026-11-14T10:10:00.000Z"
        },
        {
          "n": 3,
          "status": "sent",
          "text": "added while it runs",
          "sentId": "885",
          "sentUrl": "https://x.com/xQueue/status/885",
          "result": "{\"event\":\"sent\",\"tweetId\":\"885\"}",
          "attemptedAt": "2026-11-14T10:00:45.000Z"
        }
      ],
      "events": [
        "1r@10:done@10",
        "2r@600:done@600",
        "3r@514:done@45"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": [
        "2026-11-14 10:00:00 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
        "2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
        "2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
        "2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:10:00.000Z",
        "2026-11-14 10:00:20 add: 1 reply handed to the running run, approved by fakeOwner",
        "2026-11-14 10:00:20 added 1 to the queue while it runs, each fitted in its window and what was planned after it moved back to keep the gap: #3 at 2026-11-14T10:08:34.000Z",
        "2026-11-14 10:00:20 [waiting] next reply #3 @fakeWren at 2026-11-14T10:08:34.000Z",
        "2026-11-14 10:00:45 nudge: send the next 1 replies now",
        "2026-11-14 10:00:45 [waiting] nudged: reply #3 @fakeWren now (was 2026-11-14T10:08:34.000Z, 1 replies in the nudge)",
        "2026-11-14 10:00:45 #3 @fakeWren: voice gate: passed for @fakeWren (test)",
        "2026-11-14 10:00:45 #3 @fakeWren: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:20.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:45 #3 @fakeWren: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:45 SENT #3 @fakeWren https://x.com/xQueue/status/885",
        "2026-11-14 10:00:45 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:10:00.000Z",
        "2026-11-14 10:10:00 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
        "2026-11-14 10:10:00 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:10:00 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:10:00 SENT #2 @fakeFinch https://x.com/xQueue/status/881",
        "2026-11-14 10:10:00 [finished] random run done: 3 replies sent, 0 skipped"
      ]
    }
  },
  "keepOpen": {
    "lines": [
      "+10s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeBird/status/190000000000000010\",\"text\":\"nice one\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 0",
      "out log twitter queue add: 1 reply handed to the run going on <dir>/replyQueue.json; it fits them between what is planned and sends them through the account's one X session (log: queue log replyQueue in ~/.logCli/log.db).",
      "err 2026-11-14 10:00:25 add: 1 reply handed to the running run, approved by fakeOwner",
      "+287s engine {\"action\":\"reply\",\"tweetUrl\":\"https://x.com/fakeWren/status/1900000000000000555\",\"text\":\"kept open for this\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 0",
      "out log twitter queue run: finished. 2 replies sent, 0 skipped. {\"sent\":2} (log: queue log replyQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:00 random run: 1 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "err 2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
      "err 2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
      "err 2026-11-14 10:00:10 [waiting] nothing left to send: kept open for what gets added (queue add), stop it with jobCancel",
      "err 2026-11-14 10:00:25 [waiting] 1 added, next at 2026-11-14T10:04:47.000Z",
      "err 2026-11-14 10:00:25 [waiting] next reply #2 @fakeWren at 2026-11-14T10:04:47.000Z",
      "err 2026-11-14 10:04:47 #2 @fakeWren: voice gate: passed for @fakeWren (test)",
      "err 2026-11-14 10:04:47 #2 @fakeWren: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:25.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:04:47 #2 @fakeWren: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err 2026-11-14 10:04:47 SENT #2 @fakeWren https://x.com/xQueue/status/885",
      "err 2026-11-14 10:04:47 [waiting] nothing left to send: kept open for what gets added (queue add), stop it with jobCancel",
      "err 2026-11-14 10:04:52 [finished] random run done: 2 replies sent, 0 skipped"
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "sent",
          "text": "nice one",
          "sentId": "880",
          "sentUrl": "https://x.com/xQueue/status/880",
          "result": "{\"event\":\"sent\",\"tweetId\":\"880\"}",
          "attemptedAt": "2026-11-14T10:00:10.000Z"
        },
        {
          "n": 2,
          "status": "sent",
          "text": "kept open for this",
          "sentId": "885",
          "sentUrl": "https://x.com/xQueue/status/885",
          "result": "{\"event\":\"sent\",\"tweetId\":\"885\"}",
          "attemptedAt": "2026-11-14T10:04:47.000Z"
        }
      ],
      "events": [
        "1r@10:done@10",
        "2r@287:done@287"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": [
        "2026-11-14 10:00:00 random run: 1 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
        "2026-11-14 10:00:10 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
        "2026-11-14 10:00:10 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:10 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:10 SENT #1 @fakeBird https://x.com/xQueue/status/880",
        "2026-11-14 10:00:10 [waiting] nothing left to send: kept open for what gets added (queue add), stop it with jobCancel",
        "2026-11-14 10:00:25 add: 1 reply handed to the running run, approved by fakeOwner",
        "2026-11-14 10:00:25 [waiting] 1 added, next at 2026-11-14T10:04:47.000Z",
        "2026-11-14 10:00:25 [waiting] next reply #2 @fakeWren at 2026-11-14T10:04:47.000Z",
        "2026-11-14 10:04:47 #2 @fakeWren: voice gate: passed for @fakeWren (test)",
        "2026-11-14 10:04:47 #2 @fakeWren: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:25.000Z, the account caught up): nothing new",
        "2026-11-14 10:04:47 #2 @fakeWren: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:04:47 SENT #2 @fakeWren https://x.com/xQueue/status/885",
        "2026-11-14 10:04:47 [waiting] nothing left to send: kept open for what gets added (queue add), stop it with jobCancel",
        "2026-11-14 10:04:52 [finished] random run done: 2 replies sent, 0 skipped"
      ]
    }
  },
  "heldThenEditThenRun": {
    "lines": [
      "+40s engine {\"action\":\"dm\",\"userId\":\"4301\",\"text\":\"yo made a free tool\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 0",
      "out log twitter queue run: finished. 1 replies sent, 1 skipped. {\"sent\":1,\"held\":1} (log: queue log dmQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:00 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "err 2026-11-14 10:00:10 #1 @fakeBird: >>> VOICE GATE FAILED for @fakeBird\n  - it reads like a template",
      "err 2026-11-14 10:00:10 HELD #1 @fakeBird: something happened with them since the draft, so it wasn't sent. Redraft it from their full context (`twitterDms` { with }) and put it back with `twitterQueueEdit`. What changed: voice gate: it reads like a template",
      "err 2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:00:40 SENT #2 @fakeFinch dm 4301-1",
      "err 2026-11-14 10:00:40 [finished] random run done: 1 replies sent, 1 skipped",
      "exit 0",
      "out log twitter queue edit: #1 @fakeBird now reads:\n  saw your post on the tool made you a copy\nplanned at 2026-11-14T10:24:21.000Z; the queue is approved again by fakeOwner. Nothing sent.",
      "err 2026-11-14 10:00:40 edit: #1 @fakeBird has new copy, approved by fakeOwner, planned again at 2026-11-14T10:24:21.000Z",
      "+1461s engine {\"action\":\"dm\",\"userId\":\"4300\",\"text\":\"saw your post on the tool made you a copy\",\"live\":true,\"approvedBy\":\"fakeOwner\"}",
      "exit 0",
      "out log twitter queue run: finished. 2 replies sent, 1 skipped. {\"sent\":2} (log: queue log dmQueue in ~/.logCli/log.db)",
      "err 2026-11-14 10:00:40 random run: 1 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
      "err 2026-11-14 10:00:40 [waiting] next reply #1 @fakeBird at 2026-11-14T10:24:21.000Z",
      "err 2026-11-14 10:24:21 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
      "err 2026-11-14 10:24:21 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:40.000Z, the account caught up): nothing new",
      "err 2026-11-14 10:24:21 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
      "err Twenty: xQueue sessionState loggedIn (X's own answer).",
      "err 2026-11-14 10:24:21 SENT #1 @fakeBird dm 4300-1",
      "err 2026-11-14 10:24:21 [finished] random run done: 2 replies sent, 1 skipped"
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "sent",
          "text": "saw your post on the tool made you a copy",
          "sentId": "4300-1",
          "sentUrl": null,
          "result": "{\"event\":\"sent\",\"conversationId\":\"4300-1\"}",
          "attemptedAt": "2026-11-14T10:24:21.000Z"
        },
        {
          "n": 2,
          "status": "sent",
          "text": "yo made a free tool",
          "sentId": "4301-1",
          "sentUrl": null,
          "result": "{\"event\":\"sent\",\"conversationId\":\"4301-1\"}",
          "attemptedAt": "2026-11-14T10:00:40.000Z"
        }
      ],
      "events": [
        "1r@10:held",
        "2r@40:done@40",
        "1r@1461:done@1461"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": [
        "2026-11-14 10:00:00 random run: 2 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:00 [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
        "2026-11-14 10:00:10 #1 @fakeBird: >>> VOICE GATE FAILED for @fakeBird\n  - it reads like a template",
        "2026-11-14 10:00:10 HELD #1 @fakeBird: something happened with them since the draft, so it wasn't sent. Redraft it from their full context (`twitterDms` { with }) and put it back with `twitterQueueEdit`. What changed: voice gate: it reads like a template",
        "2026-11-14 10:00:10 [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
        "2026-11-14 10:00:40 #2 @fakeFinch: voice gate: passed for @fakeFinch (test)",
        "2026-11-14 10:00:40 #2 @fakeFinch: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:00.000Z, the account caught up): nothing new",
        "2026-11-14 10:00:40 #2 @fakeFinch: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:00:40 SENT #2 @fakeFinch dm 4301-1",
        "2026-11-14 10:00:40 [finished] random run done: 1 replies sent, 1 skipped",
        "2026-11-14 10:00:40 edit: #1 @fakeBird has new copy, approved by fakeOwner, planned again at 2026-11-14T10:24:21.000Z",
        "2026-11-14 10:00:40 random run: 1 events from @xQueue, approved by fakeOwner, window 1h, stops on any refusal from x",
        "2026-11-14 10:00:40 [waiting] next reply #1 @fakeBird at 2026-11-14T10:24:21.000Z",
        "2026-11-14 10:24:21 #1 @fakeBird: voice gate: passed for @fakeBird (test)",
        "2026-11-14 10:24:21 #1 @fakeBird: context read from the .db right before sending (their messages both ways and what they did on the account's posts since the draft at 2026-11-14T10:00:40.000Z, the account caught up): nothing new",
        "2026-11-14 10:24:21 #1 @fakeBird: watermark clean: no hidden characters, pasted Claude markup or AI punctuation; Claude's statistical watermark: unknown (no public detector)",
        "2026-11-14 10:24:21 SENT #1 @fakeBird dm 4300-1",
        "2026-11-14 10:24:21 [finished] random run done: 2 replies sent, 1 skipped"
      ]
    }
  },
  "dryRun": {
    "lines": [
      "exit 0",
      "out log twitter queue run: dry run: @xQueue, approved by fakeOwner, 2 events would fire:\n  2026-11-14T10:00:10.000Z  #1 @fakeBird  reply https://x.com/fakeBird/status/190000000000000010: \"nice one\"\n  2026-11-14T10:00:40.000Z  #2 @fakeFinch  reply https://x.com/fakeFinch/status/190000000000000011: \"love this\"\nX was not contacted. --live sends them at these times (rule 8)."
    ],
    "state": {
      "items": [
        {
          "n": 1,
          "status": "pending",
          "text": "nice one"
        },
        {
          "n": 2,
          "status": "pending",
          "text": "love this"
        }
      ],
      "events": [
        "1r@10",
        "2r@40"
      ],
      "approvedBy": "fakeOwner",
      "lock": 0,
      "log": []
    }
  }
}
