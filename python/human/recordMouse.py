from __future__ import annotations

import ctypes
import json
import math
import statistics
import sys
import time
from datetime import datetime
from pathlib import Path

HZ = 120
MOVING_PX_S = 40
STILL_GAP_S = 0.08


class POINT(ctypes.Structure):
    _fields_ = [("x", ctypes.c_long), ("y", ctypes.c_long)]


def record(seconds: float) -> Path:
    user32 = ctypes.windll.user32
    point = POINT()
    samples: list[list[float]] = []
    start = time.perf_counter()
    next_note = 10
    print(f"Recording your mouse for {seconds:g} s: go ahead.", flush=True)
    while (now := time.perf_counter() - start) < seconds:
        user32.GetCursorPos(ctypes.byref(point))
        left = 1 if user32.GetAsyncKeyState(0x01) & 0x8000 else 0
        right = 1 if user32.GetAsyncKeyState(0x02) & 0x8000 else 0
        samples.append([round(now, 4), point.x, point.y, left, right])
        if now >= next_note:
            print(f"  {next_note} s, {len(samples)} samples", flush=True)
            next_note += 10
        time.sleep(1 / HZ)
    out = Path.home() / ".logCli" / "mouse" / f"{datetime.now().strftime('%Y%m%dT%H%M%S')}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"hz": HZ, "seconds": seconds, "columns": ["t", "x", "y", "left", "right"], "samples": samples}), encoding="utf8")
    print(f"Saved {len(samples)} samples: {out}", flush=True)
    return out


def analyze(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf8"))
    s = data["samples"]
    speeds = [0.0]
    for a, b in zip(s, s[1:]):
        dt = max(b[0] - a[0], 1e-4)
        speeds.append(math.dist(a[1:3], b[1:3]) / dt)
    moves: list[tuple[int, int]] = []
    i = 0
    while i < len(s):
        if speeds[i] > MOVING_PX_S:
            j = i
            quiet_since = None
            while j < len(s) - 1:
                j += 1
                if speeds[j] > MOVING_PX_S:
                    quiet_since = None
                elif quiet_since is None:
                    quiet_since = s[j][0]
                elif s[j][0] - quiet_since >= STILL_GAP_S:
                    break
            moves.append((max(i - 1, 0), j))
            i = j + 1
        else:
            i += 1

    rows = []
    for a, b in moves:
        pts = s[a:b + 1]
        chord = math.dist(pts[0][1:3], pts[-1][1:3])
        if chord < 3:
            continue
        path_len = sum(math.dist(p[1:3], q[1:3]) for p, q in zip(pts, pts[1:]))
        dur = pts[-1][0] - pts[0][0]
        peak_at = max(range(a, b + 1), key=lambda k: speeds[k])
        ux, uy = (pts[-1][1] - pts[0][1]) / chord, (pts[-1][2] - pts[0][2]) / chord
        beyond = max(((p[1] - pts[0][1]) * ux + (p[2] - pts[0][2]) * uy) - chord for p in pts)
        side = max(abs((p[1] - pts[0][1]) * uy - (p[2] - pts[0][2]) * ux) for p in pts)
        click_after = next((round(k[0] - pts[-1][0], 3) for k in s[b:b + HZ * 2] if k[3] or k[4]), None)
        rows.append({"start": round(pts[0][0], 2), "ms": round(dur * 1000), "distance": round(chord), "path": round(path_len),
                     "straightness": round(chord / path_len, 3) if path_len else 1, "sidePx": round(side), "overshootPx": round(max(beyond, 0)),
                     "peakPxS": round(speeds[peak_at]), "peakAt": round((s[peak_at][0] - pts[0][0]) / dur, 2) if dur else 0,
                     "clickAfterS": click_after})
    stills = [round(rows[k + 1]["start"] - (rows[k]["start"] + rows[k]["ms"] / 1000), 2) for k in range(len(rows) - 1)]
    clicks = sum(1 for p, q in zip(s, s[1:]) if (q[3] and not p[3]) or (q[4] and not p[4]))
    summary = {"file": str(path), "samples": len(s), "seconds": data["seconds"], "moves": len(rows), "clicks": clicks}
    if rows:
        def q(values, n=4):
            values = sorted(values)
            return [round(values[int(len(values) * f) if f < 1 else -1], 2) for f in (0.1, 0.5, 0.9)][:n]
        summary.update({
            "moveMs (p10/p50/p90)": q([r["ms"] for r in rows]),
            "distancePx (p10/p50/p90)": q([r["distance"] for r in rows]),
            "msPer100px (median)": round(statistics.median(r["ms"] / r["distance"] * 100 for r in rows), 1),
            "straightness (p10/p50/p90)": q([r["straightness"] for r in rows]),
            "sidePx (p10/p50/p90)": q([r["sidePx"] for r in rows]),
            "overshoot: moves with >3px": f"{sum(1 for r in rows if r['overshootPx'] > 3)}/{len(rows)}",
            "peak speed at (fraction of the move, median)": round(statistics.median(r["peakAt"] for r in rows), 2),
            "stillS between moves (p10/p50/p90)": q(stills) if stills else None,
            "share of the time still": round(1 - sum(r["ms"] for r in rows) / 1000 / data["seconds"], 2),
            "click after the move ends, s (median)": round(statistics.median([r["clickAfterS"] for r in rows if r["clickAfterS"] is not None]), 3)
            if any(r["clickAfterS"] is not None for r in rows) else None,
        })
    path.with_suffix(".analysis.json").write_text(json.dumps({"summary": summary, "moves": rows}, indent=2), encoding="utf8")
    return summary


def main() -> int:
    if len(sys.argv) > 2 and sys.argv[1] == "--analyze":
        path = Path(sys.argv[2])
    else:
        path = record(float(sys.argv[1]) if len(sys.argv) > 1 else 60)
    for key, value in analyze(path).items():
        print(f"{key}: {value}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
