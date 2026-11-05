from twikit.user import User


def test_names_come_from_core_when_legacy_has_none():
    user = User(None, {'rest_id': '2305857931', 'core': {'name': 'Dragon', 'screen_name': 'dragonconnector'}, 'legacy': {}})
    assert user.screen_name == 'dragonconnector'
    assert user.name == 'Dragon'


def test_legacy_names_still_win():
    user = User(None, {'rest_id': '1', 'core': {'name': 'New', 'screen_name': 'new'}, 'legacy': {'name': 'Old', 'screen_name': 'old'}})
    assert user.screen_name == 'old'
