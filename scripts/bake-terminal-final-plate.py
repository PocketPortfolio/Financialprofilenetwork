#!/usr/bin/env python3
"""
FINAL retail terminal plate v7 — Creative Studios optical 16:9:
- Exact $30k UI (header + sidebar + SYSTEM ALERT + Initialize Sync)
- True 3840×2160, uniform scale only (no anamorphic stretch, no letterbox)
- Band composite: keep header + alert, drop ~100px of mid gap between brief and alert
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
ALERT_START_SRC = 1088  # SYSTEM ALERT banner
ALERT_END_SRC = 1168  # below alert, before FAB/footer clutter


def compose_optical_16x9(src: Path) -> Image.Image:
    base = Image.open(src).convert("RGB")
    sw, sh = base.size
    scale = OUT_W / sw  # width-locked uniform scale
    nw = OUT_W
    nh = int(round(sh * scale))
    scaled = base.resize((nw, nh), Image.Resampling.LANCZOS)
    arr = np.asarray(scaled)

    h_end = int(round(HEADER_END_SRC * scale))
    a0 = int(round(ALERT_START_SRC * scale))
    a1 = int(round(ALERT_END_SRC * scale))
    alert_h = a1 - a0
    mid_h = OUT_H - h_end - alert_h
    if mid_h < 100:
        raise SystemExit(f"mid band too small: {mid_h}")

    # Mid band: contiguous rows immediately under header, length mid_h
    # (skips the gap that would otherwise force letterbox/stretch)
    mid0 = h_end
    mid1 = mid0 + mid_h
    if mid1 > a0:
        # Prefer keeping content just above alert if header+mid overshoots
        mid1 = a0
        mid0 = mid1 - mid_h
        if mid0 < h_end:
            mid0 = h_end
            mid1 = mid0 + mid_h

    header = arr[0:h_end]
    mid = arr[mid0:mid1]
    alert = arr[a0:a1]

    if header.shape[0] + mid.shape[0] + alert.shape[0] != OUT_H:
        # Fix rounding drift
        need = OUT_H - header.shape[0] - alert.shape[0]
        if mid.shape[0] > need:
            mid = mid[:need]
        elif mid.shape[0] < need:
            pad = need - mid.shape[0]
            mid = np.concatenate([mid, arr[mid1 : mid1 + pad]], axis=0)

    out = np.concatenate([header, mid, alert], axis=0)
    if out.shape[0] != OUT_H or out.shape[1] != OUT_W:
        raise SystemExit(f"bad compose shape {out.shape}, want {(OUT_H, OUT_W, 3)}")

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
                        "portalTerminal — FINAL v7 · optical 16:9 · header+alert · no stretch"
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
