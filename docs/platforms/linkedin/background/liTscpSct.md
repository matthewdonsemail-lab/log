# liTscpSct

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/li/tscp/sct` |
| Sends | `ti`, `p`, `c`, `z`, `pk`, `pz`, `lix`, `li_theme`, `sz`, `_x`, `vmid` |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:1>/script31.js:12277 statement`, `runs/chrome/20261114T213510_<name:1>/script19.js:2 statement`, `runs/chrome/20261114T213510_<name:1>/script37.js:2 statement`, `runs/chrome/20261114T213510_<name:1>/script38.js:2 statement` |
| rea | `ev_5284e7a729b11853971000cd79fc52c8ea1bab23fbda18c24997ed111053df2a` |

Seen 32 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 64 ms | 203691 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 62 ms | 6685 ms | — |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 1 | 200 | 55 ms | 25599 ms | — |
| chrome | step 2: send a message, by hand | 1 | 200 | 56 ms | 9358 ms | — |
| chrome | step 3: react to a post, by hand | 6 | 200 | 57–98 ms | 315–9240 ms | — |
| chrome | step 5: comment on a post, by hand | 5 | 200 | 58–63 ms | 5586–7346 ms | — |
| chrome | step 7: connect with a member, by hand | 5 | 200 | 61–72 ms | 7785–11476 ms | — |
| chrome | step 8: comment on a post, by hand | 11 | 200 | 52–69 ms | 2242–8317 ms | — |
| chrome | step 9: open My Network's invitations, by hand | 1 | 200 | 350 ms | 1149 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 64 ms

Sent:

```json
{
  "[{\"eventBody\":{\"sponsoredEventHeader\":{\"encryptedTrackingData\":\"CwEAAAGhtsvbsZZ8TwwuMbStNB8Dr4hytESXwSLw2cPPaTuMt-_i6Yz_BBwoijwA91enTSQTY7yqmLdS9cntqkEJy0McidOuO0i4Y5NJM5lkQW1B4CvtLHUdsPQHIjar6TERfuhAhW4wpGgGReSaFZd47UC0GEdGV7iowaIIcYC1GozFzAijRLiaDJVib7vc4z_5dff99ueBpg9Id22Z-6_bmDa3PE1My79HZr8a58WYY9dZzlu0_jd7TS4t6M2yiZPFj9UvzuPBMiwM6dl29i_CZ5yEqGTBG17TbM3Gb5PZOcqjSoR38unQslrJCjqA3rJ0_XHvCEIZ3ENe2R_BjBZQHWgKzK8VoLAPx_bo_IxBCM8ybF3UKOA1pWVjRLaJ6rC47TpkE0vEFVy2b3rhciCBHYZxM5YWudyjrF00t49HmT0oL1xxtLMwZ3j7g8Mx4wDS8NzvLX-6qWNPPCc-RIqTbpgdjzbPExb-AzqUw-hSk_Gek1c6Z16GUJLklPT3W0t5BkbokL8j4ASqz4DFg1MlyByxvjcr2fLR7gSfc016Tr5sTgIyZU4dMbAp6cs6gxTN-vygfZJzrSjepF2Kbb8iNPG2GXmuAaAnW98YSQDze5kTC1BKzNJ6jrwDwTVIo9hQKYOne3byr7D9SDAPy_OkFYbOfix6X2Xv1hYgD-yHxxXIQnhlT3iY7rs4gdPqUQKrsT47ZRJ062qOgbrXUBbO714cOIEUXgqujSgPo0gQBKySATu6mBsccmOuHrQNIFgCqvBkLHGkMOyNqQrU8xSJ0o6Kq_EmPASjcRzgbLw9oS66hKoI14v4ZHCIya8y2dgttDeChWjaH5gPm_Mk01FOpYb0grZaaQitxYhwKw-TPlpooA_ZyMn7HDIsSaHXZdZ37AqXk3gSgha4r8_60KBGu8PGT549j6hZWUQf819wffckhs3uCVuiLkm4sdUbe6st4RN03_oOxln8rfE13pozgbskdFeL5ZUnk7LwEQ5yC-y9SniH98ROguHjqtkUeYD_jQ-RU2STO3pXhgTwFU8HqI_rX3XDvpRk8T0rWcG1LglcGb5uFr1mLeFMsJKm98BLIm3ydfwkZAi7FA0pl9GX7qrVlfzHhFNkKbZPhn1qAYa5HxeyHLgA0Dye_Q9LgUnCrRjOBU8D5-REiCLpdWdehv0m5AzmcFrAAJ4uoXfMzy_92RGavFKwJqJYa-GBByTWs1Cunoi06KX5SX7OCUuhgWax9OEOqkhMFloH_q6ke-s\"},\"header\":{\"pageInstance\":{\"pageUrn\":\"urn:li:page:d_flagship3_feed\",\"trackingId\":\"K6ezRNshQxOC3ZeksgmvJA": "=\"},\"time\":1794068192993,\"version\":\"0.0.0\",\"server\":\"\",\"service\":\"\",\"guid\":\"c5iMbTn4TbyHjRDx8FaspQ==\",\"memberId\":"<userId:1>",\"isShadowEvent\":false},\"requestHeader\":{\"interfaceLocale\":\"en-US\",\"pageKey\":\"d_flagship3_feed\",\"referer\":\"https://www.linkedin.com/feed/\",\"path\":\"/tscp-serving/dtag?z=home",
  "c": "1",
  "li_theme": "light",
  "pk": "d_flagship3_feed",
  "pz": "BR",
  "p": "1",
  "sz": "300x250",
  "ti": "1\",\"isFlushOnCloseBrowserTabEnabled\":true,\"isBrowserPersistentRetryEnabled\":false,\"clientDeviceType\":\"DESKTOP\",\"timeZoneOffsetMinutes\":-420}},\"eventInfo\":{\"appId\":\"com.linkedin.ads.rendering.d_web\",\"eventName\":\"SponsoredRightRailContentImpressionEvent\",\"topicName\":\"SponsoredRightRailContentImpressionEvent\"}}]"
}
```

