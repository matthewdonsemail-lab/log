export function trainerPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Log Memetrainer</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schoolbell&display=swap">
<style>
  :root { --bg: #fff; --text: #0f1419; --muted: #536471; --line: #eff3f4; --blue: #1d9bf0; --hover: #f7f9f9; --pink: #f91880; --green: #00ba7c; }
  @font-face { font-family: 'Satoshi'; src: url('/site/fonts/satoshi-webfont/Satoshi-Regular.woff') format('woff'); font-weight: 400; }
  @font-face { font-family: 'Satoshi'; src: url('/site/fonts/satoshi-webfont/Satoshi-Medium.woff') format('woff'); font-weight: 500; }
  @font-face { font-family: 'Satoshi'; src: url('/site/fonts/satoshi-webfont/Satoshi-Black.woff') format('woff'); font-weight: 900; }
  html { background: #2a8cff; }
  .sky { position: fixed; inset: 0; z-index: 0; background: radial-gradient(ellipse 130% 70% at 50% 0%, #5ca7ff 0%, #2a8cff 60%), #2a8cff; }
  .floaters { position: fixed; inset: 0; z-index: 4; pointer-events: none; overflow: hidden; }
  .floaters img { position: absolute; top: 0; left: 0; border-radius: 10px; object-fit: cover; }
  .hero { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 18px 16px 14px; color: #fff; flex: none; font-family: 'Satoshi', Inter, system-ui, sans-serif; }
  .hero h1, .hero p { color: #fff; text-shadow: 0 0 12px rgba(255,255,255,.55), 0 0 28px rgba(255,255,255,.35); }
  .hero .row { display: flex; align-items: center; gap: 16px; }
  .hero img { width: 56px; height: 56px; border-radius: 14px; }
  .hero h1 { margin: 0; font-size: clamp(32px, 5vw, 52px); font-weight: 900; line-height: 1.05; letter-spacing: -0.01em; }
  .hero p { margin: 8px 0 0; max-width: 720px; font-size: 16px; line-height: 1.4; font-weight: 500; }
  .lk-bluekey { font-family: 'Schoolbell', cursive; font-weight: 400; color: #2a8cff; display: inline-block; transform: rotate(-2deg);
    text-shadow: 3px 0 0 #fff,2.85px .93px 0 #fff,2.43px 1.76px 0 #fff,1.76px 2.43px 0 #fff,.93px 2.85px 0 #fff,0 3px 0 #fff,-.93px 2.85px 0 #fff,-1.76px 2.43px 0 #fff,-2.43px 1.76px 0 #fff,-2.85px .93px 0 #fff,-3px 0 0 #fff,-2.85px -.93px 0 #fff,-2.43px -1.76px 0 #fff,-1.76px -2.43px 0 #fff,-.93px -2.85px 0 #fff,.93px -2.85px 0 #fff,1.76px -2.43px 0 #fff,2.43px -1.76px 0 #fff,2.85px -.93px 0 #fff,6px 0 0 #000,5.7px 1.86px 0 #000,4.86px 3.53px 0 #000,3.53px 4.86px 0 #000,1.86px 5.7px 0 #000,0 6px 0 #000,-1.86px 5.7px 0 #000,-3.53px 4.86px 0 #000,-4.86px 3.53px 0 #000,-5.7px 1.86px 0 #000,-6px 0 0 #000,-5.7px -1.86px 0 #000,-4.86px -3.53px 0 #000,-3.53px -4.86px 0 #000,-1.86px -5.7px 0 #000,1.86px -5.7px 0 #000,3.53px -4.86px 0 #000,4.86px -3.53px 0 #000,5.7px -1.86px 0 #000; }
  * { box-sizing: border-box; }
  html, body { height: 100%; overflow: hidden; }
  body { display: flex; flex-direction: column; margin: 0; background: transparent; color: var(--text); font: 15px/1.3125 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .col { position: relative; z-index: 2; display: flex; flex-direction: column; flex: 1; min-height: 0; width: min(600px, calc(100% - 32px)); margin: 0 auto 20px; overflow: hidden; background: var(--bg); border-radius: 16px; box-shadow: 0 6px 0 #0d2a4c40, 0 24px 60px #0d2a4c59; }
  .col > .picker:last-child { border-bottom: 0; }
  .top { flex: none; border-bottom: 1px solid var(--line); position: relative; z-index: 3; display: flex; align-items: center; gap: 24px; height: 53px; padding: 0 16px; background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(12px); }
  .top h1 { font-size: 20px; font-weight: 700; margin: 0; flex: 1; }
  .top .count { color: var(--muted); font-size: 13px; }
  .icon { width: 18.75px; height: 18.75px; fill: currentColor; }
  .post { display: flex; gap: 8px; padding: 12px 16px 0; }
  .rail { display: flex; flex-direction: column; align-items: center; width: 40px; flex: none; }
  .rail .line { width: 2px; flex: 1; background: var(--line); margin-top: 4px; }
  img.av { object-fit: cover; }
  .av { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 17px; flex: none; }
  .body { flex: 1; min-width: 0; padding-bottom: 12px; }
  .who { display: flex; gap: 4px; white-space: nowrap; overflow: hidden; }
  .who b { font-weight: 700; } .who span { color: var(--muted); }
  .text { margin-top: 2px; white-space: pre-wrap; word-wrap: break-word; }
  .acts { display: flex; justify-content: space-between; max-width: 425px; margin-top: 12px; color: var(--muted); font-size: 13px; }
  .acts div { display: flex; align-items: center; gap: 4px; }
  .focal { padding: 12px 16px 0; }
  .focal .head { display: flex; gap: 8px; align-items: center; }
  .focal .who { flex-direction: column; gap: 0; }
  .focal .text { font-size: 17px; line-height: 1.5; margin-top: 12px; }
  .focal .meta { color: var(--muted); margin: 16px 0; }
  .focal .meta b { color: var(--text); }
  .focal .acts { max-width: none; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 12px 4px; margin: 0; }
  .focal .acts .icon { width: 22.5px; height: 22.5px; }
  .replying { padding: 12px 16px 0 68px; color: var(--muted); }
  .replying a { color: var(--blue); text-decoration: none; }
  .composer { display: flex; gap: 8px; padding: 4px 16px 12px; border-bottom: 1px solid var(--line); }
  .composer textarea { width: 100%; border: 0; outline: 0; resize: none; background: transparent; color: var(--text); font-family: inherit; font-size: 20px; line-height: 1.3; padding: 8px 0; min-height: 44px; }
  .attached { position: relative; margin: 4px 0 8px; border-radius: 16px; overflow: hidden; border: 1px solid var(--line); display: none; }
  .attached.on { display: block; }
  .attached img, .attached video { display: block; width: 100%; max-height: 130px; object-fit: contain; background: #000; }
  .attached .x { position: absolute; top: 6px; left: 6px; width: 32px; height: 32px; border-radius: 50%; border: 0; background: rgba(15,20,25,.75); color: #fff; font-size: 18px; cursor: pointer; }
  .attached .tag { position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,.77); color: #fff; font-size: 13px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
  .bar { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--line); padding-top: 8px; }
  .tools { display: flex; gap: 4px; color: var(--blue); }
  .tools button { background: none; border: 0; color: inherit; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; }
  .tools button:hover, .tools button.on { background: color-mix(in srgb, var(--blue) 12%, transparent); }
  .right { display: flex; gap: 8px; align-items: center; }
  .btn { border: 0; border-radius: 9999px; font-weight: 700; font-size: 15px; padding: 0 16px; height: 36px; cursor: pointer; font-family: inherit; }
  .btn.reply { background: var(--text); color: var(--bg); }
  .btn.reply:disabled { opacity: .5; cursor: default; }
  .btn.ghost { background: transparent; color: var(--text); border: 1px solid var(--line); }
  .btn.find { display: inline-flex; align-items: center; gap: 6px; color: var(--blue); border-color: color-mix(in srgb, var(--blue) 40%, transparent); }
  .btn.find:disabled { opacity: .45; cursor: default; }
  .btn.find .icon { width: 16px; height: 16px; }
  .ph a { color: var(--blue); cursor: pointer; font-weight: 400; }
  .context { padding: 12px 16px 0; font-size: 14px; line-height: 1.35; color: var(--text); }
  .context b { color: var(--muted); font-weight: 700; margin-right: 4px; }
  .search { display: flex; align-items: center; gap: 8px; margin: 10px 16px 0; padding: 4px 4px 4px 14px; border-radius: 9999px; background: var(--hover); border: 1px solid var(--line); }
  .search:focus-within { border-color: var(--blue); background: var(--bg); }
  .search .icon { width: 18px; height: 18px; fill: var(--muted); flex: none; }
  .search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; font-size: 15px; color: var(--text); }
  .search .btn { padding: 6px 14px; }
  .skDark { display: inline-block; flex: none; height: 18px; border-radius: 9999px; background: linear-gradient(90deg, #ffffff14 0%, #ffffff2e 40%, #ffffff14 80%); background-size: 200% 100%; animation: shimmer 1.2s linear infinite; }
  .skDark.chipSk { width: 110px; height: 24px; }
  .third { min-height: 50px; position: relative; z-index: 5; flex: none; display: flex; align-items: center; gap: 10px; flex-wrap: nowrap; overflow: hidden; width: min(1180px, calc(100% - 32px)); margin: 0 auto 16px; padding: 10px 18px; border-radius: 16px; background: #0d2a4c; color: #fff; font-family: 'Satoshi', Inter, system-ui, sans-serif; box-shadow: 0 4px 0 #071a30; }
  .third .lvl { font-family: 'Schoolbell', cursive; font-size: 26px; color: #2a8cff; text-shadow: 2px 0 0 #fff,-2px 0 0 #fff,0 2px 0 #fff,0 -2px 0 #fff,1.4px 1.4px 0 #fff,-1.4px -1.4px 0 #fff,1.4px -1.4px 0 #fff,-1.4px 1.4px 0 #fff; white-space: nowrap; }
  .third .big { display: flex; align-items: baseline; gap: 6px; white-space: nowrap; font-weight: 900; font-size: 15px; }
  .third .big b { font-family: 'Schoolbell', cursive; font-weight: 400; font-size: 26px; color: #fff; }
  .third .sep { width: 1px; align-self: stretch; background: #ffffff26; flex: none; }
  .third .roles { display: flex; gap: 8px; overflow: hidden; }
  .third .chip { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; background: #ffffff14; border-radius: 9999px; padding: 4px 10px; font-size: 13px; font-weight: 500; }
  .third .chip .up { color: #5fe3a1; font-weight: 900; } .third .chip .down { color: #ff8a9a; font-weight: 900; }
  .third .meter { flex: none; width: 120px; height: 10px; border-radius: 9999px; background: #ffffff26; overflow: hidden; border: 0; padding: 0; }
  .third .meter i { display: block; height: 100%; background: linear-gradient(90deg, #5ca7ff, #2a8cff); border-radius: 9999px; transition: width .4s; }
  .pops { position: fixed; inset: 0; z-index: 6; pointer-events: none; }
  .pop { position: absolute; font-family: 'Schoolbell', cursive; font-size: 34px; color: #2a8cff; white-space: nowrap; transform: translate(-50%, 0) rotate(-4deg); animation: pop 1.6s ease-out forwards;
    text-shadow: 3px 0 0 #fff,-3px 0 0 #fff,0 3px 0 #fff,0 -3px 0 #fff,2px 2px 0 #fff,-2px -2px 0 #fff,2px -2px 0 #fff,-2px 2px 0 #fff,5px 0 0 #000,-5px 0 0 #000,0 5px 0 #000,0 -5px 0 #000,3.5px 3.5px 0 #000,-3.5px -3.5px 0 #000,3.5px -3.5px 0 #000,-3.5px 3.5px 0 #000; }
  @keyframes pop { 0% { opacity: 0; transform: translate(-50%, 20px) scale(.6) rotate(-4deg); } 15% { opacity: 1; transform: translate(-50%, 0) scale(1.15) rotate(-4deg); } 30% { transform: translate(-50%, -10px) scale(1) rotate(-4deg); } 100% { opacity: 0; transform: translate(-50%, -110px) scale(1) rotate(-4deg); } }
  .stream { flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none; }
  .stream::-webkit-scrollbar, .grid::-webkit-scrollbar { display: none; }
  .replyArea { flex: none; border-top: 1px solid var(--line); }
  .picker { flex: none; border-top: 1px solid var(--line); }
  .picker .ph { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 16px 2px; }
  .picker .ph b { font-size: 17px; }
  .picker .ph span { color: var(--muted); font-size: 13px; }
  .grid { display: grid; grid-auto-flow: column; grid-auto-columns: 128px; grid-template-rows: 128px; gap: 6px; padding: 6px 16px 14px; overflow-x: auto; scrollbar-width: none; }
  .meme { position: relative; cursor: pointer; border-radius: 10px; overflow: hidden; background: var(--hover); }
  .meme img, .meme video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .meme .cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 18px 6px 5px; background: linear-gradient(transparent, rgba(0,0,0,.8)); color: #fff; font-size: 12px; line-height: 1.25; }
  .meme .cap b { display: block; font-size: 13px; }
  .meme .cap i { font-style: normal; opacity: .85; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .meme.sel { outline: 3px solid var(--blue); outline-offset: -3px; }
  .busy { color: var(--muted); padding: 32px 16px; text-align: center; }
  .sk { background: linear-gradient(90deg, #eff3f4 0%, #f7f9f9 40%, #eff3f4 80%); background-size: 200% 100%; animation: shimmer 1.2s linear infinite; border-radius: 6px; }
  @keyframes shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
  .skPost { padding: 12px 16px 16px; }
  .skPost .head { display: flex; gap: 8px; align-items: center; }
  .skPost .circle { width: 40px; height: 40px; border-radius: 50%; flex: none; }
  .skPost .line { height: 14px; margin-top: 10px; }
  .skActs { display: flex; justify-content: space-between; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); margin-top: 18px; padding: 14px 4px; }
  .skActs .sk { width: 44px; height: 18px; }
  .meme.skMeme { cursor: default; border-radius: 10px; }
  .profile { padding: 0 16px 8px; color: var(--muted); font-size: 13px; border-bottom: 1px solid var(--line); }
  .profile:empty { display: none; }
  .bio { color: var(--muted); font-size: 14px; margin-top: 8px; }
  .fy { background: var(--hover); color: var(--muted); font-size: 11px; padding: 1px 4px; border-radius: 4px; margin-left: 4px; font-weight: 400; }
  .sent { padding: 10px 16px; color: var(--green); font-weight: 700; border-bottom: 1px solid var(--line); display: none; }
  .sent.on { display: block; }
  @media (max-width: 480px) { .replying { padding-left: 16px; } }
  @media (min-width: 1100px) {
    .col { width: min(1180px, calc(100% - 48px)); display: grid; grid-template-columns: 600px 1fr; grid-template-rows: auto 1fr auto; grid-template-areas: "top picker" "stream picker" "reply picker"; }
    .top { grid-area: top; }
    .stream { grid-area: stream; }
    .replyArea { grid-area: reply; }
    .picker { grid-area: picker; border-top: 0; border-left: 1px solid var(--line); display: flex; flex-direction: column; min-height: 0; }
    .picker .ph { padding: 16px 16px 4px; flex-direction: column; gap: 2px; }
    .grid { flex: 1; min-height: 0; grid-auto-flow: row; grid-template-columns: repeat(3, 1fr); grid-template-rows: none; grid-auto-rows: 200px; grid-auto-columns: auto; overflow-y: auto; overflow-x: hidden; align-content: start; scrollbar-width: none; padding: 8px 16px 16px; }
  }
</style>
</head>
<body>
<div class="sky"></div>
<div class="floaters" id="floaters"></div>
<header class="hero">
  <div class="row"><img src="/site/logo.svg" alt="ListeningKit logo"><h1>Log <span class="lk-bluekey">Memetrainer</span></h1></div>
  <p>Real posts from your niche map. Pick the meme you'd send, or skip what you'd never answer. Every pick teaches log your taste.</p>
</header>
<div class="col">
  <div class="top">
    <svg class="icon" viewBox="0 0 24 24"><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"/></svg>
    <h1>Post</h1>
    <span class="count" id="count">meme taste</span>
  </div>
  <div class="stream" id="stream">
  <div id="thread"></div>
  </div>
  <div class="replyArea">
  <div class="sent" id="sent"></div>
  <div class="replying" id="replying"></div>
  <div class="composer">
    <div class="av" style="background:#1d9bf0">m</div>
    <div style="flex:1;min-width:0">
      <textarea id="draft" rows="1" placeholder="Pick a meme, then write your caption"></textarea>
      <div class="attached" id="attached"><button class="x" id="detach" title="Remove">×</button><span class="tag">GIF</span><div id="attachedMedia"></div></div>
      <div class="bar">
        <div class="tools">
          <button id="gifBtn" class="on" title="Memes"><svg class="icon" viewBox="0 0 24 24"><path d="M3 5.5C3 4.119 4.12 3 5.5 3h13C19.88 3 21 4.119 21 5.5v13c0 1.381-1.12 2.5-2.5 2.5h-13C4.12 21 3 19.881 3 18.5v-13zM5.5 5c-.28 0-.5.224-.5.5v13c0 .276.22.5.5.5h13c.28 0 .5-.224.5-.5v-13c0-.276-.22-.5-.5-.5h-13zM18 10.711V9.25h-3.74v5.5h1.44v-1.719h1.7V11.57h-1.7v-.859H18zM11.79 9.25h1.44v5.5h-1.44v-5.5zm-3.07 1.375c.34 0 .77.172 1.02.43l1.03-.86c-.51-.601-1.28-.945-2.05-.945C7.19 9.25 6 10.453 6 12s1.19 2.75 2.72 2.75c.85 0 1.54-.344 2.05-.945v-2.149H8.38v1.032H9.4v.515c-.17.086-.42.172-.68.172-.76 0-1.36-.602-1.36-1.375 0-.688.6-1.375 1.36-1.375z"/></svg></button>
        </div>
        <div class="right">
          <button class="btn ghost" id="skip" title="You would not reply to this">Skip</button>
          <button class="btn reply" id="reply" disabled>Reply</button>
        </div>
      </div>
    </div>
  </div>
  </div>
  <div class="picker" id="picker">
    <div class="context" id="context"></div>
    <form class="search" id="searchForm"><svg class="icon" viewBox="0 0 24 24"><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/></svg><input id="searchBox" placeholder="None fit? Search the meme you&#39;d send" autocomplete="off"><button class="btn find" id="find" disabled>Search</button></form>
    <div class="ph" id="ph"><b>Pick the meme you&#39;d send</b><span>then write your caption</span></div>
    <div class="grid" id="memes"></div>
  </div>
</div>
<footer class="third" id="third"><span class="skDark" style="width:64px;height:26px"></span><span class="skDark" style="width:120px;height:10px"></span><span class="sep"></span><span class="skDark" style="width:90px"></span><span class="skDark" style="width:90px"></span><span class="skDark" style="width:130px"></span><span class="sep"></span><span class="skDark chipSk"></span><span class="skDark chipSk"></span><span class="skDark chipSk"></span><span class="skDark chipSk"></span></footer>
<div class="pops" id="pops"></div>
<script>
var ICONS = {
  reply: '<svg class="icon" viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 7.501 3.58 7.501 8 0 4.42-3.01 8-7.5 8H9.48l-4.9 3.86A1 1 0 013 21.08V18.6c-1.04-1.42-1.249-3.37-1.249-8.6zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37.28 5.29 1.13 6.36l.12.15V19.4l3.79-2.99.27-.21h5.46c3.37 0 5.5-2.69 5.5-6s-2.13-6-5.5-6H9.756z"/></svg>',
  rt: '<svg class="icon" viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg>',
  like: '<svg class="icon" viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91z"/></svg>',
  views: '<svg class="icon" viewBox="0 0 24 24"><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/></svg>'
};
var COLORS = ['#7856ff', '#f91880', '#ff7a00', '#00ba7c', '#1d9bf0', '#ffd400'];
var threadEl = document.getElementById('thread');
var memesEl = document.getElementById('memes');
var countEl = document.getElementById('count');
var draftEl = document.getElementById('draft');
var replyBtn = document.getElementById('reply');
var attachedEl = document.getElementById('attached');
var attachedMedia = document.getElementById('attachedMedia');
var sentEl = document.getElementById('sent');
var pickerEl = document.getElementById('picker');
var thirdEl = document.getElementById('third');
var popsEl = document.getElementById('pops');
var phEl = document.getElementById('ph');
var findBtn = document.getElementById('find');
var searchBox = document.getElementById('searchBox');
var contextEl = document.getElementById('context');
var shownMemes = [];
var searchedFor = '';
var round = null;
var picked = null;
var busy = false;

function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
function n(i, salt) { return (i * 37 + salt * 11 + 3) % 90 + 2; }
function isVideo(url) { return !!url && url.split('?')[0].toLowerCase().endsWith('.mp4'); }
function media(url, cover) { return isVideo(url) ? '<video src="' + url + '" muted loop autoplay playsinline></video>' : '<img loading="lazy" src="' + url + '"' + (cover ? '' : '') + '>'; }
function avatar(p, i) { var letter = '<div class="av" style="background:' + COLORS[i % COLORS.length] + '">' + esc((p.name || p.handle || '?').slice(0, 1).toUpperCase()) + '</div>'; if (!p.img) return letter; return '<img class="av" src="' + esc(p.img) + '" alt="" style="background:' + COLORS[i % COLORS.length] + '" onerror="this.removeAttribute(&quot;src&quot;)">'; }
function acts(i) { return '<div class="acts"><div>' + ICONS.reply + n(i, 1) + '</div><div>' + ICONS.rt + n(i, 2) + '</div><div>' + ICONS.like + n(i, 3) * 3 + '</div><div>' + ICONS.views + (n(i, 4) * 41) + '</div></div>'; }

function renderThread(s) {
  var person = s.person;
  var posts = s.thread.map(function (p) { return Object.assign({}, p, { img: p.img || (person && person.handle === p.handle ? person.img : null) }); });
  var html = '';
  posts.forEach(function (p, i) {
    var last = i === posts.length - 1;
    if (!last) {
      html += '<div class="post"><div class="rail">' + avatar(p, i) + '<div class="line"></div></div><div class="body"><div class="who"><b>' + esc(p.name || p.handle) + '</b><span>@' + esc(p.handle) + ' · ' + (posts.length - i) * 7 + 'm</span></div><div class="text">' + esc(p.text) + '</div>' + acts(i) + '</div></div>';
    } else {
      var now = new Date();
      var when = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + ' · ' + now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      html += '<div class="focal"><div class="head">' + avatar(p, i) + '<div class="who"><b>' + esc(p.name || p.handle) + '</b><span>@' + esc(p.handle) + (person && person.followsYou ? '<span class="fy">Follows you</span>' : '') + '</span></div></div>' + '<div class="text">' + esc(p.text) + '</div><div class="meta">' + when + ' · <b>' + n(i, 5) * 13 + '</b> Views</div>' + acts(i) + '</div>';
    }
  });
  threadEl.innerHTML = html;
  var handles = [];
  posts.forEach(function (p) { if (handles.indexOf(p.handle) === -1) handles.push(p.handle); });
  document.getElementById('replying').innerHTML = 'Replying to ' + handles.map(function (h) { return '<a>@' + esc(h) + '</a>'; }).join(' ');
}

function skeletonPost() {
  var w = [96, 88, 92, 54];
  return '<div class="skPost"><div class="head"><div class="sk circle"></div><div style="flex:1"><div class="sk" style="width:140px;height:14px"></div><div class="sk" style="width:96px;height:12px;margin-top:6px"></div></div></div>'
    + w.map(function (x, i) { return '<div class="sk line" style="width:' + x + '%;' + (i === 0 ? 'margin-top:16px' : '') + '"></div>'; }).join('')
    + '<div class="sk" style="width:180px;height:12px;margin-top:18px"></div><div class="skActs"><div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div></div></div>';
}
function skeletonMemes() { var out = ''; for (var i = 0; i < 9; i++) out += '<div class="meme skMeme sk"></div>'; return out; }

function renderMemes(memes) {
  memesEl.innerHTML = '';
  if (!memes.length) { memesEl.innerHTML = '<p class="busy" style="grid-column:1/-1">no memes came back for this one: type what you would send, or skip</p>'; return; }
  memes.forEach(function (m) {
    var el = document.createElement('div');
    el.className = 'meme';
    var src = m.previewUrl || m.mediaUrl;
    el.innerHTML = media(src, true) + '<div class="cap"><b>' + esc(m.name) + '</b><i>' + esc(m.fitsWhen || '') + '</i></div>';
    el.addEventListener('click', function () { attach(m, el); });
    memesEl.appendChild(el);
  });
}

function attach(m, el) {
  picked = m;
  document.querySelectorAll('.meme').forEach(function (c) { c.classList.remove('sel'); });
  if (el) el.classList.add('sel');
  attachedMedia.innerHTML = media(m.mediaUrl || m.previewUrl, false);
  attachedEl.querySelector('.tag').textContent = m.name;
  attachedEl.classList.add('on');
  draftEl.placeholder = 'Write your caption';
  sync();
  draftEl.focus({ preventScroll: true });
}

function detach() {
  picked = null;
  attachedEl.classList.remove('on');
  attachedMedia.innerHTML = '';
  draftEl.placeholder = 'Pick a meme, then write your caption';
  document.querySelectorAll('.meme').forEach(function (c) { c.classList.remove('sel'); });
  sync();
}

function sync() {
  replyBtn.disabled = busy || !round || !picked || !draftEl.value.trim();
  findBtn.disabled = busy || !round || !searchBox.value.trim();
  draftEl.style.height = 'auto';
  draftEl.style.height = draftEl.scrollHeight + 'px';
}

function base() {
  return { roundId: round.id, word: round.situation.moment, person: round.situation.person || undefined, thread: round.situation.thread.map(function (p) { return { handle: p.handle, text: p.text }; }), shown: shownMemes.map(function (m) { return m.name; }), searched: searchedFor || undefined };
}

async function rate(body) {
  var r = await fetch('/api/rate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(function (x) { return x.json(); }).catch(function () { return null; });
  if (r && r.ok) { showCount(r); popLearned((r.learned || []).concat(r.call ? [{ label: r.callMatched ? '+1 model right' : 'model missed' }] : [])); }
  return r;
}

function verdict(r) {
  if (!r || !r.call) return '';
  var c = r.call;
  var said = c.action === 'skip' ? 'skip' : c.name + (c.caption ? ' + "' + c.caption + '"' : '');
  return ' · model said: ' + said + ' (' + Math.round(c.confidence * 100) + '%) ' + (r.callMatched ? '✓' : '✗');
}

function gateText(g) {
  if (!g || !g.calls) return '<span class="big"><b>0</b>model calls</span>';
  var gate = g.threshold === null ? 'gate: not yet' : 'gate ≥ ' + Math.round(g.threshold * 100) + '% (' + g.above.right + '/' + g.above.calls + ' right)';
  return '<span class="big"><b>' + g.right + '/' + g.calls + '</b>model right</span><span class="big" title="the model sends on its own above this confidence, where it is right ' + Math.round(g.needed.accuracy * 100) + '% of the time over at least ' + g.needed.calls + ' calls">' + gate + '</span>';
}

function showCount(r) {
  countEl.textContent = (r.rated || 0) + ' rated';
  var st = r.stats || { rated: 0, replied: 0, skipped: 0, roles: [] };
  var level = Math.floor(st.rated / 10) + 1;
  var into = st.rated % 10;
  var picks = (r.taste && r.taste.picked) || [];
  var roles = (st.roles || []).map(function (x) { return '<span class="chip">' + esc(x.role.replace(/_/g, ' ')) + ' <span class="up">+' + x.replied + '</span><span class="down">-' + x.skipped + '</span></span>'; }).join('');
  thirdEl.innerHTML = '<span class="lvl">Lvl ' + level + '</span><span class="meter" title="' + into + ' of 10 to the next level"><i style="width:' + into * 10 + '%"></i></span>'
    + '<span class="sep"></span><span class="big"><b>' + st.replied + '</b>replied</span><span class="big"><b>' + st.skipped + '</b>skipped</span><span class="big"><b>' + picks.length + '</b>memes learned</span><span class="sep"></span>' + gateText(r.gate)
    + '<span class="sep"></span><span class="roles">' + roles + '</span>';
}

function popLearned(points) {
  var bar = thirdEl.getBoundingClientRect();
  points.forEach(function (p, i) {
    setTimeout(function () {
      var el = document.createElement('div');
      el.className = 'pop';
      el.textContent = p.label;
      el.style.left = (bar.left + bar.width * (0.25 + 0.5 * Math.random())) + 'px';
      el.style.top = (bar.top - 50) + 'px';
      popsEl.appendChild(el);
      setTimeout(function () { el.remove(); }, 1700);
    }, i * 260);
  });
}

function suggested() {
  searchedFor = '';
  shownMemes = round ? round.memes : [];
  phEl.innerHTML = '<b>Pick the meme you&#39;d send</b><span>then write your caption</span>';
  renderMemes(shownMemes);
}

async function findMemes() {
  var q = searchBox.value.trim();
  if (!q || !round || busy) return;
  findBtn.disabled = true;
  phEl.innerHTML = '<b>Searching memes…</b><span>' + esc(q) + '</span>';
  memesEl.innerHTML = skeletonMemes();
  var r = await fetch('/api/search', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: q, situation: round.situation }) }).then(function (x) { return x.json(); }).catch(function () { return { error: 'the search did not answer' }; });
  sync();
  if (r.error) { phEl.innerHTML = '<b>' + esc(r.error) + '</b><span><a id="back">back to suggested</a></span>'; document.getElementById('back').onclick = suggested; memesEl.innerHTML = ''; return; }
  searchedFor = q;
  shownMemes = r.memes;
  phEl.innerHTML = '<b>Your search</b><span>' + esc(q) + ' · <a id="back">back to suggested</a></span>';
  document.getElementById('back').onclick = suggested;
  renderMemes(shownMemes);
  var labels = await fetch('/api/label?query=' + encodeURIComponent(q)).then(function (x) { return x.json(); }).catch(function () { return null; });
  if (!labels || !labels.memes || searchedFor !== q) return;
  var byId = {};
  labels.memes.forEach(function (m) { byId[m.id] = m; });
  shownMemes = shownMemes.map(function (m) { return byId[m.id] ? Object.assign({}, m, { fitsWhen: byId[m.id].fitsWhen, fit: byId[m.id].fit }) : m; });
  document.querySelectorAll('#memes .meme').forEach(function (el, i) { var m = shownMemes[i]; var cap = el.querySelector('.cap i'); if (m && cap) cap.textContent = m.fitsWhen || ''; });
  if (picked && byId[picked.id]) picked = Object.assign({}, picked, { fitsWhen: byId[picked.id].fitsWhen });
}

async function skip() {
  if (busy) return;
  if (!round) { next(); return; }
  busy = true; sync();
  var r = await rate(Object.assign(base(), { templateId: '', name: '', mediaUrl: null, good: false, skipped: true }));
  sentEl.textContent = 'Skipped: you would not reply to this' + verdict(r);
  sentEl.style.color = 'var(--muted)';
  sentEl.classList.add('on');
  setTimeout(next, r && r.call ? 2200 : 500);
}

async function reply() {
  if (replyBtn.disabled) return;
  var text = draftEl.value.trim();
  var body = Object.assign(base(), { templateId: picked.id, name: picked.name, mediaUrl: picked.mediaUrl, fitsWhen: picked.fitsWhen, good: true, reply: text, fromSearch: !!searchedFor });
  busy = true; sync();
  var r = await rate(body);
  sentEl.textContent = 'Saved: ' + picked.name + ' + "' + text + '"' + verdict(r);
  sentEl.style.color = '';
  sentEl.classList.add('on');
  setTimeout(next, r && r.call ? 2600 : 700);
}

async function next() {
  busy = true;
  round = null;
  draftEl.value = '';
  searchBox.value = '';
  contextEl.innerHTML = '';
  detach();
  sentEl.classList.remove('on');
  threadEl.innerHTML = skeletonPost();
  document.getElementById('replying').innerHTML = '';
  memesEl.innerHTML = skeletonMemes();
  var r = await fetch('/api/round').then(function (x) { return x.json(); }).catch(function () { return { error: 'the trainer is not answering' }; });
  busy = false;
  if (r.error) { threadEl.innerHTML = '<p class="busy">' + esc(r.error) + '</p>'; sync(); return; }
  round = r;
  showCount(r);
  renderThread(r.situation);
  contextEl.innerHTML = '<b>Context</b>' + esc(r.situation.moment);
  searchedFor = '';
  shownMemes = r.memes;
  phEl.innerHTML = '<b>Pick the meme you&#39;d send</b><span>then write your caption</span>';
  renderMemes(r.memes);
  sync();
  var st = document.getElementById('stream'); st.scrollTop = st.scrollHeight;
  draftEl.focus({ preventScroll: true });
}

document.getElementById('detach').addEventListener('click', detach);
document.getElementById('gifBtn').addEventListener('click', function () { var on = pickerEl.style.display !== 'none'; pickerEl.style.display = on ? 'none' : ''; this.classList.toggle('on', !on); });
document.getElementById('skip').addEventListener('click', skip);
replyBtn.addEventListener('click', reply);
document.getElementById('searchForm').addEventListener('submit', function (e) { e.preventDefault(); findMemes(); });
searchBox.addEventListener('input', sync);
draftEl.addEventListener('input', sync);
draftEl.addEventListener('keydown', function (e) { if (e.key !== 'Enter' || e.shiftKey) return; e.preventDefault(); reply(); });
var floatEl = document.getElementById('floaters');
var floatImages = [];
function overlaps(a, b) { return a.x < b.right && a.x + a.w > b.left && a.y < b.bottom && a.y + a.h > b.top; }
function placeFloaters() {
  floatEl.innerHTML = '';
  var pad = 14;
  var keepOut = [document.querySelector('.col'), document.querySelector('.third'), document.querySelector('.hero .row'), document.querySelector('.hero p')].map(function (el) {
    var r = el.getBoundingClientRect();
    return { left: r.left - pad, right: r.right + pad, top: r.top - pad, bottom: r.bottom + pad };
  });
  var placed = [];
  var seed = 7;
  function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  var tries = 0;
  for (var i = 0; i < floatImages.length && tries < 2000; tries++) {
    var w = 110 + rand() * 70;
    var h = w * (0.8 + rand() * 0.35);
    var box = { x: rand() * (innerWidth - w * 0.6) - w * 0.2, y: rand() * (innerHeight - h * 0.6) - h * 0.2, w: w, h: h };
    if (keepOut.some(function (k) { return overlaps(box, k); })) continue;
    if (placed.some(function (q) { return overlaps(box, { left: q.x - 10, right: q.x + q.w + 10, top: q.y - 10, bottom: q.y + q.h + 10 }); })) continue;
    placed.push(box);
    var img = document.createElement('img');
    img.src = floatImages[i++];
    img.alt = '';
    img.style.width = w + 'px';
    img.style.height = h + 'px';
    img.style.transform = 'translate(' + box.x + 'px,' + box.y + 'px) rotate(' + (rand() * 14 - 7) + 'deg)';
    img.onerror = function () { this.remove(); };
    floatEl.appendChild(img);
  }
}
var placeTimer = 0;
addEventListener('resize', function () { clearTimeout(placeTimer); placeTimer = setTimeout(placeFloaters, 150); });
fetch('/api/floaters').then(function (x) { return x.json(); }).then(function (r) { floatImages = r.images || []; placeFloaters(); }).catch(function () {});
fetch('/api/stats').then(function (x) { return x.json(); }).then(function (r) { if (r && r.stats) showCount(r); }).catch(function () {});
next();
</script>
</body>
</html>`
}
