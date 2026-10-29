#!/usr/bin/env python3
"""
FINAL retail terminal plate v7.3 — Creative Studios optical 16:9:
- Exact $30k UI (header + full sidebar nav + SYSTEM ALERT + Initialize Sync)
- True 3840×2160, uniform scale only (no anamorphic stretch, no letterbox)
- Column-aware: gutter skips apply to MAIN only — sidebar keeps full menu
"""
from __future__ import annotations

import hashlib
import json
import re
import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(r"C:\dev\pocket-portfolio-app")
SEED = ROOT / "docs" / "seed" / "pocket-design-plates"
PUBLIC = ROOT / "public" / "pocket" / "landing" / "plates"
CACHE = ROOT / "lib" / "pocket-landing-plate-cache.ts"
VISUALS = ROOT / "lib" / "pocket-landing-visuals.ts"
WS = Path(
    r"C:\Users\fitne\AppData\Roaming\Cursor\User\workspaceStorage"
    r"\53b92a390368ba8aa2934d20cbb15dc3\images"
)

SRC = WS / "image-2d99c8b1-9b6f-4c1f-b383-3a7195bc15c6.png"
OUT_W, OUT_H = 3840, 2160

# Source landmarks (1882×1255 full chrome $30k)
HEADER_END_SRC = 70  # below top nav
SIDEBAR_END_SRC = 321  # inclusive hairline at x=320
ALERT_START_SRC = 1084  # SYSTEM ALERT chrome
ALERT_END_SRC = 1168  # below alert, before FAB/footer clutter
# Preferred dark gutters to delete (src Y) — MAIN column only
GUTTER_SKIPS_SRC: list[tuple[int, int]] = [
    (505, 580),  # between portfolio block and risk matrix
    (745, 804),  # between risk matrix and client brief
    (1000, 1084),  # below brief SOURCE line, above alert
]


