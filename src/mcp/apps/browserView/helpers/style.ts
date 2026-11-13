export const brandTokens = `
:root{--lk-blue:#2A8CFF;--lk-blue-deep:#1F78F0;--lk-blue-light:#4FA6FF;--lk-navy:#0D2A4C;--lk-shadow:#1A5FC8;--lk-bg:#ffffff;--lk-panel:#f8fafc;--lk-line:#e2e8f0;--lk-text:#0f172a;--lk-muted:#64748b;--lk-ok:#047857;--lk-ok-bg:#ecfdf5;--lk-stop:#b91c1c;--lk-stop-bg:#fef2f2;color-scheme:light}
:root[data-theme="dark"]{--lk-bg:#0b1726;--lk-panel:#0f1f33;--lk-line:#1e3350;--lk-text:#e2e8f0;--lk-muted:#94a3b8;--lk-ok:#6ee7b7;--lk-ok-bg:#06281f;--lk-stop:#fca5a5;--lk-stop-bg:#2a0f12;color-scheme:dark}
`;

export const widgetStyle = `${brandTokens}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:transparent}
body{font-family:"Satoshi",Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--lk-text);-webkit-font-smoothing:antialiased}
.app{display:flex;flex-direction:column;border:1px solid var(--lk-line);border-radius:16px;overflow:hidden;background:var(--lk-bg)}
.app[data-mode="fullscreen"]{border:0;border-radius:0;height:100vh}
.bar{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--lk-panel);border-bottom:1px solid var(--lk-line)}
.mark{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9px;background:radial-gradient(at 50% 0%,var(--lk-blue-light) 0%,var(--lk-blue) 55%,var(--lk-blue-deep) 100%);color:#fff;flex:none}
.mark svg{width:15px;height:15px}
.who{display:flex;flex-direction:column;min-width:0;flex:1}
.who strong{font-size:14px;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.who span{font-size:12px;color:var(--lk-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 9px;font-size:12px;font-weight:700;background:var(--lk-line);color:var(--lk-muted);white-space:nowrap}
.pill i{width:6px;height:6px;border-radius:50%;background:currentColor}
.pill[data-tone="live"]{background:var(--lk-ok-bg);color:var(--lk-ok)}
.pill[data-tone="live"] i{animation:pulse 1.6s ease-in-out infinite}
.pill[data-tone="stop"]{background:var(--lk-stop-bg);color:var(--lk-stop)}
.icon{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:0;border-radius:9px;background:transparent;color:var(--lk-muted);cursor:pointer;flex:none}
.icon:hover{background:var(--lk-line);color:var(--lk-text)}
.icon[hidden]{display:none}
.icon svg{width:15px;height:15px}
.address{display:flex;align-items:center;gap:8px;margin:0 14px 10px;padding:0 12px;height:32px;border:1px solid var(--lk-line);border-radius:9px;font-size:13px;color:var(--lk-muted);background:var(--lk-bg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.head{background:var(--lk-panel);border-bottom:1px solid var(--lk-line)}
.head .bar{border-bottom:0}
.stage{position:relative;display:flex;align-items:center;justify-content:center;min-height:300px;background:var(--lk-panel);flex:1;overflow:hidden}
.app[data-mode="fullscreen"] .stage{min-height:0}
canvas{display:block;max-width:100%;height:auto;outline:none;visibility:hidden}
canvas[data-live="true"]{visibility:visible}
canvas[data-input="true"]{cursor:pointer}
.stage:focus-within canvas[data-input="true"]{box-shadow:0 0 0 3px var(--lk-blue-light)}
.app[data-mode="fullscreen"] canvas{max-height:100%;width:auto;max-width:100%}
.cover{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;text-align:center;color:#fff;background:radial-gradient(at 50% 0%,var(--lk-blue-light) 0%,var(--lk-blue) 55%,var(--lk-blue-deep) 100%)}
.cover[hidden]{display:none}
.cover h2{margin:0;font-size:20px;font-weight:700;letter-spacing:-.01em}
.cover p{margin:0;max-width:420px;font-size:14px;line-height:1.5;color:rgba(255,255,255,.88)}
.spin{width:26px;height:26px;border-radius:50%;border:3px solid rgba(255,255,255,.35);border-top-color:#fff;animation:spin .9s linear infinite}
.spin[hidden]{display:none}
.keys{position:absolute;left:0;bottom:0;width:1px;height:1px;opacity:0;border:0;padding:0;font-size:16px;resize:none;pointer-events:none}
.take{position:absolute;left:50%;top:16px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;border:1px solid #bfdbfe;border-radius:999px;background:rgba(255,255,255,.96);padding:9px 16px;font:inherit;font-size:13px;font-weight:700;color:var(--lk-navy);box-shadow:0 4px 14px rgba(13,42,76,.18);cursor:pointer}
.take[hidden]{display:none}
.note{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);max-width:calc(100% - 24px);border-radius:999px;background:rgba(13,42,76,.88);padding:6px 12px;font-size:12px;font-weight:700;color:#fff;text-align:center}
.note[hidden]{display:none}
.foot{display:flex;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid var(--lk-line);background:var(--lk-bg)}
.foot p{margin:0;flex:1;font-size:13px;line-height:1.4;color:var(--lk-muted)}
.done{height:34px;border:0;border-radius:9px;padding:0 14px;font:inherit;font-size:13px;font-weight:700;color:#fff;background:var(--lk-blue);box-shadow:0 3px 0 var(--lk-shadow);cursor:pointer;white-space:nowrap}
.done:active{transform:translateY(1px);box-shadow:0 2px 0 var(--lk-shadow)}
.done:disabled{opacity:.5;cursor:default}
.toast{position:absolute;right:12px;top:12px;max-width:min(360px,calc(100% - 24px));border-radius:12px;background:var(--lk-navy);color:#fff;padding:10px 12px;font-size:13px;line-height:1.4;box-shadow:0 8px 24px rgba(13,42,76,.3)}
.toast[hidden]{display:none}
.toast strong{display:block;font-weight:700}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){.spin,.pill[data-tone="live"] i{animation:none}}
`;
