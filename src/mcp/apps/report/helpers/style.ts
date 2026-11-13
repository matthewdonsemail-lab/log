import { brandTokens } from "../../browserView/helpers/style.ts";

export const reportStyle = `${brandTokens}
:root{--lk-series-0:#2A8CFF;--lk-series-1:#0D2A4C;--lk-series-2:#7CC0FF;--lk-series-3:#F59E0B;--lk-grid:#e2e8f0;--lk-up:#047857;--lk-down:#b91c1c;--lk-tile:#ffffff}
:root[data-theme="dark"]{--lk-series-0:#4FA6FF;--lk-series-1:#E2E8F0;--lk-series-2:#93C5FD;--lk-series-3:#FBBF24;--lk-grid:#1e3350;--lk-up:#6ee7b7;--lk-down:#fca5a5;--lk-tile:#0b1726}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:transparent}
body{font-family:"Satoshi",Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--lk-text);-webkit-font-smoothing:antialiased;font-size:14px}
.app{position:relative;display:flex;flex-direction:column;border:1px solid var(--lk-line);border-radius:16px;overflow:hidden;background:var(--lk-bg)}
.app[data-mode="fullscreen"]{border:0;border-radius:0;min-height:100vh}
.head{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--lk-panel);border-bottom:1px solid var(--lk-line)}
.mark{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;background:radial-gradient(at 50% 0%,var(--lk-blue-light) 0%,var(--lk-blue) 55%,var(--lk-blue-deep) 100%);color:#fff;flex:none;box-shadow:0 3px 0 var(--lk-shadow)}
.mark svg{width:16px;height:16px}
.titles{display:flex;flex-direction:column;min-width:0;flex:1}
.titles h1{margin:0;font-size:17px;font-weight:700;letter-spacing:-.01em;line-height:1.25}
.titles span{font-size:12.5px;color:var(--lk-muted);line-height:1.4}
.titles span[hidden]{display:none}
.icon{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:0;border-radius:9px;background:transparent;color:var(--lk-muted);cursor:pointer;flex:none}
.icon:hover{background:var(--lk-line);color:var(--lk-text)}
.icon[hidden]{display:none}
.icon svg{width:15px;height:15px}
.body{display:flex;flex-direction:column;gap:14px;padding:16px}
.app[data-mode="fullscreen"] .body{max-width:1080px;width:100%;margin:0 auto;padding:24px}
.section{margin:6px 0 -4px;font-size:15px;font-weight:700;letter-spacing:-.01em}
.sub{margin:2px 0 -6px;font-size:13px;font-weight:700;color:var(--lk-muted);text-transform:none}
.prose{margin:0;font-size:14px;line-height:1.55;white-space:pre-line}
.muted{color:var(--lk-muted)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.stat{display:flex;flex-direction:column;gap:4px;min-width:0;padding:12px 14px;border:1px solid var(--lk-line);border-radius:14px;background:var(--lk-tile)}
.stat.lead{border-color:transparent;color:#fff;background:radial-gradient(at 50% 0%,var(--lk-blue-light) 0%,var(--lk-blue) 55%,var(--lk-blue-deep) 100%);box-shadow:0 3px 0 var(--lk-shadow)}
.statLabel{font-size:12px;font-weight:700;color:var(--lk-muted)}
.stat.lead .statLabel,.stat.lead .statHint{color:rgba(255,255,255,.85)}
.statValue{font-size:26px;font-weight:700;letter-spacing:-.02em;line-height:1.15;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.statValue.word{font-size:19px;line-height:1.5}
.statValue small,.barValue small,.personCount small{margin-left:4px;font-size:.55em;font-weight:500;opacity:.75}
.statDelta{align-self:flex-start;border-radius:999px;padding:2px 8px;font-size:11.5px;font-weight:700;background:var(--lk-ok-bg);color:var(--lk-up)}
.statDelta[data-tone="down"]{background:var(--lk-stop-bg);color:var(--lk-down)}
.stat.lead .statDelta{background:rgba(255,255,255,.2);color:#fff}
.statHint{font-size:12px;color:var(--lk-muted)}
.card{padding:14px 16px;border:1px solid var(--lk-line);border-radius:14px;background:var(--lk-tile)}
.cardTitle{margin:0 0 12px;font-size:13.5px;font-weight:700}
.bars{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px}
.barRow{display:grid;grid-template-columns:minmax(80px,30%) 1fr auto;align-items:center;gap:10px}
.barLabel{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.barTrack{height:14px;border-radius:999px;background:var(--lk-panel);overflow:hidden}
.barFill{display:block;height:100%;min-width:3px;border-radius:999px;background:linear-gradient(90deg,var(--lk-blue-deep),var(--lk-blue-light))}
.barValue{min-width:36px;text-align:right;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums}
.chart{display:block;width:100%;height:auto;overflow:visible}
.grid{stroke:var(--lk-grid);stroke-width:1}
.axis{fill:var(--lk-muted);font-size:12px;font-family:inherit}
.vbar{fill:var(--lk-blue)}
.vbar:hover{fill:var(--lk-blue-deep)}
.line{fill:none;stroke:var(--lk-series-0);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}
.line[data-series="1"]{stroke:var(--lk-series-1)}
.line[data-series="2"]{stroke:var(--lk-series-2)}
.line[data-series="3"]{stroke:var(--lk-series-3)}
.area{fill:var(--lk-blue);opacity:.12}
.legend{list-style:none;display:flex;flex-wrap:wrap;gap:12px;margin:-4px 0 8px;padding:0;font-size:12px;color:var(--lk-muted)}
.legend li{display:flex;align-items:center;gap:6px}
.legend i{width:10px;height:10px;border-radius:3px;background:var(--lk-series-0)}
.legend i[data-series="1"]{background:var(--lk-series-1)}
.legend i[data-series="2"]{background:var(--lk-series-2)}
.legend i[data-series="3"]{background:var(--lk-series-3)}
.tableWrap{overflow-x:auto;margin:0 -4px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{padding:8px 10px;text-align:left;font-size:12px;font-weight:700;color:var(--lk-muted);border-bottom:1px solid var(--lk-line);white-space:nowrap}
td{padding:8px 10px;border-bottom:1px solid var(--lk-line);vertical-align:top}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover td{background:var(--lk-panel)}
.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.empty{color:var(--lk-muted)}
.people{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.person{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--lk-line)}
.person:last-child{border-bottom:0}
.rank{width:20px;text-align:right;font-size:12px;font-weight:700;color:var(--lk-muted);font-variant-numeric:tabular-nums}
.avatar{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;flex:none;font-size:12px;font-weight:700;color:#fff;background:linear-gradient(135deg,hsl(var(--hue) 90% 62%),hsl(var(--hue) 85% 42%))}
.personText{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.personText strong{font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.personText>span:not(.personMeter){font-size:12px;color:var(--lk-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.personMeter{display:block;height:4px;margin-top:3px;border-radius:999px;background:var(--lk-panel);overflow:hidden}
.personMeter span{display:block;height:100%;border-radius:999px;background:var(--lk-blue)}
.personCount{font-size:15px;font-weight:700;font-variant-numeric:tabular-nums}
.callout{display:flex;gap:10px;padding:12px 14px;border-radius:14px;background:#eff6ff;color:var(--lk-navy);border:1px solid #bfdbfe}
:root[data-theme="dark"] .callout{background:#0d2a4c;color:#dbeafe;border-color:#1e3a5f}
.callout[data-tone="success"]{background:var(--lk-ok-bg);color:var(--lk-ok);border-color:transparent}
.callout[data-tone="warning"]{background:#fffbeb;color:#92400e;border-color:#fde68a}
:root[data-theme="dark"] .callout[data-tone="warning"]{background:#2a1f06;color:#fcd34d;border-color:#4a3510}
.calloutIcon{flex:none;width:18px;height:18px;margin-top:1px}
.calloutIcon svg{width:18px;height:18px}
.callout strong{display:block;font-size:13.5px;font-weight:700;margin-bottom:2px}
.callout p{margin:0;font-size:13.5px;line-height:1.5;white-space:pre-line}
.waiting{position:relative;display:flex;flex-direction:column;gap:12px}
.spin{position:absolute;right:4px;top:-6px;width:20px;height:20px;border-radius:50%;border:3px solid var(--lk-line);border-top-color:var(--lk-blue);animation:spin .9s linear infinite}
.skeleton{border-radius:14px;background:linear-gradient(90deg,var(--lk-panel) 0%,var(--lk-line) 50%,var(--lk-panel) 100%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite}
.skeleton.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;background:none;animation:none}
.skeleton.tiles i{height:74px;border-radius:14px;background:linear-gradient(90deg,var(--lk-panel) 0%,var(--lk-line) 50%,var(--lk-panel) 100%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite}
.skeleton.card{height:180px;border:0}
.skeleton.short{height:96px}
.toast{position:absolute;right:12px;top:12px;max-width:min(360px,calc(100% - 24px));border-radius:12px;background:var(--lk-navy);color:#fff;padding:10px 12px;font-size:13px;line-height:1.4;box-shadow:0 8px 24px rgba(13,42,76,.3)}
.toast[hidden]{display:none}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@media (max-width:480px){.barRow{grid-template-columns:minmax(64px,34%) 1fr auto}.statValue{font-size:22px}.body{padding:12px}}
@media (prefers-reduced-motion:reduce){.spin,.skeleton,.skeleton.tiles i{animation:none}}
`;
