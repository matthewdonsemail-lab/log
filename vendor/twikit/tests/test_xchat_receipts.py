from twikit.xchat import unopened_of


def test_a_read_receipt_that_cannot_be_verified_is_a_marker_not_a_message():
    out = unopened_of(None, "Crypto error: Signature verification failed: ReadReceipt signature could not be verified")
    assert out["kind"] == "MarkRead"
    assert out["text"] is None
    assert "error" not in out


def test_any_other_failure_keeps_its_error():
    out = unopened_of(None, "no matching key for version 3")
    assert out["error"].startswith("no matching key")
    assert out["text"] is None
