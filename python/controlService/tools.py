READ_TOOLS = frozenset({
    "accountsList",
    "toolManifest",
    "twitterSessionCheck",
    "discordSessionCheck",
    "linkedinSessionCheck",
    "linkedinSuggestions",
    "linkedinInbox",
    "linkedinMessages",
    "redditSessionCheck",
    "instagramSessionCheck",
    "slackSessionCheck",
    "sessionsCheck",
    "sessionsSignIn",
    "twitterDms",
    "twitterFollowers",
    "discordChats",
    "discordRead",
    "search",
    "errors",
    "whoami",
    "browserView",
    "getGuide",
    "logSearch",
    "logGet",
    "logCall",
    "report",
    "reportData",
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
    "linkedinPostLive",
    "linkedinDeleteLive",
    "linkedinConnectLive",
    "linkedinLikeLive",
    "linkedinRepostLive",
    "linkedinMessageLive",
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
    "signInLinkOpen": "browserAdmin",
}


def tool_kind(tool: str) -> str | None:
    if tool in READ_TOOLS or tool in APP_TOOLS:
        return "read"
    if tool in WRITE_TOOLS:
        return "write"
    return None
