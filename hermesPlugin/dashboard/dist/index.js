/* log dashboard tab. Plain JavaScript on the Hermes dashboard SDK: no build step, no bundled
   libraries. Read-only: it shows what log already has on this machine and never sends anything.
   All text is rendered as text, never as HTML. */
(function () {
  "use strict";
  var SDK = window.__HERMES_PLUGIN_SDK__;
  var React = SDK.React;
  var h = React.createElement;
  var useState = SDK.hooks.useState, useEffect = SDK.hooks.useEffect;
  var API = "/api/plugins/listeningkit-log";
  var HIDE_KEY = "lk-log-hide-text";

  function readHide() {
    try { return window.localStorage.getItem(HIDE_KEY) === "1"; } catch (e) { return false; }
  }
  function saveHide(on) {
    try { window.localStorage.setItem(HIDE_KEY, on ? "1" : "0"); } catch (e) { return; }
  }
  function ago(iso) {
    if (!iso) return "never";
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return Math.round(s / 60) + "m ago";
    if (s < 86400) return Math.round(s / 3600) + "h ago";
    return Math.round(s / 86400) + "d ago";
  }
  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }

  function Stat(props) {
    return h("div", { className: "lk-stat" + (props.accent ? " lk-stat-accent" : "") },
      h("div", { className: "lk-stat-label" }, props.label),
      h("div", { className: "lk-stat-value" }, props.value),
      h("div", { className: "lk-stat-hint" }, props.hint));
  }

  function Session(props) {
    var state = props.state;
    var tone = state === "loggedIn" ? "ok" : state === "loggedOut" || state === "restricted" ? "bad" : "unknown";
    var text = state === "loggedIn" ? "Signed in" : state === "loggedOut" ? "Signed out" : state === "restricted" ? "Restricted" : "Not checked";
    return h("span", { className: "lk-badge lk-" + tone }, text);
  }

  function Account(props) {
    var a = props.account;
    var pct = Math.min(100, Math.round((a.writesToday / Math.max(1, a.writesLimit)) * 100));
    return h("div", { className: "lk-card" },
      h("div", { className: "lk-card-head" },
        h("span", { className: "lk-platform lk-p-" + a.platform }, a.platformLabel),
        h(Session, { state: a.sessionState })),
      h("div", { className: "lk-account" }, a.platform === "twitter" ? "@" + a.account : a.account),
      h("div", { className: "lk-meter" }, h("div", { className: "lk-meter-fill", style: { width: pct + "%" } })),
      h("div", { className: "lk-card-foot" },
        h("span", null, a.writesToday + " / " + a.writesLimit + " sends today"),
        a.waiting ? h("span", { className: "lk-waiting-count" }, a.waiting + " waiting") : h("span", null, "checked " + ago(a.checkedAt))),
      a.coolingDownUntil ? h("div", { className: "lk-note" }, "Paused after a platform limit until " + new Date(a.coolingDownUntil).toLocaleTimeString()) : null);
  }

  function Waiting(props) {
    var c = useState(""), copied = c[0], setCopied = c[1];
    function ask(w) {
      var who = w.handle ? "@" + w.handle : w.with;
      var prompt = "Read my X thread with " + who + " on " + w.account + " and draft a reply the way I'd write it. Show me before sending.";
      try { navigator.clipboard.writeText(prompt); } catch (e) { return; }
      setCopied(w.conversationId);
      setTimeout(function () { setCopied(""); }, 1800);
    }
    if (!props.rows.length) {
      return h("div", { className: "lk-panel lk-empty" }, "Nobody is waiting on you. Hermes will see new messages as log syncs them.");
    }
    return h("div", { className: "lk-list" }, props.rows.map(function (w) {
      return h("div", { key: w.conversationId, className: "lk-row" },
        h("div", { className: "lk-avatar" }, (w.handle || w.with || "?").replace(/^@/, "").charAt(0).toUpperCase()),
        h("div", { className: "lk-row-main" },
          h("div", { className: "lk-row-top" },
            h("strong", null, w.with),
            h("span", { className: "lk-muted" }, "to @" + w.account + " · " + ago(w.at))),
          h("div", { className: "lk-row-text" }, props.hide ? "Message hidden" : (w.text || "Open the thread in Hermes to read it"))),
        h("button", { type: "button", className: "lk-btn", onClick: function () { ask(w); } },
          copied === w.conversationId ? "Copied" : "Ask Hermes"));
    }));
  }

  function Setup() {
    return h("div", { className: "lk-panel" },
      h("strong", { className: "lk-panel-title" }, "Set up log"),
      h("p", { className: "lk-muted" }, "log isn't set up on this machine yet. Install it, sign in your accounts, then come back here."),
      h("pre", { className: "lk-code" }, "bun add -g @listeningkit/log\nlog launch --setup"));
  }

  function LogPage() {
    var d = useState(null), data = d[0], setData = d[1];
    var e = useState(""), error = e[0], setError = e[1];
    var b = useState(false), busy = b[0], setBusy = b[1];
    var t = useState(readHide()), hide = t[0], setHide = t[1];
    function load() {
      setBusy(true);
      SDK.fetchJSON(API + "/overview").then(function (r) { setData(r); setError(""); })
        .catch(function (err) { setError(String((err && err.message) || err)); })
        .then(function () { setBusy(false); });
    }
    useEffect(function () {
      load();
      var id = setInterval(load, 60000);
      return function () { clearInterval(id); };
    }, []);
    if (!data) return h("div", { className: "lk-page" }, h("div", { className: "lk-panel lk-muted" }, error ? "Couldn't read log: " + error : "Reading log..."));
    var accounts = data.accounts || [];
    var signedIn = accounts.filter(function (a) { return a.sessionState === "loggedIn"; }).length;
    var sends = accounts.reduce(function (n, a) { return n + (a.writesToday || 0); }, 0);
    var platforms = {};
    accounts.forEach(function (a) { platforms[a.platformLabel] = true; });
    return h("div", { className: "lk-page" },
      h("section", { className: "lk-hero" },
        h("div", null,
          h("div", { className: "lk-kicker" }, "log by ListeningKit"),
          h("h1", null, "Your conversations, one place."),
          h("p", null, "Who is waiting on you across your accounts. Hermes reads freely; every send waits for your yes.")),
        h("button", { type: "button", className: "lk-btn lk-btn-strong", disabled: busy, onClick: load }, busy ? "Reading..." : "Refresh")),
      data.installed ? null : h(Setup),
      data.installed ? h("div", { className: "lk-stats" },
        h(Stat, { label: "Waiting on you", value: String(data.waitingTotal || 0), hint: "X conversations where they wrote last", accent: true }),
        h(Stat, { label: "Accounts", value: signedIn + " / " + accounts.length, hint: "signed in, " + plural(Object.keys(platforms).length, "platform") }),
        h(Stat, { label: "Sent today", value: String(sends), hint: "every one approved by you" }),
        h(Stat, { label: "Privacy", value: "Local", hint: "read from this machine only" })) : null,
      data.installed ? h("div", { className: "lk-split" },
        h("div", null,
          h("div", { className: "lk-section-head" },
            h("strong", { className: "lk-panel-title" }, "Waiting on you"),
            h("label", { className: "lk-toggle" },
              h("input", { type: "checkbox", checked: hide, onChange: function (ev) { setHide(ev.target.checked); saveHide(ev.target.checked); } }),
              "Hide message text")),
          h(Waiting, { rows: data.waiting || [], hide: hide }),
          data.syncedAt ? h("div", { className: "lk-foot lk-muted" }, "X inbox synced " + ago(data.syncedAt)) : null),
        h("div", null,
          h("strong", { className: "lk-panel-title" }, "Accounts"),
          accounts.length ? h("div", { className: "lk-grid" }, accounts.map(function (a) { return h(Account, { key: a.platform + a.account, account: a }); }))
            : h("div", { className: "lk-panel lk-muted" }, "No accounts yet. Sign one in with log launch --setup."))) : null,
      error ? h("div", { className: "lk-foot lk-muted" }, "Last refresh failed: " + error) : null);
  }

  window.__HERMES_PLUGINS__.register("listeningkit-log", LogPage);
})();
