#!/usr/bin/env python3
"""
Bake near-final master retina terminal plate:
- No letterbox side bars
- Preserve top header chrome (north-anchored cover)
- Output 3840×2160 PNG + update plate cache hash

Preference order: near-16:9 $30k still → full-chrome $30k still (top-kept crop).
"""
from __future__ import annotations

import hashlib
import json
import re
import shutil
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(r"C:\dev\pocket-portfolio-app")
SEED = ROOT / "docs" / "seed" / "pocket-design-plates"
PUBLIC = ROOT / "public" / "pocket" / "landing" / "plates"
CACHE = ROOT / "lib" / "pocket-landing-plate-cache.ts"
WS = Path(
    r"C:\Users\fitne\AppData\Roaming\Cursor\User\workspaceStorage"
    r"\53b92a390368ba8aa2934d20cbb15dc3\images"
)

OUT_W, OUT_H = 3840, 2160
TARGET_AR = OUT_W / OUT_H

# Full chrome first (top header + sidebar). Near-16:9 crop lacks header.
CANDIDATES = [
    WS / "image-2d99c8b1-9b6f-4c1f-b383-3a7195bc15c6.png",  # 3:2 full chrome $30k
    WS / "image-aa8695c9-8890-4e3b-b966-20d7b0b0e87a.png",  # ~16:9 body-only
    ROOT / "public" / "dashboard-demo-4k-poster.jpg",
]


def score(p: Path) -> tuple[int, int]:
    # Prefer explicit order in CANDIDATES; secondary by area
    try:
        idx = CANDIDATES.index(p)
    except ValueError:
        idx = 99
    im = Image.open(p)
    return (-idx, im.size[0] * im.size[1])


def north_cover(im: Image.Image, tw: int, th: int) -> Image.Image:
    """Scale to cover 16:9, keep top (header), crop excess from bottom/sides as needed."""
    im = im.convert("RGB")
    sw, sh = im.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(round(sw * scale)), int(round(sh * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    # horizontal centre; vertical from top
    left = max(0, (nw - tw) // 2)
    top = 0 if nh >= th else max(0, (nh - th) // 2)
    if top + th > nh:
        top = max(0, nh - th)
    if left + tw > nw:
        left = max(0, nw - tw)
    out = im.crop((left, top, left + tw, top + th))
    # light unsharp after upscale — marketing plate clarity
    return out.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=2))


def main() -> None:
    existing = [p for p in CANDIDATES if p.exists()]
    if not existing:
        raise SystemExit("no source candidates")
    existing.sort(key=score, reverse=True)
    for p in existing:
        im = Image.open(p)
        print(f"cand {p.name}: {im.size[0]}x{im.size[1]} ar={im.size[0]/im.size[1]:.3f}")
    src = existing[0]
    print("chosen", src.name)

    seed = SEED / "pocket-portal-terminal-hd-v4.png"
    SEED.mkdir(parents=True, exist_ok=True)
    # keep prior for audit
    if seed.exists():
        shutil.copy2(seed, SEED / "_superseded_terminal_pre_master_retina.png")
    shutil.copy2(src, seed)

    master = north_cover(Image.open(src), OUT_W, OUT_H)
    baked = PUBLIC / "web-portal-terminal.png"
    PUBLIC.mkdir(parents=True, exist_ok=True)
    master.save(baked, format="PNG", compress_level=5)
    # also store named master artifact
    master_path = SEED / "pocket-portal-terminal-master-retina-v5.png"
    master.save(master_path, format="PNG", compress_level=5)

    digest = hashlib.sha256(baked.read_bytes()).hexdigest()[:12]
    print("baked", baked, master.size, digest)
    print("master", master_path)

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

    # sync map: document contain→cover north for this plate via fit cover in mjs
    man = PUBLIC / "manifest.json"
    if man.exists():
        try:
            data = json.loads(man.read_text(encoding="utf-8"))
            rows = data.get("plates", data if isinstance(data, list) else [])
            for row in rows:
                if isinstance(row, dict) and row.get("dest") == "web-portal-terminal.png":
                    row["src"] = "pocket-portal-terminal-hd-v4.png"
                    row["hash"] = digest
                    row["label"] = "portalTerminal — master retina v5 · no letterbox · top chrome kept"
            man.write_text(json.dumps(data, indent=2), encoding="utf-8")
        except Exception as e:
            print("manifest skip", e)

    qc = SEED / "_qc_current_terminal.png"
    master.resize((960, 540), Image.Resampling.LANCZOS).save(qc)
    print("qc", qc)


if __name__ == "__main__":
    main()
