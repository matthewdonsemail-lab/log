import { Avatar, Bars, Card, Grid, LineChart, Page, Row, Stack, Stat, Table, fmt } from "log";

function Block({ block }) {
  switch (block.type) {
    case "heading":
      return <h2 className="sb-section">{block.text}</h2>;
    case "text":
      return <p className="sb-prose">{block.text}</p>;
    case "stat":
      return (
        <Grid min={150}>
          {block.items.map((s, i) => (
            <Stat key={i} label={s.label} value={typeof s.value === "number" ? fmt(s.value) : s.value} hint={[s.delta, s.hint].filter(Boolean).join(" · ") || undefined} tone={s.delta && /^[-−]/.test(s.delta) ? "bad" : undefined} />
          ))}
        </Grid>
      );
    case "barChart":
      return (
        <Card title={block.title}>
          <Bars data={block.data} unit={block.unit} />
        </Card>
      );
    case "lineChart":
      return (
        <Card title={block.title}>
          <LineChart series={block.series} labels={block.x} />
        </Card>
      );
    case "table":
      return (
        <Card title={block.title} pad={false}>
          <Table rows={block.rows} limit={20} columns={block.columns.map((c) => ({ key: c.key, title: c.label, align: c.align ?? (c.format === "number" ? "right" : undefined), render: (row) => (typeof row[c.key] === "number" ? fmt(row[c.key]) : row[c.key] ?? "–") }))} />
        </Card>
      );
    case "personList":
      return (
        <Card title={block.title}>
          <Stack gap={10}>
            {block.people.map((p, i) => (
              <Row key={i} gap={10}>
                <Avatar name={p.name} size={28} />
                <Stack gap={0} style={{ flex: 1 }}>
                  <strong>{p.name}</strong>
                  {(p.handle || p.note) && <span className="sb-stat-hint">{[p.handle && `@${p.handle.replace(/^@/, "")}`, p.note].filter(Boolean).join(" · ")}</span>}
                </Stack>
                {p.count !== undefined && <span>{fmt(p.count)}{block.unit ? ` ${block.unit}` : ""}</span>}
              </Row>
            ))}
          </Stack>
        </Card>
      );
    case "callout":
      return (
        <Card title={block.title}>
          <p className="sb-prose">{block.text}</p>
        </Card>
      );
    default:
      return null;
  }
}

export default function App({ data, title, subtitle }) {
  return (
    <Page title={title} subtitle={subtitle}>
      {data.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </Page>
  );
}
