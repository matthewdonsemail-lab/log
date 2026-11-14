import { AskButton, Avatar, Badge, Card, FollowUps, Grid, Page, Row, Stack, Stat, Table, Time, fmt } from "log";

const LABELS = { pictureUrl: "Picture", location: "Location", followingCount: "Following", postCount: "Posts", canDm: "Takes DMs", protected: "Protected", joinedAt: "Joined", premium: "Premium", headline: "Headline" };

const shown = (value) => (typeof value === "boolean" ? (value ? "yes" : "no") : typeof value === "number" ? fmt(value) : String(value));

export default function App({ data, title, subtitle }) {
  const p = Object.values(data)[0];
  const extra = Object.entries(p.extra || {}).map(([key, value]) => ({ field: LABELS[key] || key, value: shown(value) }));
  return (
    <Page title={title} subtitle={subtitle}>
      <Card>
        <Row gap={14}>
          <Avatar name={p.name} src={p.avatar} size={56} />
          <Stack gap={2} style={{ flex: 1 }}>
            <strong>{p.name}</strong>
            <span className="sb-stat-hint">{p.handle ? `@${p.handle} · ` : ""}{p.platform}</span>
          </Stack>
          {p.verified ? <Badge tone="accent">verified</Badge> : null}
        </Row>
        {p.bio ? <p>{p.bio}</p> : null}
      </Card>
      <Grid min={150}>
        {p.followerCount !== null ? <Stat label="Followers" value={fmt(p.followerCount)} /> : null}
        <Stat label="Profile kept" value={<Time value={p.fetchedAt} />} hint="read from log.db" />
        {p.lastSeenAt ? <Stat label="Last seen" value={<Time value={p.lastSeenAt} />} /> : null}
      </Grid>
      {extra.length ? (
        <Card title="More" pad={false}>
          <Table rows={extra} columns={[{ key: "field", title: "Field" }, { key: "value", title: "Value" }]} />
        </Card>
      ) : null}
      <FollowUps prompts={[`What have I talked about with ${p.name}?`, `Draft a reply to ${p.name}`]} />
      <AskButton prompt={`Tell me more about ${p.name}`}>Ask about them</AskButton>
    </Page>
  );
}
