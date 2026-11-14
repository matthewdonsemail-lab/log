from __future__ import annotations

import re
import uuid
from typing import Any

from linkedinApi.share import ORIGIN, Composer, ShareRefused, fill, template

LIKE_REQUEST = "com.linkedin.sdui.reactions.create"
REPOST_REQUEST = "com.linkedin.sdui.feed.requests.createInstantRepost"
FEED_PAGE_KEY = "p_mwlite_feed"


def activity_of(ref: str) -> str:
    ref = ref.strip()
    if ref.isdigit():
        return ref
    found = re.search(r"urn:li:activity:(\d{10,})", ref) or re.search(r"activity[:%3A-]+(\d{10,})", ref)
    return found.group(1) if found else ""


def committed(answer: str, activity_id: str) -> bool:
    key = f"reactionState-urn:li:activity:{activity_id}"
    return '"proto.sdui.actions.core.CommitStates"' in answer and key in answer and "RollbackStates" not in answer


def reposted(answer: str) -> bool:
    return "proto.sdui.actions.core.CommitStates" in answer and "RollbackStates" not in answer and "ToastPresetCategory_SUCCESS" in answer and "ToastPresetCategory_ERROR" not in answer


class Reactions(Composer):
    def __init__(self, session: Any, cookies: dict[str, str], browser: dict[str, str], log: Any = None, sleep: Any = None) -> None:
        super().__init__(session, cookies, browser, log=log, sleep=sleep)
        self.page_key = FEED_PAGE_KEY
        self.referer = f"{ORIGIN}/feed/"

    def like(self, activity_id: str) -> dict[str, Any]:
        self.version_from_feed()
        self.pause(3.0, 8.0)
        answer = self.server_request(LIKE_REQUEST, fill(template("reactionCreate"), {"activityId": activity_id, "toastKey": str(uuid.uuid4())}))
        if not committed(answer, activity_id):
            raise ShareRefused("likeUnconfirmed", f"LinkedIn's answer to the like didn't commit the reaction on activity {activity_id}, so it isn't known to be liked. Nothing is retried (rule 94)")
        return {"activityId": activity_id, "reaction": "LIKE", "url": f"{ORIGIN}/feed/update/urn:li:activity:{activity_id}/"}

    def repost(self, activity_id: str) -> dict[str, Any]:
        self.version_from_feed()
        self.pause(3.0, 8.0)
        answer = self.server_request(REPOST_REQUEST, fill(template("instantRepost"), {"activityId": activity_id}))
        if not reposted(answer):
            raise ShareRefused("repostUnconfirmed", f"LinkedIn's answer to the repost didn't commit it with its success toast on activity {activity_id}, so it isn't known to be reposted. Nothing is retried (rule 94)")
        return {"activityId": activity_id, "reposted": True, "url": f"{ORIGIN}/feed/update/urn:li:activity:{activity_id}/"}
