from __future__ import annotations

import re
from typing import Any

CANDIDATES_JS = r"""() => {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const implicit = (el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'button') return 'button';
    if (tag === 'a') return 'link';
    if (tag === 'textarea') return 'textbox';
    if (tag === 'select') return 'combobox';
    if (tag === 'input') {
      const type = (el.getAttribute('type') || 'text').toLowerCase();
      if (['button', 'submit', 'reset', 'file', 'image'].includes(type)) return 'button';
      if (type === 'checkbox') return 'checkbox';
      if (type === 'radio') return 'radio';
      return 'textbox';
    }
    return '';
  };
  const byIds = (ids) => norm((ids || '').split(/\s+/).map((id) => (document.getElementById(id) || {}).innerText || '').join(' '));
  const labelOf = (el) => byIds(el.getAttribute('aria-labelledby')) || norm(Array.from(el.labels || []).map((l) => l.innerText).join(' '));
  const dialogOf = (el) => {
    const d = el.closest('[role=dialog], [role=alertdialog], dialog');
    if (!d) return null;
    const heading = d.querySelector('h1, h2, h3, [role=heading]');
    return norm(d.getAttribute('aria-label')) || byIds(d.getAttribute('aria-labelledby')) || norm(heading ? heading.innerText : '');
  };
  const pathOf = (el) => {
    const parts = [];
    for (let node = el; node && node.nodeType === 1 && node !== document.documentElement; node = node.parentElement) {
      const parent = node.parentElement;
      const index = parent ? Array.prototype.indexOf.call(parent.children, node) + 1 : 1;
      parts.unshift(`${node.tagName.toLowerCase()}:nth-child(${index})`);
    }
    return `html > ${parts.join(' > ')}`;
  };
  const out = [];
  for (const el of document.querySelectorAll('[role], button, a[href], input, textarea, select')) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width < 1 || r.height < 1 || cs.visibility === 'hidden' || cs.display === 'none') continue;
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    out.push({
      role: (el.getAttribute('role') || implicit(el)).toLowerCase(),
      aria: norm(el.getAttribute('aria-label')),
      label: labelOf(el),
      text: el.tagName === 'INPUT' ? '' : norm(el.innerText),
      placeholder: norm(el.getAttribute('placeholder')),
      dialog: dialogOf(el),
      hit: !!hit && (hit === el || el.contains(hit)),
      enabled: !el.disabled && el.getAttribute('aria-disabled') !== 'true',
      ariaHidden: !!el.closest('[aria-hidden=true]'),
      path: pathOf(el),
    });
  }
  return out;
}"""

TAG_ATTRIBUTE = "data-log-control"

TAG_JS = r"""([path, token]) => {
  for (const old of document.querySelectorAll('[data-log-control]')) old.removeAttribute('data-log-control');
  const el = document.querySelector(path);
  if (!el) return false;
  el.setAttribute('data-log-control', token);
  return true;
}"""

NAME_FIELDS = ("aria", "label", "text", "placeholder")


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def describe(candidate: dict[str, Any]) -> str:
    shown = next((candidate[f] for f in NAME_FIELDS if candidate.get(f)), "")
    where = f' in dialog "{candidate["dialog"]}"' if candidate.get("dialog") is not None else ""
    return f'{candidate.get("role")} "{shown}"{where}'


def pick(candidates: list[dict[str, Any]], role: str, name: str, within: str | None = None) -> dict[str, Any]:
    want, kind = norm(name), norm(role)
    named = [i for i, c in enumerate(candidates) if norm(c.get("role")) == kind and any(norm(c.get(f)) == want for f in NAME_FIELDS)]
    if within is not None:
        named = [i for i in named if norm(candidates[i].get("dialog")) == norm(within)]
    elif any(candidates[i].get("dialog") is not None for i in named):
        named = [i for i in named if candidates[i].get("dialog") is not None]
    if not named:
        place = f' in dialog "{within}"' if within is not None else ""
        return {"code": "controlMissing", "detail": f'no visible {role} "{name}"{place}'}
    accessible = lambda c: norm(next((c.get(f) for f in NAME_FIELDS if c.get(f)), "")) == want
    for test in (accessible, lambda c: c.get("enabled"), lambda c: not c.get("ariaHidden"), lambda c: c.get("hit")):
        narrowed = [i for i in named if test(candidates[i])]
        if narrowed:
            named = narrowed
    if len(named) > 1:
        return {"code": "controlAmbiguous", "detail": f'{len(named)} controls match {role} "{name}": ' + "; ".join(describe(candidates[i]) for i in named[:4])}
    chosen = candidates[named[0]]
    return {"index": named[0], "path": chosen["path"], "enabled": bool(chosen.get("enabled"))}
