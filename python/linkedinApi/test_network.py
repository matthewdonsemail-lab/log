import json

from linkedinApi.network import CONNECT_REQUEST, GROW_SCREEN, cards_of, connect_body, public_id_of, toast_of


def card_page(member: str, slug: str) -> str:
    request = {
        "requestId": CONNECT_REQUEST,
        "requestedArguments": {"$type": "proto.sdui.actions.requests.RequestedArguments", "requestedStateKeys": [], "payload": {"inviteeUrn": {"memberId": member}, "firstName": "Jane", "lastName": "Doe", "origin": "InvitationOrigin_PYMK_COHORT_SECTION", "profileCanonicalUrl": f"https://www.linkedin.com/in/{slug}"}, "requestMetadata": {"$type": "proto.sdui.common.RequestMetadata"}},
        "isApfcEnabled": False,
        "isStreaming": False,
        "rumPageKey": "",
        "maxRetries": 0,
        "backOffMultiplier": 0,
        "maxSeconds": 0,
    }
    return 'x:{"$type":"proto.sdui.actions.core.ServerRequest","value":' + json.dumps(request, separators=(",", ":")) + "}"


def test_cards_are_read_from_the_connect_buttons_requests():
    page = card_page("1", "JaneDoe1") + card_page("1", "JaneDoe1") + card_page("2", "j%C3%A92")
    cards = cards_of(page)
    assert [c["publicId"] for c in cards] == ["janedoe1", "jé2"]
    assert cards[0]["name"] == "Jane Doe" and cards[0]["memberId"] == "1"


def test_connect_body_is_the_buttons_request_without_retry_fields():
    request = cards_of(card_page("1", "jane"))[0]["request"]
    body = connect_body(request)
    assert body["requestId"] == CONNECT_REQUEST and body["states"] == []
    assert "maxRetries" not in body["serverRequest"] and body["serverRequest"]["rumPageKey"] == ""
    assert list(body["requestedArguments"])[-3:] == ["states", "screenId", "knownTemplateIds"]
    assert body["requestedArguments"]["screenId"] == GROW_SCREEN


def test_an_error_toast_is_read_and_a_pending_answer_is_not():
    assert toast_of('"presetToast":{"category":"ToastPresetCategory_ERROR","text":["Sorry, invitation not sent"]') == "Sorry, invitation not sent"
    assert toast_of('"stringValue":"Pending"') == ""
    assert public_id_of("https://www.linkedin.com/in/SomeOne/") == "someone"
