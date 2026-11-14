export const EXPECTED: Record<string, unknown> = {
  "fullRun": {
    "timeline": [
      "added -",
      "+0s log random run: 5 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:20.000Z",
      "4x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+20s context #1 -",
      "+20s send reply #1 @fakeBird",
      "+20s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+20s save items[1:sent,2:pending,3:pending] events[1r@20:done@20,1l@45,2r@70,3l@90,3r@110] #7df912d98a",
      "+20s log [waiting] next like #1 @fakeBird at 2026-11-14T10:00:45.000Z",
      "5x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+45s send like #1 @fakeBird",
      "+45s log LIKED #1 @fakeBird",
      "+45s save items[1:sent,2:pending,3:pending] events[1r@20:done@20,1l@45:done@45,2r@70,3l@90,3r@110] #8a2638ac52",
      "+45s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:01:10.000Z",
      "5x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+70s context #2 -",
      "+70s send reply #2 @fakeFinch",
      "+70s log SENT #2 @fakeFinch https://x.com/xActs/status/772",
      "+70s save items[1:sent,2:sent,3:pending] events[1r@20:done@20,1l@45:done@45,2r@70:done@70,3l@90,3r@110] #50d96b2c08",
      "+70s log [waiting] next like #3 @fakeWren at 2026-11-14T10:01:30.000Z",
      "4x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+90s send like #3 @fakeWren",
      "+90s log LIKED #3 @fakeWren",
      "+90s save items[1:sent,2:sent,3:pending] events[1r@20:done@20,1l@45:done@45,2r@70:done@70,3l@90:done@90,3r@110] #452c93b6a2",
      "+90s log [waiting] next reply #3 @fakeWren at 2026-11-14T10:01:50.000Z",
      "4x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+110s context #3 -",
      "+110s send reply #3 @fakeWren",
      "+110s log SENT #3 @fakeWren https://x.com/xActs/status/773",
      "+110s save items[1:sent,2:sent,3:sent] events[1r@20:done@20,1l@45:done@45,2r@70:done@70,3l@90:done@90,3r@110:done@110] #b8ca6ac244",
      "added -",
      "+110s save items[1:sent,2:sent,3:sent] events[1r@20:done@20,1l@45:done@45,2r@70:done@70,3l@90:done@90,3r@110:done@110] #b8ca6ac244",
      "+110s log [finished] random run done: 3 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 3,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:20.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}",
        "likedAt": "2026-11-14T10:00:45.000Z"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:01:10.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeWren",
        "text": "nice one fakeWren",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeWren/status/190000000000000002",
        "postText": "",
        "likedAt": "2026-11-14T10:01:30.000Z",
        "attemptedAt": "2026-11-14T10:01:50.000Z",
        "sentId": "773",
        "sentUrl": "https://x.com/xActs/status/773",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"773\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:20.000Z",
        "done": "2026-11-14T10:00:20.000Z"
      },
      {
        "n": 1,
        "kind": "like",
        "at": "2026-11-14T10:00:45.000Z",
        "done": "2026-11-14T10:00:45.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:01:10.000Z",
        "done": "2026-11-14T10:01:10.000Z"
      },
      {
        "n": 3,
        "kind": "like",
        "at": "2026-11-14T10:01:30.000Z",
        "done": "2026-11-14T10:01:30.000Z"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:01:50.000Z",
        "done": "2026-11-14T10:01:50.000Z"
      }
    ]
  },
  "dmRun": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:12.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "sleep 2000",
      "cancelled false",
      "added -",
      "nudge 0",
      "cancelled false",
      "+12s context #1 -",
      "+12s send reply #1 @fakeBird",
      "+12s log SENT #1 @fakeBird dm 4200-1",
      "+12s save items[1:sent,2:pending] events[1r@12:done@12,2r@40] #21e61d0f30",
      "+12s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "5x [sleep 5000 | cancelled false | added - | nudge 0]",
      "sleep 3000",
      "cancelled false",
      "added -",
      "nudge 0",
      "cancelled false",
      "+40s context #2 -",
      "+40s send reply #2 @fakeFinch",
      "+40s log SENT #2 @fakeFinch dm 4201-1",
      "+40s save items[1:sent,2:sent] events[1r@12:done@12,2r@40:done@40] #fd26a421f0",
      "added -",
      "+40s save items[1:sent,2:sent] events[1r@12:done@12,2r@40:done@40] #fd26a421f0",
      "+40s log [finished] random run done: 2 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 2,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "dm",
        "handle": "fakeBird",
        "text": "yo fakeBird the new tool is up",
        "status": "sent",
        "userId": "4200",
        "attemptedAt": "2026-11-14T10:00:12.000Z",
        "sentId": "4200-1",
        "sentUrl": null,
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"conversationId\":\"4200-1\"}"
      },
      {
        "n": 2,
        "action": "dm",
        "handle": "fakeFinch",
        "text": "yo fakeFinch the new tool is up",
        "status": "sent",
        "userId": "4201",
        "attemptedAt": "2026-11-14T10:00:40.000Z",
        "sentId": "4201-1",
        "sentUrl": null,
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"conversationId\":\"4201-1\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:12.000Z",
        "done": "2026-11-14T10:00:12.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:40.000Z",
        "done": "2026-11-14T10:00:40.000Z"
      }
    ]
  },
  "pacing": {
    "timeline": [
      "added -",
      "+0s log random run: 3 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:03.000Z",
      "sleep 3000",
      "cancelled false",
      "added -",
      "nudge 0",
      "cancelled false",
      "+3s context #1 -",
      "+3s send reply #1 @fakeBird",
      "+3s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+3s save items[1:sent,2:pending,3:pending] events[1r@3:done@3,2r@9,3r@14] #20113cd63f",
      "+3s log [waiting] #2 was due 24s too soon after the last send, moved to 2026-11-14T10:00:48.000Z to keep the 30s gap",
      "+3s save items[1:sent,2:pending,3:pending] events[1r@3:done@3,2r@48,3r@14] #4c2d44170b",
      "+3s log [waiting] #3 was due 19s too soon after the last send, moved to 2026-11-14T10:00:49.000Z to keep the 30s gap",
      "+3s save items[1:sent,2:pending,3:pending] events[1r@3:done@3,2r@48,3r@49] #60ecb38e8f",
      "+3s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:48.000Z",
      "9x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+48s context #2 -",
      "+48s send reply #2 @fakeFinch",
      "+48s log SENT #2 @fakeFinch https://x.com/xActs/status/772",
      "+48s save items[1:sent,2:sent,3:pending] events[1r@3:done@3,2r@48:done@48,3r@49] #23d966ee92",
      "+48s log [waiting] #3 was due 29s too soon after the last send, moved to 2026-11-14T10:01:36.000Z to keep the 30s gap",
      "+48s save items[1:sent,2:sent,3:pending] events[1r@3:done@3,2r@48:done@48,3r@96] #d05a0706c3",
      "+48s log [waiting] next reply #3 @fakeWren at 2026-11-14T10:01:36.000Z",
      "9x [sleep 5000 | cancelled false | added - | nudge 0]",
      "sleep 3000",
      "cancelled false",
      "added -",
      "nudge 0",
      "cancelled false",
      "+96s context #3 -",
      "+96s send reply #3 @fakeWren",
      "+96s log SENT #3 @fakeWren https://x.com/xActs/status/773",
      "+96s save items[1:sent,2:sent,3:sent] events[1r@3:done@3,2r@48:done@48,3r@96:done@96] #154c8b99ce",
      "added -",
      "+96s save items[1:sent,2:sent,3:sent] events[1r@3:done@3,2r@48:done@48,3r@96:done@96] #154c8b99ce",
      "+96s log [finished] random run done: 3 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 3,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:03.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:48.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeWren",
        "text": "nice one fakeWren",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeWren/status/190000000000000002",
        "postText": "",
        "attemptedAt": "2026-11-14T10:01:36.000Z",
        "sentId": "773",
        "sentUrl": "https://x.com/xActs/status/773",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"773\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:03.000Z",
        "done": "2026-11-14T10:00:03.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:48.000Z",
        "done": "2026-11-14T10:00:48.000Z"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:01:36.000Z",
        "done": "2026-11-14T10:01:36.000Z"
      }
    ]
  },
  "pacingAfterResume": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] #2 was due 8s too soon after the last send, moved to 2026-11-14T10:00:25.000Z to keep the 30s gap",
      "+0s save items[1:sent,2:pending,3:pending] events[1r@-40:done@-20,2r@25,3r@50] #898f1d8f7d",
      "+0s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:25.000Z",
      "5x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+25s context #2 -",
      "+25s send reply #2 @fakeFinch",
      "+25s log SENT #2 @fakeFinch https://x.com/xActs/status/772",
      "+25s save items[1:sent,2:sent,3:pending] events[1r@-40:done@-20,2r@25:done@25,3r@50] #742e177878",
      "+25s log [waiting] #3 was due 5s too soon after the last send, moved to 2026-11-14T10:01:11.000Z to keep the 30s gap",
      "+25s save items[1:sent,2:sent,3:pending] events[1r@-40:done@-20,2r@25:done@25,3r@71] #9a1b66ffb5",
      "+25s log [waiting] next reply #3 @fakeWren at 2026-11-14T10:01:11.000Z",
      "9x [sleep 5000 | cancelled false | added - | nudge 0]",
      "sleep 1000",
      "cancelled false",
      "added -",
      "nudge 0",
      "cancelled false",
      "+71s context #3 -",
      "+71s send reply #3 @fakeWren",
      "+71s log SENT #3 @fakeWren https://x.com/xActs/status/773",
      "+71s save items[1:sent,2:sent,3:sent] events[1r@-40:done@-20,2r@25:done@25,3r@71:done@71] #e1b8dc279b",
      "added -",
      "+71s save items[1:sent,2:sent,3:sent] events[1r@-40:done@-20,2r@25:done@25,3r@71:done@71] #e1b8dc279b",
      "+71s log [finished] random run done: 3 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 3,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "sentAtRun": "2026-11-14T10:00:00.000Z"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:25.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeWren",
        "text": "nice one fakeWren",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeWren/status/190000000000000002",
        "postText": "",
        "attemptedAt": "2026-11-14T10:01:11.000Z",
        "sentId": "773",
        "sentUrl": "https://x.com/xActs/status/773",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"773\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T09:59:20.000Z",
        "done": "2026-11-14T09:59:40.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:25.000Z",
        "done": "2026-11-14T10:00:25.000Z"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:01:11.000Z",
        "done": "2026-11-14T10:01:11.000Z"
      }
    ]
  },
  "governorRefusal": {
    "timeline": [
      "added -",
      "+0s log random run: 3 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,2r@30,3r@50] #0b2b0f3c45",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:30.000Z",
      "4x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+30s context #2 -",
      "+30s send reply #2 @fakeFinch",
      "+30s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,2r@30,3r@50] #e09c3469be",
      "+30s alert! REFUSED reply #2 @fakeFinch: x answered at 2026-11-14 10:00:30 UTC: governorBlocked: cooldown active for 660s. The run stopped here: #2 stays pending and nothing more was sent. Nothing goes out on @xActs until matt starts a run again (rule 94). (1 sent in total)"
    ],
    "result": {
      "state": "halted",
      "reason": "x refused reply #2 @fakeFinch: governorBlocked: cooldown active for 660s",
      "sent": 1,
      "skipped": 0,
      "refusal": {
        "code": "governorBlocked",
        "detail": "cooldown active for 660s",
        "at": "2026-11-14T10:00:30.000Z"
      }
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:30.000Z",
        "result": "governorBlocked: cooldown active for 660s"
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeWren",
        "text": "nice one fakeWren",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeWren/status/190000000000000002",
        "postText": ""
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:30.000Z"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:00:50.000Z"
      }
    ]
  },
  "platformRefusal": {
    "timeline": [
      "added -",
      "+0s log random run: 3 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,1l@30,2r@50] #4a378d4e35",
      "+10s log [waiting] next like #1 @fakeBird at 2026-11-14T10:00:30.000Z",
      "4x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+30s send like #1 @fakeBird",
      "+30s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,1l@30,2r@50] #08228f17f7",
      "+30s alert! REFUSED like #1 @fakeBird: x answered at 2026-11-14 10:00:30 UTC: CouldNotTweet: (226) This request looks like it might be automated. The run stopped here: #1 stays pending and nothing more was sent. Nothing goes out on @xActs until matt starts a run again (rule 94). (1 sent in total)"
    ],
    "result": {
      "state": "halted",
      "reason": "x refused like #1 @fakeBird: CouldNotTweet: (226) This request looks like it might be automated",
      "sent": 1,
      "skipped": 0,
      "refusal": {
        "code": "CouldNotTweet",
        "detail": "(226) This request looks like it might be automated",
        "at": "2026-11-14T10:00:30.000Z"
      }
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "CouldNotTweet: (226) This request looks like it might be automated"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": ""
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeWren",
        "text": "nice one fakeWren",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeWren/status/190000000000000002",
        "postText": ""
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 1,
        "kind": "like",
        "at": "2026-11-14T10:00:30.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:50.000Z"
      }
    ]
  },
  "sessionDead": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s save items[1:pending,2:pending] events[1r@10,2r@30] #ee514cd9ef",
      "+10s alert! REFUSED reply #1 @fakeBird: x answered at 2026-11-14 10:00:10 UTC: sessionDead: X answered HTTP 401. The session failed: log in to x again by hand. The run stopped here: #1 stays pending and nothing more was sent. Nothing goes out on @xActs until matt starts a run again (rule 94). (0 sent in total)"
    ],
    "result": {
      "state": "halted",
      "reason": "x refused reply #1 @fakeBird: sessionDead: X answered HTTP 401",
      "sent": 0,
      "skipped": 0,
      "refusal": {
        "code": "sessionDead",
        "detail": "X answered HTTP 401",
        "at": "2026-11-14T10:00:10.000Z"
      }
    },
    "items": [
      {
        "n": 1,
        "action": "dm",
        "handle": "fakeBird",
        "text": "yo fakeBird the new tool is up",
        "status": "pending",
        "userId": "4200",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "result": "sessionDead: X answered HTTP 401"
      },
      {
        "n": 2,
        "action": "dm",
        "handle": "fakeFinch",
        "text": "yo fakeFinch the new tool is up",
        "status": "pending",
        "userId": "4201"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:30.000Z"
      }
    ]
  },
  "engineThrow": {
    "timeline": [
      "added -",
      "+0s log random run: 3 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,2r@30,3r@50] #0b2b0f3c45",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:30.000Z",
      "4x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+30s context #2 -",
      "+30s send reply #2 @fakeFinch"
    ],
    "result": {
      "threw": "socket closed"
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": ""
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeWren",
        "text": "nice one fakeWren",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeWren/status/190000000000000002",
        "postText": ""
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:30.000Z"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:00:50.000Z"
      }
    ]
  },
  "contextThrow": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:pending] events[1r@10:done@10,2r@30] #8740296250",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:30.000Z",
      "4x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false"
    ],
    "result": {
      "threw": "log.db is locked"
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": ""
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:30.000Z"
      }
    ]
  },
  "cancelMidWait": {
    "timeline": [
      "added -",
      "+0s log random run: 3 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,2r@40,3r@70] #f4179d1fbb",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "sleep 5000",
      "cancelled true",
      "+25s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,2r@40,3r@70] #f4179d1fbb",
      "+25s log [waiting] cancelled while waiting for reply #2: nothing more is sent, 1 sent in total. Running it again resumes."
    ],
    "result": {
      "state": "halted",
      "reason": "cancelled",
      "sent": 1,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": ""
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeWren",
        "text": "nice one fakeWren",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeWren/status/190000000000000002",
        "postText": ""
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:40.000Z"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:01:10.000Z"
      }
    ]
  },
  "cancelMidSend": {
    "timeline": [
      "added -",
      "+0s log random run: 3 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,2r@40,3r@70] #f4179d1fbb",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "6x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+40s context #2 -",
      "+40s send reply #2 @fakeFinch",
      "+40s log SENT #2 @fakeFinch https://x.com/xActs/status/772",
      "+40s save items[1:sent,2:sent,3:pending] events[1r@10:done@10,2r@40:done@40,3r@70] #da96974b2b",
      "+40s log [waiting] next reply #3 @fakeWren at 2026-11-14T10:01:10.000Z",
      "sleep 5000",
      "cancelled true",
      "+45s save items[1:sent,2:sent,3:pending] events[1r@10:done@10,2r@40:done@40,3r@70] #da96974b2b",
      "+45s log [waiting] cancelled while waiting for reply #3: nothing more is sent, 2 sent in total. Running it again resumes."
    ],
    "result": {
      "state": "halted",
      "reason": "cancelled",
      "sent": 2,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:40.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeWren",
        "text": "nice one fakeWren",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeWren/status/190000000000000002",
        "postText": ""
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:40.000Z",
        "done": "2026-11-14T10:00:40.000Z"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:01:10.000Z"
      }
    ]
  },
  "cancelMidSendDue": {
    "timeline": [
      "added -",
      "+0s log random run: 3 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,2r@26,3r@70] #609936c9a7",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:26.000Z",
      "sleep 5000",
      "cancelled true",
      "+15s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,2r@26,3r@70] #609936c9a7",
      "+15s log [waiting] cancelled while waiting for reply #2: nothing more is sent, 1 sent in total. Running it again resumes."
    ],
    "result": {
      "state": "halted",
      "reason": "cancelled",
      "sent": 1,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": ""
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeWren",
        "text": "nice one fakeWren",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeWren/status/190000000000000002",
        "postText": ""
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:26.000Z"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:01:10.000Z"
      }
    ]
  },
  "cancelBeforeSend": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "cancelled true",
      "+0s save items[1:pending,2:pending] events[1r@-5,2r@40] #8041d2dafa",
      "+0s log [waiting] cancelled before reply #1: nothing more is sent, 0 sent in total. Running it again resumes."
    ],
    "result": {
      "state": "halted",
      "reason": "cancelled",
      "sent": 0,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": ""
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": ""
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T09:59:55.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:40.000Z"
      }
    ]
  },
  "nudgeDuringWait": {
    "timeline": [
      "added -",
      "+0s log random run: 4 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:pending,3:pending,4:pending] events[1r@10:done@10,2r@300,3r@600,4r@900] #fc95e6d3e7",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:05:00.000Z",
      "sleep 5000",
      "cancelled false",
      "added -",
      "nudge 0",
      "sleep 5000",
      "cancelled false",
      "added -",
      "nudge 2",
      "+20s log [waiting] nudged: reply #2 @fakeFinch now (was 2026-11-14T10:05:00.000Z, 2 replies in the nudge)",
      "cancelled false",
      "+20s context #2 -",
      "+20s send reply #2 @fakeFinch",
      "+20s log SENT #2 @fakeFinch https://x.com/xActs/status/772",
      "+20s save items[1:sent,2:sent,3:pending,4:pending] events[1r@10:done@10,2r@300:done@20,3r@600,4r@900] #0c81ad0cd3",
      "sleep 40463",
      "+60.46348193359375s log [waiting] nudged: reply #3 @fakeWren now (was 2026-11-14T10:10:00.000Z, 1 replies left in the nudge)",
      "cancelled false",
      "+60.46348193359375s context #3 -",
      "+60.46348193359375s send reply #3 @fakeWren",
      "+60.46348193359375s log SENT #3 @fakeWren https://x.com/xActs/status/773",
      "+60.46348193359375s save items[1:sent,2:sent,3:sent,4:pending] events[1r@10:done@10,2r@300:done@20,3r@600:done@60.463,4r@900] #9bcbd1d33b",
      "+60.46348193359375s log [waiting] next reply #4 @fakeRobin at 2026-11-14T10:15:00.000Z",
      "167x [sleep 5000 | cancelled false | added - | nudge 0]",
      "sleep 4537",
      "cancelled false",
      "added -",
      "nudge 0",
      "cancelled false",
      "+900s context #4 -",
      "+900s send reply #4 @fakeRobin",
      "+900s log SENT #4 @fakeRobin https://x.com/xActs/status/774",
      "+900s save items[1:sent,2:sent,3:sent,4:sent] events[1r@10:done@10,2r@300:done@20,3r@600:done@60.463,4r@900:done@900] #f801160792",
      "added -",
      "+900s save items[1:sent,2:sent,3:sent,4:sent] events[1r@10:done@10,2r@300:done@20,3r@600:done@60.463,4r@900:done@900] #f801160792",
      "+900s log [finished] random run done: 4 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 4,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:20.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeWren",
        "text": "nice one fakeWren",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeWren/status/190000000000000002",
        "postText": "",
        "attemptedAt": "2026-11-14T10:01:00.463Z",
        "sentId": "773",
        "sentUrl": "https://x.com/xActs/status/773",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"773\"}"
      },
      {
        "n": 4,
        "action": "reply",
        "handle": "fakeRobin",
        "text": "nice one fakeRobin",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeRobin/status/190000000000000003",
        "postText": "",
        "attemptedAt": "2026-11-14T10:15:00.000Z",
        "sentId": "774",
        "sentUrl": "https://x.com/xActs/status/774",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"774\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:05:00.000Z",
        "done": "2026-11-14T10:00:20.000Z"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:10:00.000Z",
        "done": "2026-11-14T10:01:00.463Z"
      },
      {
        "n": 4,
        "kind": "reply",
        "at": "2026-11-14T10:15:00.000Z",
        "done": "2026-11-14T10:15:00.000Z"
      }
    ]
  },
  "nudgeAtStart": {
    "timeline": [
      "added -",
      "+0s log random run: 3 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 1",
      "sleep 40463",
      "+40.46348193359375s log [waiting] nudged: reply #1 @fakeBird now (was 2026-11-14T10:03:20.000Z, 1 replies left in the nudge)",
      "cancelled false",
      "+40.46348193359375s context #1 -",
      "+40.46348193359375s send reply #1 @fakeBird",
      "+40.46348193359375s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+40.46348193359375s save items[1:sent,2:pending] events[1r@200:done@40.463,1l@260,2r@400] #1feb219d5a",
      "+40.46348193359375s log [waiting] next like #1 @fakeBird at 2026-11-14T10:04:20.000Z",
      "43x [sleep 5000 | cancelled false | added - | nudge 0]",
      "sleep 4537",
      "cancelled false",
      "added -",
      "nudge 0",
      "cancelled false",
      "+260s send like #1 @fakeBird",
      "+260s log LIKED #1 @fakeBird",
      "+260s save items[1:sent,2:pending] events[1r@200:done@40.463,1l@260:done@260,2r@400] #74b5e21d5a",
      "+260s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:06:40.000Z",
      "28x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+400s context #2 -",
      "+400s send reply #2 @fakeFinch",
      "+400s log SENT #2 @fakeFinch https://x.com/xActs/status/772",
      "+400s save items[1:sent,2:sent] events[1r@200:done@40.463,1l@260:done@260,2r@400:done@400] #4dbfce4a14",
      "added -",
      "+400s save items[1:sent,2:sent] events[1r@200:done@40.463,1l@260:done@260,2r@400:done@400] #4dbfce4a14",
      "+400s log [finished] random run done: 2 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 2,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:40.463Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}",
        "likedAt": "2026-11-14T10:04:20.000Z"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:06:40.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:03:20.000Z",
        "done": "2026-11-14T10:00:40.463Z"
      },
      {
        "n": 1,
        "kind": "like",
        "at": "2026-11-14T10:04:20.000Z",
        "done": "2026-11-14T10:04:20.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:06:40.000Z",
        "done": "2026-11-14T10:06:40.000Z"
      }
    ]
  },
  "addedEarly": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:pending] events[1r@10:done@10,2r@120] #d4b3f1a31c",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:02:00.000Z",
      "sleep 5000",
      "cancelled false",
      "added #3r@60",
      "+15s log added 1 to the queue while it runs, each fitted in its window and what was planned after it moved back to keep the gap: #3 at 2026-11-14T10:01:00.000Z",
      "+15s log [waiting] next reply #3 @fakeLark at 2026-11-14T10:01:00.000Z",
      "9x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+60s context #3 -",
      "+60s send reply #3 @fakeLark",
      "+60s log SENT #3 @fakeLark https://x.com/xActs/status/773",
      "+60s save items[1:sent,2:pending,3:sent] events[1r@10:done@10,2r@120,3r@60:done@60] #9e1ff65746",
      "+60s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:02:00.000Z",
      "12x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+120s context #2 -",
      "+120s send reply #2 @fakeFinch",
      "+120s log SENT #2 @fakeFinch https://x.com/xActs/status/772",
      "+120s save items[1:sent,2:sent,3:sent] events[1r@10:done@10,2r@120:done@120,3r@60:done@60] #a0994ce3a3",
      "added -",
      "+120s save items[1:sent,2:sent,3:sent] events[1r@10:done@10,2r@120:done@120,3r@60:done@60] #a0994ce3a3",
      "+120s log [finished] random run done: 3 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 3,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:02:00.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeLark",
        "text": "added for fakeLark",
        "tweetUrl": "https://x.com/fakeLark/status/1900000000000000099",
        "status": "sent",
        "attemptedAt": "2026-11-14T10:01:00.000Z",
        "sentId": "773",
        "sentUrl": "https://x.com/xActs/status/773",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"773\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:02:00.000Z",
        "done": "2026-11-14T10:02:00.000Z"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:01:00.000Z",
        "done": "2026-11-14T10:01:00.000Z"
      }
    ]
  },
  "addedLate": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "sleep 5000",
      "cancelled false",
      "added -",
      "nudge 0",
      "sleep 5000",
      "cancelled false",
      "added #3r@200",
      "+10s log added 1 to the queue while it runs, each fitted in its window and what was planned after it moved back to keep the gap: #3 at 2026-11-14T10:03:20.000Z",
      "nudge 0",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,2r@60,3r@200] #080a93baae",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:01:00.000Z",
      "10x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+60s context #2 -",
      "+60s send reply #2 @fakeFinch",
      "+60s log SENT #2 @fakeFinch https://x.com/xActs/status/772",
      "+60s save items[1:sent,2:sent,3:pending] events[1r@10:done@10,2r@60:done@60,3r@200] #acd49c231a",
      "+60s log [waiting] next reply #3 @fakeLark at 2026-11-14T10:03:20.000Z",
      "28x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+200s context #3 -",
      "+200s send reply #3 @fakeLark",
      "+200s log SENT #3 @fakeLark https://x.com/xActs/status/773",
      "+200s save items[1:sent,2:sent,3:sent] events[1r@10:done@10,2r@60:done@60,3r@200:done@200] #bc3f9bb99a",
      "added -",
      "+200s save items[1:sent,2:sent,3:sent] events[1r@10:done@10,2r@60:done@60,3r@200:done@200] #bc3f9bb99a",
      "+200s log [finished] random run done: 3 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 3,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:01:00.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeLark",
        "text": "added for fakeLark",
        "tweetUrl": "https://x.com/fakeLark/status/1900000000000000099",
        "status": "sent",
        "attemptedAt": "2026-11-14T10:03:20.000Z",
        "sentId": "773",
        "sentUrl": "https://x.com/xActs/status/773",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"773\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:01:00.000Z",
        "done": "2026-11-14T10:01:00.000Z"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:03:20.000Z",
        "done": "2026-11-14T10:03:20.000Z"
      }
    ]
  },
  "addedAtStart": {
    "timeline": [
      "added #2r@10",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #2 @fakeLark at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #2 -",
      "+10s send reply #2 @fakeLark",
      "+10s log SENT #2 @fakeLark https://x.com/xActs/status/772",
      "+10s save items[1:pending,2:sent] events[1r@40,2r@10:done@10] #4d78ef430d",
      "+10s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:40.000Z",
      "6x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+40s context #1 -",
      "+40s send reply #1 @fakeBird",
      "+40s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+40s save items[1:sent,2:sent] events[1r@40:done@40,2r@10:done@10] #51c4cdc7b5",
      "added -",
      "+40s save items[1:sent,2:sent] events[1r@40:done@40,2r@10:done@10] #51c4cdc7b5",
      "+40s log [finished] random run done: 2 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 2,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:40.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeLark",
        "text": "added for fakeLark",
        "tweetUrl": "https://x.com/fakeLark/status/1900000000000000099",
        "status": "sent",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:40.000Z",
        "done": "2026-11-14T10:00:40.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      }
    ]
  },
  "keepOpen": {
    "timeline": [
      "added -",
      "+0s log random run: 1 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent] events[1r@10:done@10] #5eadfdd626",
      "added -",
      "+10s log [waiting] nothing left to send: kept open for what gets added (queue add), stop it with jobCancel",
      "sleep 5000",
      "cancelled false",
      "added -",
      "sleep 5000",
      "cancelled false",
      "added #2r@30",
      "+20s log [waiting] 1 added, next at 2026-11-14T10:00:30.000Z",
      "+20s log [waiting] #2 was due 10s too soon after the last send, moved to 2026-11-14T10:00:55.000Z to keep the 30s gap",
      "+20s save items[1:sent,2:pending] events[1r@10:done@10,2r@55] #d05103f1e3",
      "+20s log [waiting] next reply #2 @fakeLark at 2026-11-14T10:00:55.000Z",
      "7x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+55s context #2 -",
      "+55s send reply #2 @fakeLark",
      "+55s log SENT #2 @fakeLark https://x.com/xActs/status/772",
      "+55s save items[1:sent,2:sent] events[1r@10:done@10,2r@55:done@55] #a4f5c9431b",
      "added -",
      "+55s log [waiting] nothing left to send: kept open for what gets added (queue add), stop it with jobCancel",
      "sleep 5000",
      "cancelled true",
      "+60s save items[1:sent,2:sent] events[1r@10:done@10,2r@55:done@55] #a4f5c9431b",
      "+60s log [finished] random run done: 2 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 2,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeLark",
        "text": "added for fakeLark",
        "tweetUrl": "https://x.com/fakeLark/status/1900000000000000099",
        "status": "sent",
        "attemptedAt": "2026-11-14T10:00:55.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:55.000Z",
        "done": "2026-11-14T10:00:55.000Z"
      }
    ]
  },
  "keepOpenCancelled": {
    "timeline": [
      "added -",
      "+0s log random run: 1 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent] events[1r@10:done@10] #5eadfdd626",
      "added -",
      "+10s log [waiting] nothing left to send: kept open for what gets added (queue add), stop it with jobCancel",
      "2x [sleep 5000 | cancelled false | added -]",
      "sleep 5000",
      "cancelled true",
      "+25s save items[1:sent] events[1r@10:done@10] #5eadfdd626",
      "+25s log [finished] random run done: 1 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 1,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      }
    ]
  },
  "notKeptOpen": {
    "timeline": [
      "added -",
      "+0s log random run: 1 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent] events[1r@10:done@10] #5eadfdd626",
      "added #2r@30",
      "+10s log [waiting] #2 was due 10s too soon after the last send, moved to 2026-11-14T10:00:55.000Z to keep the 30s gap",
      "+10s save items[1:sent,2:pending] events[1r@10:done@10,2r@55] #d05103f1e3",
      "+10s log [waiting] next reply #2 @fakeLark at 2026-11-14T10:00:55.000Z",
      "9x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+55s context #2 -",
      "+55s send reply #2 @fakeLark",
      "+55s log SENT #2 @fakeLark https://x.com/xActs/status/772",
      "+55s save items[1:sent,2:sent] events[1r@10:done@10,2r@55:done@55] #a4f5c9431b",
      "added -",
      "+55s save items[1:sent,2:sent] events[1r@10:done@10,2r@55:done@55] #a4f5c9431b",
      "+55s log [finished] random run done: 2 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 2,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeLark",
        "text": "added for fakeLark",
        "tweetUrl": "https://x.com/fakeLark/status/1900000000000000099",
        "status": "sent",
        "attemptedAt": "2026-11-14T10:00:55.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:55.000Z",
        "done": "2026-11-14T10:00:55.000Z"
      }
    ]
  },
  "noTakeAdded": {
    "timeline": [
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | nudge 0]",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:pending] events[1r@10:done@10,2r@30] #8740296250",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:30.000Z",
      "4x [sleep 5000 | nudge 0]",
      "+30s context #2 -",
      "+30s send reply #2 @fakeFinch",
      "+30s log SENT #2 @fakeFinch https://x.com/xActs/status/772",
      "2x [+30s save items[1:sent,2:sent] events[1r@10:done@10,2r@30:done@30] #639a5113c4]",
      "+30s log [finished] random run done: 2 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 2,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:30.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:30.000Z",
        "done": "2026-11-14T10:00:30.000Z"
      }
    ]
  },
  "contextMoved": {
    "timeline": [
      "added -",
      "+0s log random run: 4 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,2l@25,2r@40,3r@60] #0f2e7077f1",
      "+10s log [waiting] next like #2 @fakeFinch at 2026-11-14T10:00:25.000Z",
      "3x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+25s send like #2 @fakeFinch",
      "+25s log LIKED #2 @fakeFinch",
      "+25s save items[1:sent,2:pending,3:pending] events[1r@10:done@10,2l@25:done@25,2r@40,3r@60] #8c56f5c45a",
      "+25s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "3x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+40s context #2 2026-11-14T10:00:20Z they retweeted your post",
      "+40s alert HELD #2 @fakeFinch: something happened with them since the draft, so it wasn't sent. Redraft it from their full context (`twitterDms` { with }) and put it back with `twitterQueueEdit`. What changed: 2026-11-14T10:00:20Z they retweeted your post",
      "+40s save items[1:sent,2:held,3:pending] events[1r@10:done@10,2l@25:done@25,2r@40:held,3r@60] #62c6895721",
      "+40s log [waiting] next reply #3 @fakeWren at 2026-11-14T10:01:00.000Z",
      "4x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+60s context #3 -",
      "+60s send reply #3 @fakeWren",
      "+60s log SENT #3 @fakeWren https://x.com/xActs/status/773",
      "+60s save items[1:sent,2:held,3:sent] events[1r@10:done@10,2l@25:done@25,2r@40:held,3r@60:done@60] #e50b91182f",
      "added -",
      "+60s save items[1:sent,2:held,3:sent] events[1r@10:done@10,2l@25:done@25,2r@40:held,3r@60:done@60] #e50b91182f",
      "+60s log [finished] random run done: 2 replies sent, 1 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 2,
      "skipped": 1
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "held",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "likedAt": "2026-11-14T10:00:25.000Z",
        "heldFor": [
          "2026-11-14T10:00:20Z they retweeted your post"
        ],
        "result": "contextChanged: 1 new since the draft"
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeWren",
        "text": "nice one fakeWren",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeWren/status/190000000000000002",
        "postText": "",
        "attemptedAt": "2026-11-14T10:01:00.000Z",
        "sentId": "773",
        "sentUrl": "https://x.com/xActs/status/773",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"773\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "like",
        "at": "2026-11-14T10:00:25.000Z",
        "done": "2026-11-14T10:00:25.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:40.000Z",
        "skipped": "held"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:01:00.000Z",
        "done": "2026-11-14T10:01:00.000Z"
      }
    ]
  },
  "contextStops": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 >>> BEHIND: twitter xActs is still catching up, so nothing was sent",
      "+10s alert HELD #1 @fakeBird: something happened with them since the draft, so it wasn't sent. Redraft it from their full context (`twitterDms` { with }) and put it back with `twitterQueueEdit`. What changed: >>> BEHIND: twitter xActs is still catching up, so nothing was sent",
      "+10s save items[1:held,2:pending] events[1r@10:held,2r@40] #8d5c4983ba",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "6x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+40s context #2 >>> BEHIND: twitter xActs is still catching up, so nothing was sent",
      "+40s alert HELD #2 @fakeFinch: something happened with them since the draft, so it wasn't sent. Redraft it from their full context (`twitterDms` { with }) and put it back with `twitterQueueEdit`. What changed: >>> BEHIND: twitter xActs is still catching up, so nothing was sent",
      "+40s save items[1:held,2:held] events[1r@10:held,2r@40:held] #9cd0f9dbfe",
      "added -",
      "+40s save items[1:held,2:held] events[1r@10:held,2r@40:held] #9cd0f9dbfe",
      "+40s log [finished] random run done: 0 replies sent, 2 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 0,
      "skipped": 2
    },
    "items": [
      {
        "n": 1,
        "action": "dm",
        "handle": "fakeBird",
        "text": "yo fakeBird the new tool is up",
        "status": "held",
        "userId": "4200",
        "heldFor": [
          ">>> BEHIND: twitter xActs is still catching up, so nothing was sent"
        ],
        "result": "contextChanged: 1 new since the draft"
      },
      {
        "n": 2,
        "action": "dm",
        "handle": "fakeFinch",
        "text": "yo fakeFinch the new tool is up",
        "status": "held",
        "userId": "4201",
        "heldFor": [
          ">>> BEHIND: twitter xActs is still catching up, so nothing was sent"
        ],
        "result": "contextChanged: 1 new since the draft"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "skipped": "held"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:40.000Z",
        "skipped": "held"
      }
    ]
  },
  "networkDrop": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log [retrying] reply #1 @fakeBird: the connection dropped with no answer from x (RequestsError: curl: (56) Recv failure: Connection was reset), a network error, not x refusing. planned again at 2026-11-14T10:02:11.000Z (drop 1 of 3)",
      "+10s save items[1:pending,2:pending] events[1r@131,2r@400] #acb8e05c8c",
      "+10s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:02:11.000Z",
      "24x [sleep 5000 | cancelled false | added - | nudge 0]",
      "sleep 1000",
      "cancelled false",
      "added -",
      "nudge 0",
      "cancelled false",
      "+131s context #1 -",
      "+131s send reply #1 @fakeBird",
      "+131s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+131s save items[1:sent,2:pending] events[1r@131:done@131,2r@400] #b77db1cd73",
      "+131s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:06:40.000Z",
      "53x [sleep 5000 | cancelled false | added - | nudge 0]",
      "sleep 4000",
      "cancelled false",
      "added -",
      "nudge 0",
      "cancelled false",
      "+400s context #2 -",
      "+400s send reply #2 @fakeFinch",
      "+400s log SENT #2 @fakeFinch https://x.com/xActs/status/772",
      "+400s save items[1:sent,2:sent] events[1r@131:done@131,2r@400:done@400] #be4ccc8d27",
      "added -",
      "+400s save items[1:sent,2:sent] events[1r@131:done@131,2r@400:done@400] #be4ccc8d27",
      "+400s log [finished] random run done: 2 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 2,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:02:11.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:06:40.000Z",
        "sentId": "772",
        "sentUrl": "https://x.com/xActs/status/772",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"772\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:02:11.000Z",
        "done": "2026-11-14T10:02:11.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:06:40.000Z",
        "done": "2026-11-14T10:06:40.000Z"
      }
    ]
  },
  "dropsTooOften": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log [retrying] reply #1 @fakeBird: the connection dropped with no answer from x (RequestsError: curl: (56) Recv failure: Connection was reset), a network error, not x refusing. planned again at 2026-11-14T10:02:11.000Z (drop 1 of 3)",
      "+10s save items[1:pending,2:pending] events[1r@131,2r@40] #ff1d928b35",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "6x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+40s context #2 -",
      "+40s send reply #2 @fakeFinch",
      "+40s log [retrying] reply #2 @fakeFinch: the connection dropped with no answer from x (RequestsError: curl: (56) Recv failure: Connection was reset), a network error, not x refusing. planned again at 2026-11-14T10:02:44.000Z (drop 2 of 3)",
      "+40s save items[1:pending,2:pending] events[1r@131,2r@164] #c55696785e",
      "+40s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:02:11.000Z",
      "18x [sleep 5000 | cancelled false | added - | nudge 0]",
      "sleep 1000",
      "cancelled false",
      "added -",
      "nudge 0",
      "cancelled false",
      "+131s context #1 -",
      "+131s send reply #1 @fakeBird",
      "+131s log [retrying] reply #1 @fakeBird: the connection dropped with no answer from x (RequestsError: curl: (56) Recv failure: Connection was reset), a network error, not x refusing. planned again at 2026-11-14T10:04:24.000Z (drop 3 of 3)",
      "+131s save items[1:pending,2:pending] events[1r@264,2r@164] #c72a960d8f",
      "+131s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:02:44.000Z",
      "6x [sleep 5000 | cancelled false | added - | nudge 0]",
      "sleep 3000",
      "cancelled false",
      "added -",
      "nudge 0",
      "cancelled false",
      "+164s context #2 -",
      "+164s send reply #2 @fakeFinch",
      "+164s save items[1:pending,2:pending] events[1r@264,2r@164] #890be07120",
      "+164s alert! [halted] reply #2 @fakeFinch: the connection to x dropped 4 times in a row with no answer from x, the last at 2026-11-14 10:02:44 UTC: RequestsError: curl: (56) Recv failure: Connection was reset. #2 stays pending (0 sent in total)"
    ],
    "result": {
      "state": "halted",
      "reason": "reply #2 @fakeFinch: the connection to x dropped 4 times in a row with no answer from x, the last at 2026-11-14 10:02:44 UTC: RequestsError: curl: (56) Recv failure: Connection was reset. #2 stays pending",
      "sent": 0,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:02:11.000Z",
        "result": "RequestsError: curl: (56) Recv failure: Connection was reset"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:02:44.000Z",
        "result": "RequestsError: curl: (56) Recv failure: Connection was reset"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:04:24.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:02:44.000Z"
      }
    ]
  },
  "goneAndTooBig": {
    "timeline": [
      "added -",
      "+0s log random run: 4 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log GONE reply #1 @fakeBird: post deleted, hidden or replies off, skipping it",
      "+10s save items[1:gone,2:pending,3:pending] events[1r@10:gone,1l@25:gone,2r@40,3r@60] #c3bb6c6370",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:40.000Z",
      "6x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+40s context #2 -",
      "+40s send reply #2 @fakeFinch",
      "+40s log TOO BIG reply #2 @fakeFinch: @fakeFinch has 9000 followers, over 1500, skipping it",
      "+40s save items[1:gone,2:skipped,3:pending] events[1r@10:gone,1l@25:gone,2r@40:tooBig,3r@60] #00dcbf82e0",
      "+40s log [waiting] next reply #3 @fakeWren at 2026-11-14T10:01:00.000Z",
      "4x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+60s context #3 -",
      "+60s send reply #3 @fakeWren",
      "+60s log SENT #3 @fakeWren https://x.com/xActs/status/773",
      "+60s save items[1:gone,2:skipped,3:sent] events[1r@10:gone,1l@25:gone,2r@40:tooBig,3r@60:done@60] #7751d0d16c",
      "added -",
      "+60s save items[1:gone,2:skipped,3:sent] events[1r@10:gone,1l@25:gone,2r@40:tooBig,3r@60:done@60] #7751d0d16c",
      "+60s log [finished] random run done: 1 replies sent, 2 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 1,
      "skipped": 2
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "gone",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "result": "TweetGone: (385) deleted"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "skipped",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:40.000Z",
        "result": "authorTooBig: @fakeFinch has 9000 followers, over 1500"
      },
      {
        "n": 3,
        "action": "reply",
        "handle": "fakeWren",
        "text": "nice one fakeWren",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeWren/status/190000000000000002",
        "postText": "",
        "attemptedAt": "2026-11-14T10:01:00.000Z",
        "sentId": "773",
        "sentUrl": "https://x.com/xActs/status/773",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"773\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "skipped": "gone"
      },
      {
        "n": 1,
        "kind": "like",
        "at": "2026-11-14T10:00:25.000Z",
        "skipped": "gone"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:40.000Z",
        "skipped": "tooBig"
      },
      {
        "n": 3,
        "kind": "reply",
        "at": "2026-11-14T10:01:00.000Z",
        "done": "2026-11-14T10:01:00.000Z"
      }
    ]
  },
  "likeNotSent": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next like #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s send like #1 @fakeBird",
      "+10s log LIKED #1 @fakeBird",
      "+10s save items[1:pending] events[1l@10:done@10,1r@30] #4a7b93d882",
      "+10s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:30.000Z",
      "4x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+30s context #1 -",
      "+30s send reply #1 @fakeBird",
      "+30s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+30s save items[1:sent] events[1l@10:done@10,1r@30:done@30] #90d49f808c",
      "added -",
      "+30s save items[1:sent] events[1l@10:done@10,1r@30:done@30] #90d49f808c",
      "+30s log [finished] random run done: 1 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 1,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "likedAt": "2026-11-14T10:00:10.000Z",
        "attemptedAt": "2026-11-14T10:00:30.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "like",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:30.000Z",
        "done": "2026-11-14T10:00:30.000Z"
      }
    ]
  },
  "fellBehind": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s save items[1:pending,2:pending] events[1r@-700,2r@30] #5c4989a8d3",
      "+0s alert! [halted] fell behind: reply #1 was due at 2026-11-14T09:48:20.000Z, plan it again before running (0 sent in total)"
    ],
    "result": {
      "state": "halted",
      "reason": "fell behind: reply #1 was due at 2026-11-14T09:48:20.000Z, plan it again before running",
      "sent": 0,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": ""
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": ""
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T09:48:20.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:30.000Z"
      }
    ]
  },
  "notReady": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "+10s save items[1:sent,2:held] events[1r@10:done@10,2r@30] #d94f4589b8",
      "+10s log [waiting] next reply #2 @fakeFinch at 2026-11-14T10:00:30.000Z",
      "4x [sleep 5000 | cancelled false | added - | nudge 0]",
      "+30s save items[1:sent,2:held] events[1r@10:done@10,2r@30] #d94f4589b8",
      "+30s alert! [halted] #2 is held, not ready for its reply: plan it again (1 sent in total)"
    ],
    "result": {
      "state": "halted",
      "reason": "#2 is held, not ready for its reply: plan it again",
      "sent": 1,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      },
      {
        "n": 2,
        "action": "reply",
        "handle": "fakeFinch",
        "text": "nice one fakeFinch",
        "status": "held",
        "tweetUrl": "https://x.com/fakeFinch/status/190000000000000001",
        "postText": ""
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 2,
        "kind": "reply",
        "at": "2026-11-14T10:00:30.000Z"
      }
    ]
  },
  "itemMissing": {
    "timeline": [
      "added -",
      "+0s log random run: 2 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "+0s log [waiting] next reply #1 @fakeBird at 2026-11-14T10:00:10.000Z",
      "2x [sleep 5000 | cancelled false | added - | nudge 0]",
      "cancelled false",
      "+10s context #1 -",
      "+10s send reply #1 @fakeBird",
      "+10s log SENT #1 @fakeBird https://x.com/xActs/status/771",
      "2x [+10s save items[1:sent] events[1r@10:done@10,9r@30] #51a347be26]",
      "+10s alert! [halted] #9 is in the plan but not in the queue: plan it again (1 sent in total)"
    ],
    "result": {
      "state": "halted",
      "reason": "#9 is in the plan but not in the queue: plan it again",
      "sent": 1,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "attemptedAt": "2026-11-14T10:00:10.000Z",
        "sentId": "771",
        "sentUrl": "https://x.com/xActs/status/771",
        "sentAtRun": "2026-11-14T10:00:00.000Z",
        "result": "{\"event\":\"sent\",\"tweetId\":\"771\"}"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:10.000Z"
      },
      {
        "n": 9,
        "kind": "reply",
        "at": "2026-11-14T10:00:30.000Z"
      }
    ]
  },
  "notApproved": {
    "timeline": [],
    "result": {
      "threw": "the queue changed after it was approved: review it again and approve it again"
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "changed after approval",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": ""
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z"
      }
    ]
  },
  "noPlan": {
    "timeline": [],
    "result": {
      "threw": "no random plan: run queue plan first"
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "pending",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": ""
      }
    ],
    "events": []
  },
  "emptyPlan": {
    "timeline": [
      "added -",
      "+0s log random run: 0 events from @xActs, approved by fakeOwner, window 1h, stops on any refusal from x",
      "nudge 0",
      "added -",
      "+0s save items[1:sent] events[1r@10:done@5] #af867d4963",
      "+0s log [finished] random run done: 1 replies sent, 0 skipped"
    ],
    "result": {
      "state": "finished",
      "reason": null,
      "sent": 1,
      "skipped": 0
    },
    "items": [
      {
        "n": 1,
        "action": "reply",
        "handle": "fakeBird",
        "text": "nice one fakeBird",
        "status": "sent",
        "tweetUrl": "https://x.com/fakeBird/status/190000000000000000",
        "postText": "",
        "sentAtRun": "2026-11-14T10:00:00.000Z"
      }
    ],
    "events": [
      {
        "n": 1,
        "kind": "reply",
        "at": "2026-11-14T10:00:10.000Z",
        "done": "2026-11-14T10:00:05.000Z"
      }
    ]
  }
}
