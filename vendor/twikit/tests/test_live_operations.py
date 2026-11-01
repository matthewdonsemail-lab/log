from twikit.client import gql


def test_a_call_uses_x_live_query_id_and_exactly_its_feature_flags_with_their_values():
    gql.set_live_operations({
        'operations': {'CreateTweet': {'queryId': 'liveId123', 'type': 'mutation', 'features': ['a_flag', 'b_flag']}},
        'featureValues': {'a_flag': True},
    })
    try:
        url, features = gql.live_call(gql.Endpoint.CREATE_TWEET, {'old_flag': True, 'b_flag': True})
        assert url.endswith('/liveId123/CreateTweet')
        assert features == {'a_flag': True, 'b_flag': True}
    finally:
        gql.set_live_operations(None)


def test_without_live_operations_nothing_changes():
    gql.set_live_operations(None)
    url, features = gql.live_call(gql.Endpoint.CREATE_TWEET, {'x': True})
    assert url == gql.Endpoint.CREATE_TWEET
    assert features == {'x': True}
