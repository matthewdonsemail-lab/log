import json
from types import SimpleNamespace

import pytest

from linkedinApi import messaging, reactions
from linkedinApi.share import ShareRefused, fill, template


class Answer(SimpleNamespace):
    pass


class Headers(dict):
    def get_list(self, name):
        return []


def answered(text, status=200):
    return Answer(status_code=status, text=text, headers=Headers())


class FakeSession:
    def __init__(self, answers):
        self.answers = list(answers)
        self.sent = []

    def get(self, url, **kwargs):
        self.sent.append(("GET", url, None))
        return self.answers.pop(0)

    def post(self, url, data=None, **kwargs):
        self.sent.append(("POST", url, json.loads(data)))
        return self.answers.pop(0)


COOKIES = {"li_at": "x", "JSESSIONID": '"ajax:1"'}
BROWSER = {"userAgent": "Mozilla/5.0 Chrome/142.0.7444.59", "secChUa": '"Chromium";v="142"', "secChUaPlatform": '"Windows"'}
FEED = answered("<html>0.2.4321.1</html>")
REPOSTED = '1:{"$type":"proto.sdui.actions.core.CommitStates"}\n2:{"presetToast":{"category":"ToastPresetCategory_SUCCESS","text":["Reposted"]}}'


def test_the_repost_template_names_only_the_post():
    body = fill(template("instantRepost"), {"activityId": "7400000000000000001"})
    text = json.dumps(body)
    assert body["requestId"] == reactions.REPOST_REQUEST and text.count("7400000000000000001") == 4
    assert "{{" not in text


def test_a_repost_counts_only_when_linkedin_commits_it_with_its_success_toast():
    assert reactions.reposted(REPOSTED)
    assert not reactions.reposted('1:{"$type":"proto.sdui.actions.core.CommitStates"}')
    assert not reactions.reposted(REPOSTED + '"RollbackStates"')
    assert not reactions.reposted(REPOSTED + '"ToastPresetCategory_ERROR"')


def test_repost_sends_the_template_and_refuses_an_unconfirmed_answer():
    session = FakeSession([FEED, answered(REPOSTED)])
    out = reactions.Reactions(session, COOKIES, BROWSER, sleep=lambda s: None).repost("7400000000000000001")
    assert out["reposted"] and session.sent[1][1].endswith("sduiid=" + reactions.REPOST_REQUEST)
    session = FakeSession([FEED, answered('1:{"$type":"proto.sdui.actions.core.CommitStates"}')])
    with pytest.raises(ShareRefused) as refused:
        reactions.Reactions(session, COOKIES, BROWSER, sleep=lambda s: None).repost("7400000000000000001")
    assert refused.value.code == "repostUnconfirmed"


def test_a_message_body_is_the_web_clients_and_its_answer_must_name_the_text():
    body = messaging.message_body("urn:li:msg_conversation:(a,b)", "urn:li:fsd_profile:me", "hey")
    assert body["message"]["body"] == {"attributes": [], "text": "hey"} and body["mailboxUrn"] == "urn:li:fsd_profile:me"
    assert len(body["trackingId"]) == 16 and body["dedupeByClientGeneratedToken"] is False
    ok = {"value": {"entityUrn": "urn:li:msg_message:(x,y)", "body": {"text": "hey"}, "deliveredAt": 1794692179109}}
    assert messaging.sent_message(ok, "hey")["messageUrn"] == "urn:li:msg_message:(x,y)"
    assert messaging.sent_message(ok, "other") is None
    assert messaging.sent_message({"value": {"entityUrn": "urn:li:msg_conversation:z", "body": {"text": "hey"}}}, "hey") is None


def test_send_types_then_creates_the_message_in_the_one_conversation_with_them():
    me = answered(json.dumps({"miniProfile": {"dashEntityUrn": "urn:li:fsd_profile:ACoAAAtest"}}))
    conversation = {"entityUrn": "urn:li:msg_conversation:(urn:li:fsd_profile:ACoAAAtest,2-abc)", "conversationParticipants": [{"hostIdentityUrn": "urn:li:fsd_profile:ACoAAAother", "participantType": {"member": {"firstName": {"text": "Jane"}, "lastName": {"text": "Doe"}, "profileUrl": "https://www.linkedin.com/in/janedoe"}}}], "lastActivityAt": 1}
    listed = answered(json.dumps({"data": {"messengerConversationsBySyncToken": {"elements": [conversation]}}}))
    thread = answered(json.dumps({"data": {"messengerMessagesBySyncToken": {"elements": []}}}))
    created = answered(json.dumps({"value": {"entityUrn": "urn:li:msg_message:(c,1)", "body": {"text": "hey jane"}, "deliveredAt": 1794692179109}}))
    session = FakeSession([FEED, me, listed, thread, answered(""), created])
    out = messaging.Messaging(session, COOKIES, BROWSER, sleep=lambda s: None).send(["hey jane"], with_whom="Jane Doe")
    posts = [s for s in session.sent if s[0] == "POST"]
    assert [p[1].rsplit("?", 1)[-1] for p in posts] == ["action=typing", "action=createMessage"]
    assert posts[1][2]["message"]["conversationUrn"] == conversation["entityUrn"] and posts[1][2]["mailboxUrn"] == "urn:li:fsd_profile:ACoAAAtest"
    assert out["sent"][0]["messageUrn"] == "urn:li:msg_message:(c,1)"


def test_an_empty_or_overlong_message_is_refused_before_anything_is_sent():
    session = FakeSession([])
    for text in ("  ", "x" * (messaging.MESSAGE_MAX + 1)):
        with pytest.raises(ShareRefused) as refused:
            messaging.Messaging(session, COOKIES, BROWSER, sleep=lambda s: None).send([text], with_whom="Jane")
        assert refused.value.code == "messageInvalid"
    assert session.sent == []


def test_parts_go_out_one_by_one_and_a_failed_part_stops_the_rest():
    me = answered(json.dumps({"miniProfile": {"dashEntityUrn": "urn:li:fsd_profile:ACoAAAtest"}}))
    listed = answered(json.dumps({"data": {"messengerConversationsBySyncToken": {"elements": [{"entityUrn": "urn:li:msg_conversation:(a,2-x)", "conversationParticipants": [], "lastActivityAt": 1}]}}}))
    thread = answered(json.dumps({"data": {"messengerMessagesBySyncToken": {"elements": []}}}))
    first = answered(json.dumps({"value": {"entityUrn": "urn:li:msg_message:(c,1)", "body": {"text": "one"}}}))
    wrong = answered(json.dumps({"value": {}}))
    session = FakeSession([FEED, me, listed, thread, answered(""), first, answered(""), wrong])
    with pytest.raises(ShareRefused) as refused:
        messaging.Messaging(session, COOKIES, BROWSER, sleep=lambda s: None).send(["one", "two", "three"], conversation_urn="urn:li:msg_conversation:(a,2-x)")
    assert refused.value.code == "messageUnconfirmed" and len(refused.value.extra["sent"]) == 1
    assert sum(1 for s in session.sent if s[1].endswith("createMessage")) == 2
