import json

import pytest

from linkedinApi.messaging import Messaging, conversation_of, matches, voyager_track
from linkedinApi.reactions import Reactions, activity_of, committed
from linkedinApi.share import ShareRefused

ME = "urn:li:fsd_profile:ACoAAme"


def person(urn: str, first: str, last: str) -> dict:
    return {"hostIdentityUrn": urn, "participantType": {"member": {"firstName": {"text": first}, "lastName": {"text": last}, "profileUrl": "https://www.linkedin.com/in/janedoe", "headline": {"text": "builder"}}}}


def element(urn: str, first: str, last: str, text: str) -> dict:
    return {
        "entityUrn": f"urn:li:msg_conversation:({ME},{first})",
        "conversationParticipants": [person(ME, "Me", "Self"), person(urn, first, last)],
        "unreadCount": 1,
        "lastActivityAt": 1794496323820,
        "messages": {"elements": [{"deliveredAt": 1794496323820, "sender": person(urn, first, last), "body": {"text": text}, "entityUrn": "urn:li:msg_message:1"}]},
    }


class Headers(dict):
    def get_list(self, key):
        return []


class Answer:
    def __init__(self, text: str, status: int = 200) -> None:
        self.text, self.status_code, self.headers = text, status, Headers({"x-li-application-version": "0.2.8533.1"})


class Session:
    def __init__(self, conversations: list, thread: list) -> None:
        self.urls: list[str] = []
        self.conversations, self.thread = conversations, thread
        self.liked = ""

    def get(self, url, headers, **kwargs):
        self.urls.append(url)
        if url.endswith("/voyager/api/me"):
            return Answer(json.dumps({"miniProfile": {"dashEntityUrn": ME}}))
        if "messengerConversations" in url:
            return Answer(json.dumps({"data": {"messengerConversationsByCategoryQuery": {"elements": self.conversations}}}))
        if "messengerMessages" in url:
            return Answer(json.dumps({"data": {"messengerMessagesBySyncToken": {"elements": self.thread}}}))
        return Answer("<html></html>")

    def post(self, url, headers, data, **kwargs):
        body = json.loads(data)
        self.liked = body["requestedArguments"]["payload"]["threadUrn"]["threadUrnActivityThreadUrn"]["activityUrn"]["activityId"]
        return Answer('0:{"response":{"errors":[],"completionAction":{"actions":[{"$type":"proto.sdui.actions.core.CommitStates","value":{"keys":[{"key":{"value":{"$case":"id","id":"reactionState-urn:li:activity:' + self.liked + '"}}}]}}]}}}')


def messaging(session: Session) -> Messaging:
    return Messaging(session, {"JSESSIONID": '"ajax:1"'}, {"userAgent": "UA"}, sleep=lambda s: None, now=lambda: 1794500000.0)


def test_a_conversation_names_the_other_people_and_its_last_message():
    found = conversation_of(element("urn:li:fsd_profile:ACoAAjane", "Jane", "Doe", "hi there"), ME)
    assert [p["name"] for p in found["people"]] == ["Jane Doe"]
    assert found["last"]["text"] == "hi there" and found["last"]["fromMe"] is False
    assert found["lastActivityAt"] == "2026-11-12T15:12:03Z" and found["unreadCount"] == 1
    assert matches(found, "jane  doe") and matches(found, "ACoAAjane") and matches(found, "janedoe") and not matches(found, "john")


def test_the_inbox_reads_the_mailbox_from_me_then_the_conversations():
    session = Session([element("urn:li:fsd_profile:ACoAAjane", "Jane", "Doe", "hi")], [])
    out = messaging(session).inbox()
    assert len(out["conversations"]) == 1
    assert session.urls[1].endswith("/voyager/api/me")
    assert "mailboxUrn:urn%3Ali%3Afsd_profile%3AACoAAme" in session.urls[2] and "lastUpdatedBefore:1794500000000" in session.urls[2]


def test_messages_pick_the_conversation_by_name_and_refuse_nobody():
    thread = [{"deliveredAt": 2, "sender": person(ME, "Me", "Self"), "body": {"text": "second"}}, {"deliveredAt": 1, "sender": person("urn:li:fsd_profile:ACoAAjane", "Jane", "Doe"), "body": {"text": "first"}}]
    session = Session([element("urn:li:fsd_profile:ACoAAjane", "Jane", "Doe", "hi")], thread)
    out = messaging(session).messages("", "Jane Doe")
    assert [m["text"] for m in out["messages"]] == ["first", "second"] and out["messages"][1]["fromMe"] is True
    with pytest.raises(ShareRefused) as refused:
        messaging(Session([], [])).messages("", "nobody")
    assert refused.value.code == "conversationNotFound"


def test_the_voyager_track_keeps_a_saved_voyager_one():
    saved = json.dumps({"mpName": "voyager-web", "clientVersion": "1.13.1"})
    assert voyager_track({"xLiTrack": saved}) == saved
    assert json.loads(voyager_track({}))["mpName"] == "voyager-web"


def test_a_like_counts_only_when_the_reaction_is_committed():
    session = Session([], [])
    out = Reactions(session, {"JSESSIONID": '"ajax:1"'}, {"userAgent": "UA"}, sleep=lambda s: None).like("7526404006819139585")
    assert session.liked == "7526404006819139585" and out["reaction"] == "LIKE"
    assert not committed('"proto.sdui.actions.core.RollbackStates"', "1")
    assert activity_of("https://www.linkedin.com/feed/update/urn:li:activity:7526404006819139585/") == "7526404006819139585"
    assert activity_of("nope") == ""


def test_a_voice_message_is_kept_and_marked_as_audio():
    from linkedinApi.messaging import message_of

    found = message_of({"deliveredAt": 1, "sender": person(ME, "Me", "Self"), "body": {"text": ""}, "renderContent": [{"audio": {"url": "https://x/a", "duration": 3}}, {"file": {"name": "deck.pdf", "mediaType": "application/pdf", "url": "https://x/f", "byteSize": 9}}]}, ME)
    assert [a["name"] for a in found["attachments"]] == ["voice message", "deck.pdf"]
    assert found["text"] == "(audio: voice message)"