def _consume_gutters(
    h_end: int, a0: int, skip_needed: int, scale: float
) -> list[tuple[int, int]]:
    """Return scaled keep-segments covering [h_end, a0) with skip_needed rows removed."""
    if skip_needed <= 0:
        return [(h_end, a0)]

    # Map preferred gutters into scaled coords, clipped to (h_end, a0)
    gutters: list[tuple[int, int]] = []
    for s0, s1 in GUTTER_SKIPS_SRC:
        g0 = max(h_end, int(round(s0 * scale)))
        g1 = min(a0, int(round(s1 * scale)))
        if g1 > g0:
            gutters.append((g0, g1))

    remove_ranges: list[tuple[int, int]] = []
    left = skip_needed
    for g0, g1 in gutters:
        if left <= 0:
            break
        take = min(left, g1 - g0)
        # Prefer removing from the middle of each gutter
        mid = (g0 + g1) // 2
        r0 = max(g0, mid - take // 2)
        r1 = r0 + take
        if r1 > g1:
            r1 = g1
            r0 = r1 - take
        remove_ranges.append((r0, r1))
        left -= take

    if left > 0:
        # Last resort: trim just above alert (still below brief body)
        r1 = a0
        r0 = a0 - left
        if r0 < h_end:
            raise SystemExit(f"cannot fit skip={skip_needed} into mid span")
        remove_ranges.append((r0, r1))
        left = 0

    remove_ranges.sort()
    # Merge overlaps
    merged: list[tuple[int, int]] = []
    for r0, r1 in remove_ranges:
        if not merged or r0 > merged[-1][1]:
            merged.append((r0, r1))
        else:
            merged[-1] = (merged[-1][0], max(merged[-1][1], r1))

    keeps: list[tuple[int, int]] = []
    cursor = h_end
    for r0, r1 in merged:
        if cursor < r0:
            keeps.append((cursor, r0))
        cursor = max(cursor, r1)
    if cursor < a0:
        keeps.append((cursor, a0))
    return keeps


def compose_optical_16x9(src: Path) -> Image.Image:
    base = Image.open(src).convert("RGB")
    sw, sh = base.size
    scale = OUT_W / sw  # width-locked uniform scale
    nw = OUT_W
    nh = int(round(sh * scale))
    scaled = base.resize((nw, nh), Image.Resampling.LANCZOS)
    arr = np.asarray(scaled)

    h_end = int(round(HEADER_END_SRC * scale))
    sb_w = int(round(SIDEBAR_END_SRC * scale))
    a0 = int(round(ALERT_START_SRC * scale))
    a1 = int(round(ALERT_END_SRC * scale))
    alert_h = a1 - a0
    body_h = OUT_H - h_end
    mid_h = body_h - alert_h
    if mid_h < 100:
        raise SystemExit(f"mid band too small: {mid_h}")

    # MAIN column: gutter-skip to fit alert without brief overlap
    avail = a0 - h_end
    skip_needed = avail - mid_h
    keeps = _consume_gutters(h_end, a0, skip_needed, scale)
    main_parts = [arr[u:v, sb_w:] for u, v in keeps if v > u]
    main_mid = (
        np.concatenate(main_parts, axis=0) if main_parts else arr[h_end:a0, sb_w:]
    )
    if main_mid.shape[0] > mid_h:
        main_mid = main_mid[:mid_h]
    elif main_mid.shape[0] < mid_h:
        raise SystemExit(f"main mid short: {main_mid.shape[0]} < {mid_h}")
    main_alert = arr[a0:a1, sb_w:]
    main = np.concatenate([main_mid, main_alert], axis=0)
    if main.shape[0] != body_h:
        raise SystemExit(f"main body_h {main.shape[0]} != {body_h}")

    # SIDEBAR: continuous strip — never apply gutter skips (keeps full menu)
    sb_avail = arr.shape[0] - h_end
    if sb_avail >= body_h:
        sidebar = arr[h_end : h_end + body_h, :sb_w]
    else:
        pad = body_h - sb_avail
        fill = np.broadcast_to(arr[-1:, :sb_w], (pad, sb_w, 3)).copy()
        sidebar = np.concatenate([arr[h_end:, :sb_w], fill], axis=0)

    body = np.concatenate([sidebar, main], axis=1)
    if body.shape[1] != OUT_W:
        # rounding drift on sb_w
        if body.shape[1] > OUT_W:
            body = body[:, :OUT_W]
        else:
            pad_w = OUT_W - body.shape[1]
            body = np.concatenate(
                [body, np.broadcast_to(body[:, -1:, :], (body_h, pad_w, 3)).copy()],
                axis=1,
            )

    header = arr[0:h_end]
    if header.shape[1] != body.shape[1]:
        header = header[:, : body.shape[1]]
    out = np.concatenate([header, body], axis=0)
    if out.shape[0] != OUT_H or out.shape[1] != OUT_W:
        raise SystemExit(f"bad compose shape {out.shape}, want {(OUT_H, OUT_W, 3)}")

    print(
        "compose keeps",
        [(u, v) for u, v in keeps],
        "skip",
        skip_needed,
        "sb_w",
        sb_w,
        "main",
        main.shape[0],
    )
    im = Image.fromarray(out, "RGB")
    return im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=120, threshold=2))


def patch_cache(digest: str) -> None:
    text = CACHE.read_text(encoding="utf-8")
    text2, n = re.subn(
        r"'web-portal-terminal\.png': '[0-9a-f]+'",
        f"'web-portal-terminal.png': '{digest}'",
        text,
        count=1,
    )
    if n != 1:
        raise SystemExit("cache patch failed")
    CACHE.write_text(text2, encoding="utf-8")


def patch_alt() -> None:
    text = VISUALS.read_text(encoding="utf-8")
    text2, n = re.subn(
        r"(id: 'portalTerminal',[\s\S]*?alt: )'[^']*'",
        r"\1'Pocket Portfolio terminal — $30k total value, risk matrix, Pocket Analyst brief, "
        r"local-storage sync alert, and full app chrome'",
        text,
        count=1,
    )
    if n != 1:
        print("alt patch skipped")
        return
    VISUALS.write_text(text2, encoding="utf-8")


