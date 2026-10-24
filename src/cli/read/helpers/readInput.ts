import type { CommandInput } from "../../runner/types.ts";
import { JSON_FLAG } from "../../runner/helpers/index.ts";

export const READ_INPUT: CommandInput = {
  forms: [
    {
      words: ["group"],
      summary: "Read a Facebook group's new posts and the comments of the new posts, in the account's open browser; only the group's cursor is saved to Twenty",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The account whose open browser reads" },
        { name: "group", kind: "string", required: true, description: "The group's URL, id or name in its URL" },
        { name: "scrolls", kind: "integer", description: "Feed scrolls at most (default 6)" },
        { name: "commentPosts", kind: "integer", description: "Posts whose comments are read at most (default 5; 0 reads none)" },
        { name: "live", kind: "boolean", live: true, description: "Switch each post's comments to Newest (two clicks), only when matt asked (rule 8)" },
        { name: "show", kind: "boolean", description: "Only print the group's cursor from Twenty" },
        { name: "bypass", kind: "boolean", bypass: true, description: "Outside the account's waking hours, only when matt asked (rule 20)" },
        JSON_FLAG,
      ],
    },
    {
      words: ["members"],
      summary: "Read a Facebook group's newest members (name, profile, bio, page category, followers, when they joined) from its People tab in the account's open browser, nothing clicked; saved to a TSV and JSON file",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The account whose open browser reads" },
        { name: "group", kind: "string", required: true, description: "The group's URL, id or name in its URL" },
        { name: "count", kind: "integer", required: true, description: "How many members to read (1-5000)" },
        { name: "secondsPerScroll", kind: "integer", description: "Seconds to wait before each scroll (default 15)" },
        { name: "maxScrolls", kind: "integer", description: "Scrolls at most (default twice the plan's, plus 2)" },
        { name: "owners", kind: "boolean", description: "Keep only owners: a bio naming owner, co-owner, founder, CEO, president, proprietor or self-employed, or a page (a category set)" },
        { name: "bypass", kind: "boolean", bypass: true, description: "Outside the account's waking hours, only when matt asked (rule 20)" },
        JSON_FLAG,
      ],
    },
  ],
};