Answered:

```json
null
```

**runs/inspect/20261107T161246_<name:1>**, step 5: goto /feed/: 200, 62 ms

Sent:

```json
{
  "[{\"eventBody\":{\"sponsoredEventHeader\":{\"encryptedTrackingData\":\"CwEAAAGhts0RcOlNVPyU1dKOxrzKUTGevZAW91RERVmXpL0sRtPVcGaioTYwg1_pkQL2ZvAtrmmbIPCKJ6wlJLpT21WdpJdB0s4BJCcwkjiVuNTdra6hbZlShYujdKylO9h-O10j5ykSbvibuoPNlvTxBxtMXon5CfKmU1ZrEu98YQPMzutPt_pSA3W-EEtCjgHRoPhUdc1gkqjDglZZjlT2D9G1DPpF_bHVWmom4mvG4ENZhb78sDLVwIIEv5qVVCyggv4QiWuqFltr9jaxHS6flg0zcQjhb8qyyALhVhuxDxq94RpKQhUexsWDYTzWXI7eC8cNlzL7EtlXWvujucpk6BdW4beescJ6xvrr70blWosQZqfyNWlKuR0ZwUp_i_S6nd_6713boKMyxlxNsNUOtpmGZfnglZdqFFqjXDAyh8eK4M3SizuA5RBZGCXHBBqpz0GaDAl6iv0d7J5mJsoHMCxYwXVaL7EQlehDu6ldddISN1R3TMQUoJYEGdHz3_lkdA1axT2aoEiXdfOkmprZZvTFHe0J5BEQpkC8-R2g4xhUTjFANix2GfeD6-UFvCN7w2-wVeHrwJmy1LAnhCPS5K34L-1kTMgTAkCP58zwnXmemPlISb3epcdr2pG7SspF20oUq87W0W81-qxN-SPtc4l77x3QqXuvnZsapJPONXHoFWtmcIv4INNq7ncH2FuFIZUNIZZPFzXMZYVKIrAGrHfmWmH-pCaktOjXzFCX41PMANTGToBakAt2DzrHLSThn9E3vAC7ffAHHT1nHGFMk6nZh05tZ2z9_6DZxTQJgJvqtCidQp0Di-rSiJ_f0pAcMqtuqowryoVyXEvjPV51SG4tXbUpV3FiK0aPV2u7azHAajabmZmEM1IiQBqZRQ8hFdekxWp8aQIruH0HMr4B7SFua4njWlBR4hago8gtSqskwZ3DHLu9eHs5RXPhj--XZ-rK77DTd8B3Kw32vL5EH-XAI8Ku7-_xObxLDuF3mq1LmmvKg9XO7nAvXgF8JDSoax_egEb69MH7UsMUhiOk5x0cXzO94SNEGBpcfDBnzhHouMId9n4rY4hx5ygm8I-SlbbIU_qLdeLEOshgEPaU5pAhmJGDHgnuJSbseF3Gc4x0zEGGqxhVE8rkMmMcAmBlU8hcz5aPT4B2qOwHAhOOyii3WeTeduG0O43hymF5Uz3sMuWAe_YCXRlu2grX2ANgs0DkdIYcp6ESzcoG-hwiqI-IKxaIgm1OM_GoRAIfcSiVBw\"},\"header\":{\"pageInstance\":{\"pageUrn\":\"urn:li:page:d_flagship3_profile_view_base\",\"trackingId\":\"EeQR 11PSBi602XNL5zkjA": "=\"},\"time\":1794068272171,\"version\":\"0.0.0\",\"server\":\"\",\"service\":\"\",\"guid\":\"aFQ3g5gVThGuY3eo7SKDOA==\",\"memberId\":"<userId:1>",\"isShadowEvent\":false},\"requestHeader\":{\"interfaceLocale\":\"en-US\",\"pageKey\":\"d_flagship3_profile_view_base\",\"referer\":\"https://www.linkedin.com/in/<profile>/\",\"path\":\"/tscp-serving/dtag?z=profile",
  "c": "1",
  "li_theme": "light",
  "pk": "d_flagship3_profile_view_base",
  "pz": "BR",
  "p": "1",
  "sz": "300x250",
  "ti": "1",
  "_x": "company=2289109",
  "vmid": "<memberId>\",\"isFlushOnCloseBrowserTabEnabled\":true,\"isBrowserPersistentRetryEnabled\":false,\"clientDeviceType\":\"DESKTOP\",\"timeZoneOffsetMinutes\":-420}},\"eventInfo\":{\"appId\":\"com.linkedin.ads.rendering.d_web\",\"eventName\":\"SponsoredRightRailContentImpressionEvent\",\"topicName\":\"SponsoredRightRailContentImpressionEvent\"}}]"
}
```