def qc_metrics(im: Image.Image) -> dict:
    a = np.asarray(im)
    h, w, _ = a.shape
    logo = (
        (a[:160, :, 0] > 200) & (a[:160, :, 1] > 150) & (a[:160, :, 2] < 80)
    ).sum()
    # warm banner density in bottom 20%
    bot = a[int(h * 0.78) :]
    warm = (
        (bot[:, :, 0] > 150)
        & (bot[:, :, 1] > 80)
        & (bot[:, :, 2] < 100)
        & ((bot[:, :, 0] - bot[:, :, 2]) > 50)
    ).mean()
    # FAB circle in bottom-right
    mask = (
        (a[:, :, 0] > 200)
        & (a[:, :, 1] > 140)
        & (a[:, :, 1] < 210)
        & (a[:, :, 2] < 60)
    )
    ys, xs = np.where(mask[int(h * 0.82) :, int(w * 0.9) :])
    fab_ar = None
    if len(xs) >= 15:
        yoff, xoff = int(h * 0.82), int(w * 0.9)
        cy, cx = int(np.median(ys)), int(np.median(xs))
        sel = (np.abs(ys - cy) < 90) & (np.abs(xs - cx) < 90)
        ys2, xs2 = ys[sel], xs[sel]
        bw = int(xs2.max() - xs2.min() + 1)
        bh = int(ys2.max() - ys2.min() + 1)
        fab_ar = round(bw / max(1, bh), 3)
    return {"logo_px": int(logo), "warm_bot": round(float(warm), 4), "fab_ar": fab_ar}


def main() -> None:
    assert SRC.exists(), SRC
    SEED.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)

    seed = SEED / "pocket-portal-terminal-hd-v4.png"
    shutil.copy2(SRC, seed)

    final = compose_optical_16x9(SRC)
    master = SEED / "pocket-portal-terminal-master-final-v6.png"
    baked = PUBLIC / "web-portal-terminal.png"
    final.save(master, format="PNG", compress_level=4)
    final.save(baked, format="PNG", compress_level=4)
    digest = hashlib.sha256(baked.read_bytes()).hexdigest()[:12]
    patch_cache(digest)
    patch_alt()

    man = PUBLIC / "manifest.json"
    if man.exists():
        try:
            data = json.loads(man.read_text(encoding="utf-8"))
            for row in data.get("plates", []):
                if row.get("dest") == "web-portal-terminal.png":
                    row["src"] = "pocket-portal-terminal-master-final-v6.png"
                    row["hash"] = digest
                    row["label"] = (
                        "portalTerminal — FINAL v7.3 · optical 16:9 · full sidebar · clean alert"
                    )
            man.write_text(json.dumps(data, indent=2), encoding="utf-8")
        except Exception as e:
            print("manifest", e)

    qc = SEED / "_qc_current_terminal.png"
    final.resize((960, 540), Image.Resampling.LANCZOS).save(qc)
    final.crop((0, 0, OUT_W, 160)).resize((960, 40), Image.Resampling.LANCZOS).save(
        SEED / "_qc_v7_top.png"
    )
    final.crop((0, OUT_H - 200, OUT_W, OUT_H)).resize(
        (960, 50), Image.Resampling.LANCZOS
    ).save(SEED / "_qc_v7_bot.png")
    # Seam: last mid rows + first alert rows
    seam_y = OUT_H - int(round((ALERT_END_SRC - ALERT_START_SRC) * (OUT_W / 1882)))
    final.crop((0, max(0, seam_y - 80), OUT_W, min(OUT_H, seam_y + 120))).resize(
        (960, 60), Image.Resampling.LANCZOS
    ).save(SEED / "_qc_v71_seam.png")

    m = qc_metrics(final)
    print("size", final.size)
    print("hash", digest)
    print("qc", m)
    print("master", master)
    if m["logo_px"] < 1000:
        raise SystemExit("FAIL: header logo missing")
    if m["warm_bot"] < 0.01:
        raise SystemExit("FAIL: SYSTEM ALERT band missing")
    if m["fab_ar"] is not None and not (0.85 <= m["fab_ar"] <= 1.15):
        raise SystemExit(f"FAIL: FAB stretched ar={m['fab_ar']}")


if __name__ == "__main__":
    main()
