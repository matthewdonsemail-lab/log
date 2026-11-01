from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .client.client import Client
    from .tweet import Tweet
    from .user import User


class Notification:
    """
    Attributes
    ----------
    id : :class:`str`
        The unique identifier of the notification.
    timestamp_ms : :class:`int`
        The timestamp of the notification in milliseconds.
    icon : :class:`dict`
        Dictionary containing icon data for the notification.
    message : :class:`str`
        The message text of the notification.
    tweet : :class:`.Tweet`
        The tweet associated with the notification.
    from_user : :class:`.User`
        The user who triggered the notification.
    """
    def __init__(
        self, client: Client, data: dict, tweet: Tweet, from_user: User
    ) -> None:
        self._client = client
        self.tweet = tweet
        self.from_user = from_user

        self.id: str = data['id']
        self.timestamp_ms: int = int(data['timestampMs'])
        self.icon: dict = data['icon']
        self.message: str = data['message']['text']

    def __eq__(self, __value: object) -> bool:
        return isinstance(__value, Notification) and self.id == __value.id

    def __ne__(self, __value: object) -> bool:
        return not self == __value

    def __repr__(self) -> str:
        return f'<Notification id="{self.id}">'


NOTIFICATION_KINDS = {
    'heart_icon': 'like',
    'retweet_icon': 'repost',
    'person_icon': 'follow',
}


def _user_brief(users: dict, user_id: str) -> dict:
    data = users.get(user_id) or {}
    return {
        'user_id': user_id,
        'screen_name': data.get('screen_name'),
        'name': data.get('name'),
        'followers_count': data.get('followers_count'),
        'following': data.get('following'),
        'followed_by': data.get('followed_by'),
    }


def _tweet_brief(tweets: dict, tweet_id: str | None) -> dict | None:
    if not tweet_id:
        return None
    data = tweets.get(tweet_id) or {}
    return {
        'id': tweet_id,
        'user_id': data.get('user_id_str'),
        'text': data.get('full_text') or data.get('text'),
        'created_at': data.get('created_at'),
        'in_reply_to_status_id': data.get('in_reply_to_status_id_str'),
        'in_reply_to_user_id': data.get('in_reply_to_user_id_str'),
        'quoted_status_id': data.get('quoted_status_id_str'),
    }


def parse_notifications_page(response: dict) -> dict:
    """
    Reads one page of ``notifications/all.json`` whole: every person behind
    an aggregated notification (twikit's ``Notification`` keeps only the
    first), the replies, quotes and mentions that come as tweet entries,
    and both cursors.
    """
    global_objects = response.get('globalObjects') or {}
    users = global_objects.get('users') or {}
    tweets = global_objects.get('tweets') or {}
    notes = global_objects.get('notifications') or {}
    entries = []
    for instruction in (response.get('timeline') or {}).get('instructions') or []:
        for key in ('addEntries', 'replaceEntry'):
            block = instruction.get(key) or {}
            entries.extend(block.get('entries') or ([block['entry']] if block.get('entry') else []))
    cursors = {}
    notifications = []
    tweet_entries = []
    for entry in entries:
        entry_id = str(entry.get('entryId') or '')
        content = entry.get('content') or {}
        if entry_id.startswith('cursor-'):
            cursor = (content.get('operation') or {}).get('cursor') or {}
            kind = str(cursor.get('cursorType') or entry_id.split('-')[1]).lower()
            if cursor.get('value'):
                cursors[kind] = cursor['value']
            continue
        item = ((content.get('item') or {}).get('content')) or {}
        if 'notification' in item:
            note = notes.get(str(item['notification'].get('id'))) or {}
            if not note:
                continue
            actions = (note.get('template') or {}).get('aggregateUserActionsV1') or {}
            targets = [t['tweet']['id'] for t in actions.get('targetObjects') or [] if 'tweet' in t]
            from_users = [u['user']['id'] for u in actions.get('fromUsers') or [] if 'user' in u]
            icon = str((note.get('icon') or {}).get('id') or '')
            notifications.append({
                'id': str(note.get('id')),
                'timestamp_ms': int(note.get('timestampMs') or 0),
                'icon': icon,
                'kind': NOTIFICATION_KINDS.get(icon, 'other'),
                'message': (note.get('message') or {}).get('text') or '',
                'users': [_user_brief(users, uid) for uid in from_users],
                'targets': [_tweet_brief(tweets, tid) for tid in targets],
                'sort_index': entry.get('sortIndex'),
            })
        elif 'tweet' in item:
            tweet = _tweet_brief(tweets, str(item['tweet'].get('id')))
            data = tweets.get(tweet['id']) or {}
            tweet_entries.append({
                'id': tweet['id'],
                'timestamp_ms': int(entry.get('sortIndex') or 0),
                'tweet': tweet,
                'user': _user_brief(users, str(data.get('user_id_str') or '')),
                'replied_to': _tweet_brief(tweets, tweet['in_reply_to_status_id']),
                'quoted': _tweet_brief(tweets, tweet['quoted_status_id']),
                'sort_index': entry.get('sortIndex'),
            })
    return {
        'notifications': notifications,
        'tweets': tweet_entries,
        'cursor_top': cursors.get('top'),
        'cursor_bottom': cursors.get('bottom'),
    }