Answered:

```json
null
```

**runs/chrome/20261114T213510_<name:1>**, step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open: 200, 55 ms

Sent:

```json
{
  "[{\"eventBody\":{\"sponsoredEventHeader\":{\"encryptedTrackingData\":\"CwEAAAGh2_xK_7i1dUfDHkMWqKYiMcDio0CH7Rm9Cn0fdH6fwDG9sJ_TzBntxghO3tlGC1U5wsorcAejTxz4MfH8ZVWavowAHIfDbe_QnMY0Eebmno4BE8NyNmA19fmSbbNExJWHDZCDE452IE_V6GjjoK2kfQB5gdSQX6uB5X4mLB2zjKtJiWyjgzDJMneyFdPrjVmwTLNYJzmN-g4Y9WCaXQkzb1TOI7iY0InK5UWPUTOQ-ALu8u_eR4T9sBbjBXpDWcoKBzc85UCulAmEhAjkZQNaq38SWfXkpMXvaWTnwCWn5QZ9xfSLYEf3rfARhislUPmo0ZceD0O-VNUL9AQargWVC0Cl6cyHiDxostiusLLFD4cxQ0K_oJbFFvcKB1LNeCuobWKVdpkLPuqPjyhhTeiGg72r4vgJY2a8mZKj0h0hEYUJ4YvPS1tPIWS6g_BG9p8W1ei63YlYmlrB2BtN138weaWvdudDYbi4-3QVSIqBZWeun8_5tYN6KDSCCBftWqn18Ew91xGGj6I0H291U7uNrZrFkKm5ZHsW5K-SFmCf3FNF-YtZ_-sfiaVVYGdD7igHXBPhYxlDYYBepeGNTsPtn7yhM-tYPavoJBN54R0eNy7AmzjFxXlPdkESIJWQ3W76G6rBz8Egyb0Sh3Tw5skhrDY03JxCUfWxQ6uTOC2wHq51rDea-ztASyrOrLFRaeXk8LlQbL51__5sZ_Q1RihPGyTrpTN9G-XD9oR1RPFsh2AYvVXz4e4_k7YmoC6mLMssD3te_NbqY_1EAEoN_nF-MjpRH9kGzPcW7jMkDpTLRXywEUfIzuaVF6gqYz7IKDGY_nPKNsh8PxVz9q2da3JZacQk8KOpFujPzby0x7aNr2XgmWFzMVXrkAAbzyshSgPwrKwN4u4Glv1FBDwYlQFEfEnYvr3LRWs-hZwxgT09lKORRqSYA7sgzFtpUw7yNGUlaomyAYllF4B4-ugM7CNFsJ84a21LLlfO1iCl3fb8EPjsostbsSnzI2NYZiAJEjPEPKtMsAT6y61qPrRHRKt8_S2-USCZUZBuJVQ75BlIpN98pvTTtXbrJ4vhRZuhMrPGByxW_u--n06_bUYs6mHvCE1506PZYtGhDYykC-BpYkG5L4TnC3pmYCcFpYFZXKUIjRu2xF2xOJSirVgV88O2Xy7lKjtdGRSbm5cEbcbUa6d657dZraip5swALXFHduEbZ3HcheAs_B_hhdUEZa-l8mbc4xilzRNRn3i8aIHGig\"},\"header\":{\"pageInstance\":{\"pageUrn\":\"urn:li:page:d_flagship3_messaging_conversation_detail\",\"trackingId\":\"35ujkO1nQ7edRjR9rcyfCA": "=\"},\"time\":1794692135841,\"version\":\"0.0.0\",\"server\":\"\",\"service\":\"\",\"guid\":\"BftjU1paR3uaakijjzNlAA==\",\"memberId\":"<userId:1>",\"isShadowEvent\":false},\"requestHeader\":{\"interfaceLocale\":\"en-US\",\"pageKey\":\"d_flagship3_messaging_conversation_detail\",\"referer\":\"https://www.linkedin.com/preload/?_bprMode=vanilla\",\"path\":\"/tscp-serving/dtag?sz=300x250",
  "ti": "1",
  "p": "1",
  "c": "1",
  "z": "inbox",
  "pk": "d_flagship3_messaging_conversation_detail",
  "pz": "BR",
  "lix": "voyager.web.right-rail-ad-viewability-tracking:control\",\"isFlushOnCloseBrowserTabEnabled\":true,\"isBrowserPersistentRetryEnabled\":false,\"clientDeviceType\":\"DESKTOP\",\"timeZoneOffsetMinutes\":-480}},\"eventInfo\":{\"appId\":\"com.linkedin.ads.rendering.d_web\",\"eventName\":\"SponsoredRightRailContentImpressionEvent\",\"topicName\":\"SponsoredRightRailContentImpressionEvent\"}}]"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Sponsored-content tracking: the web client posts a batch of events under the ads rendering app, each with encrypted tracking data, here impressions of the right rail's sponsored content (`SponsoredRightRailContentImpressionEvent`). It fired while a snapshot was taken and while the feed loaded.

## What our machine does with it

log's LinkedIn direct-API engine never sends it: nothing in `python/linkedinApi` or `vendor/openLinkedinApi` names this path, so no run waits on it, reads it or replays it. It is telemetry the browser sends on its own.

## What can go wrong

Both recorded calls answered 200 with no body in about 60 ms. A failure would only lose LinkedIn an impression count; it can't affect our runs.
