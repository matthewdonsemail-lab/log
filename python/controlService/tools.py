READ_TOOLS = frozenset({
    "accountsList",
    "twitterSessionCheck",
    "discordSessionCheck",
    "linkedinSessionCheck",
    "redditSessionCheck",
    "twitterDms",
    "twitterFollowers",
    "discordChats",
    "discordRead",
    "search",
    "errors",
    "whoami",
})

WRITE_TOOLS = frozenset({
    "twitterDmLive",
    "twitterReplyLive",
    "twitterPostLive",
    "twitterQuoteLive",
    "twitterLikeLive",
    "twitterFollowLive",
    "twitterRepostLive",
    "discordSendLive",
})


def tool_kind(tool: str) -> str | None:
    if tool in READ_TOOLS:
        return "read"
    if tool in WRITE_TOOLS:
        return "write"
    return None
