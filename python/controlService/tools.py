READ_TOOLS = frozenset({
    "accountsList",
    "toolManifest",
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
    "browserView",
    "uiResourcesList",
    "uiResourceRead",
})

APP_TOOLS = frozenset({
    "browserViewStream",
    "browserViewFrame",
    "browserViewInput",
    "browserViewDone",
})

UI_EXTENSION_ID = "io.modelcontextprotocol/ui"
MCP_APP_MIME_TYPE = "text/html;profile=mcp-app"

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


CONSOLE_TOOLS = {
    "browserState": "readTools",
    "browserFrame": "readTools",
    "browserOpen": "browserAdmin",
    "browserInput": "browserAdmin",
    "browserAction": "browserAdmin",
    "browserSaveState": "browserAdmin",
    "browserClose": "browserAdmin",
    "connectionsList": "readTools",
    "usage": "readTools",
    "events": "readTools",
    "accountCheck": "readTools",
    "credentialsRead": "providerAdmin",
    "credentialsSave": "providerAdmin",
    "accountSignIn": "browserAdmin",
}


def tool_kind(tool: str) -> str | None:
    if tool in READ_TOOLS or tool in APP_TOOLS:
        return "read"
    if tool in WRITE_TOOLS:
        return "write"
    return None
