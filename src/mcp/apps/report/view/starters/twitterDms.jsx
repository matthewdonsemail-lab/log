import { AskButton, Avatar, BackLink, Bars, Button, Card, Empty, FollowUps, FullscreenButton, Grid, LineChart, Link, Page, Quote, Routes, Row, Sparkline, Stack, Stat, Table, Time, downloadCsv, fmt } from "log";

const DAY = 86400000;
const dayName = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function Actions({ senders }) {
  return (
    <Row gap={6}>
      <Button size="sm" variant="ghost" onClick={() => downloadCsv("people", senders.map((s) => ({ name: s.name, handle: `@${s.handle}`, messages: s.count, first: s.firstAt, last: s.lastAt, latest: s.lastMessage || "" })))}>
        Export CSV
      </Button>
      <FullscreenButton />
    </Row>
  );
}

function Overview({ report, title, subtitle }) {
  const senders = report.senders;
  const days = report.byDay.slice(-30);
  const lastDay = days.length ? Date.parse(`${days[days.length - 1].day}T00:00:00Z`) : Date.now();
  const top10 = senders.slice(0, 10).reduce((sum, s) => sum + s.count, 0);
  const fresh = senders.filter((s) => s.firstAt && Date.parse(s.firstAt) > lastDay - 7 * DAY);
  const busiest = days.reduce((best, d) => (!best || d.count > best.count ? d : best), null);
  const quiet = days.filter((d) => d.count === 0).length;

  return (
    <Page title={title} subtitle={subtitle} actions={<Actions senders={senders} />}>
      <Grid min={150}>
        <Stat label="Messages" value={fmt(report.messages)} hint={`from ${fmt(report.people)} people`} />
        <Stat label="Top 10 share" value={`${Math.round((top10 / Math.max(1, report.messages)) * 100)}%`} hint="of all messages" />
        <Stat label="New this week" value={fmt(fresh.length)} hint="first message in the last 7 days" />
        <Stat label="Busiest day" value={busiest ? fmt(busiest.count) : "–"} hint={busiest ? dayName(busiest.day) : ""} />
      </Grid>

      <Card title="Messages per day" actions={<span className="sb-stat-hint">{quiet} quiet days of {days.length}</span>}>
        <LineChart series={[{ name: "Messages", values: days.map((d) => d.count) }]} labels={days.map((d) => dayName(d.day))} height={160} />
      </Card>

      <Card title="Who messages most">
        <Bars data={senders.slice(0, 10).map((s) => ({ label: <Link to={`/person/${s.handle}`}>{s.name}</Link>, value: s.count }))} unit="msgs" />
      </Card>

      <Card title="People" pad={false}>
        <Table
          limit={10}
          rows={senders}
          columns={[
            {
              key: "name",
              title: "Person",
              render: (s) => (
                <Link to={`/person/${s.handle}`}>
                  <Row gap={10}>
                    <Avatar name={s.name} size={28} />
                    <Stack gap={0}>
                      <strong>{s.name}</strong>
                      <span className="sb-stat-hint">@{s.handle}</span>
                    </Stack>
                  </Row>
                </Link>
              ),
            },
            { key: "count", title: "Messages", align: "right", render: (s) => fmt(s.count) },
            { key: "activity", title: "Last 30 days", width: 110, render: (s) => <Sparkline values={s.activity} width={100} height={22} /> },
            { key: "lastAt", title: "Last", width: 64, render: (s) => <span style={{ whiteSpace: "nowrap" }}><Time value={s.lastAt} /></span> },
            { key: "lastMessage", title: "Latest message", render: (s) => <span className="sb-stat-hint">{(s.lastMessage || "").slice(0, 80)}</span> },
          ]}
        />
      </Card>

      <FollowUps
        prompts={[
          "Which of these people are still waiting on a reply from me?",
          fresh.length ? `Tell me about the ${fresh.length} people who messaged me for the first time this week` : "Who has gone quiet after messaging me a lot?",
          "Draft replies to my top 3 senders, but don't send them",
        ]}
      />
    </Page>
  );
}

function Person({ report, handle }) {
  const p = report.senders.find((s) => s.handle === handle);
  if (!p) return <Page><BackLink /><Empty title="Not in this report" /></Page>;
  const rank = report.senders.indexOf(p) + 1;
  const days = report.byDay.slice(-p.activity.length);
  const active = p.activity.filter((n) => n > 0).length;
  return (
    <Page title={p.name} subtitle={`@${p.handle} on X · #${rank} of ${fmt(report.people)}`} actions={<BackLink>All people</BackLink>}>
      <Grid min={150}>
        <Stat label="Messages" value={fmt(p.count)} hint={`${Math.round((p.count / Math.max(1, report.messages)) * 100)}% of all your DMs`} />
        <Stat label="Days active" value={fmt(active)} hint={`of the last ${p.activity.length}`} />
        <Stat label="First message" value={p.firstAt ? new Date(p.firstAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "–"} />
        <Stat label="Last message" value={<Time value={p.lastAt} />} />
      </Grid>
      <Card title="Their messages per day">
        <LineChart series={[{ name: p.name, values: p.activity }]} labels={days.map((d) => dayName(d.day))} height={140} />
      </Card>
      {p.lastMessage && (
        <Card title="Latest message">
          <Quote>{p.lastMessage}</Quote>
        </Card>
      )}
      <Card title="Ask the agent">
        <Row gap={8} wrap>
          <AskButton prompt={`Read my whole X DM chat with @${p.handle} and tell me what they want from me`}>What do they want?</AskButton>
          <AskButton prompt={`Draft a reply to @${p.handle} on X from our chat, but don't send it`}>Draft a reply</AskButton>
          <AskButton prompt={`Summarise everything @${p.handle} and I have talked about on X`}>Summarise the chat</AskButton>
        </Row>
      </Card>
    </Page>
  );
}

export default function App({ data, title, subtitle }) {
  const report = Object.values(data)[0];
  if (!report || !report.people) {
    return (
      <Page title={title} subtitle={subtitle}>
        <Card>
          <Empty title="No DMs in log.db yet">Read the inbox with twitterDms, then ask again.</Empty>
        </Card>
      </Page>
    );
  }
  return (
    <Routes
      routes={{
        "/": () => <Overview report={report} title={title} subtitle={subtitle} />,
        "/person/:handle": ({ handle }) => <Person report={report} handle={handle} />,
      }}
    />
  );
}
