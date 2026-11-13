import { Avatar, Bars, Card, Empty, Grid, LineChart, Page, Row, Sparkline, Stack, Stat, Table, Time, fmt } from "log";

const DAY = 86400000;

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
  const senders = report.senders;
  const days = report.byDay.slice(-30);
  const lastDay = days.length ? Date.parse(`${days[days.length - 1].day}T00:00:00Z`) : Date.now();
  const top10 = senders.slice(0, 10).reduce((sum, s) => sum + s.count, 0);
  const fresh = senders.filter((s) => s.firstAt && Date.parse(s.firstAt) > lastDay - 7 * DAY).length;
  const busiest = days.reduce((best, d) => (!best || d.count > best.count ? d : best), null);
  const quiet = days.filter((d) => d.count === 0).length;
  const day = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <Page title={title} subtitle={subtitle}>
      <Grid min={150}>
        <Stat label="Messages" value={fmt(report.messages)} hint={`from ${fmt(report.people)} people`} />
        <Stat label="Top 10 share" value={`${Math.round((top10 / Math.max(1, report.messages)) * 100)}%`} hint="of all messages" />
        <Stat label="New this week" value={fmt(fresh)} hint="first message in the last 7 days" />
        <Stat label="Busiest day" value={busiest ? fmt(busiest.count) : "–"} hint={busiest ? day(busiest.day) : ""} />
      </Grid>

      <Card title="Messages per day" actions={<span className="sb-stat-hint">{quiet} quiet days of {days.length}</span>}>
        <LineChart series={[{ name: "Messages", values: days.map((d) => d.count) }]} labels={days.map((d) => day(d.day))} height={160} />
      </Card>

      <Card title="Who messages most">
        <Bars data={senders.slice(0, 10).map((s) => ({ label: s.name, value: s.count }))} unit="msgs" />
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
                <Row gap={10}>
                  <Avatar name={s.name} size={28} />
                  <Stack gap={0}>
                    <strong>{s.name}</strong>
                    <span className="sb-stat-hint">@{s.handle}</span>
                  </Stack>
                </Row>
              ),
            },
            { key: "count", title: "Messages", align: "right", render: (s) => fmt(s.count) },
            { key: "activity", title: "Last 30 days", width: 110, render: (s) => <Sparkline values={s.activity} width={100} height={22} /> },
            { key: "lastAt", title: "Last", width: 64, render: (s) => <span style={{ whiteSpace: "nowrap" }}><Time value={s.lastAt} /></span> },
            { key: "lastMessage", title: "Latest message", render: (s) => <span className="sb-stat-hint">{(s.lastMessage || "").slice(0, 80)}</span> },
          ]}
        />
      </Card>
    </Page>
  );
}
