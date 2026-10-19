#!/usr/bin/env python3
"""
Retopo-lite: sprite alpha silhouette → extruded mesh + baked UV → GLB.
Run from repo root: python3 scripts/mesh-pipeline/sprite_to_glb.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
import trimesh
from shapely.geometry import Polygon
from skimage import measure

ROOT = Path(__file__).resolve().parents[2]
SPRITES = ROOT / "public/game/sprites/mobs"
OUT = ROOT / "public/game/models/mobs"
MANIFEST = ROOT / "reference/models.manifest.json"

# Extrusion depth in mesh units (scaled to ~0.58 world width in Three.js)
EXTRUDE_DEPTH = 0.12
SIMPLIFY = 1.8
ALPHA_THRESHOLD = 48


def _rdp(points: np.ndarray, eps: float) -> np.ndarray:
    if len(points) < 3:
        return points
    start, end = points[0], points[-1]
    seg = end - start
    seg_len = np.linalg.norm(seg)
    if seg_len < 1e-9:
        dists = np.linalg.norm(points - start, axis=1)
    else:
        v = points - start
        dists = np.abs(v[:, 0] * seg[1] - v[:, 1] * seg[0]) / seg_len
    idx = int(np.argmax(dists))
    if dists[idx] <= eps:
        return np.vstack([start, end])
    left = _rdp(points[: idx + 1], eps)
    right = _rdp(points[idx:], eps)
    return np.vstack([left[:-1], right])


def _silhouette_mask(arr: np.ndarray) -> np.ndarray:
    alpha = arr[:, :, 3]
    if alpha.max() >= ALPHA_THRESHOLD:
        return alpha >= ALPHA_THRESHOLD
    rgb = arr[:, :, :3].astype(np.float32)
    # Opaque SWF exports: near-white background, colored foreground.
    return np.linalg.norm(rgb - 255.0, axis=2) > 28.0


def largest_contour_paths(img: Image.Image) -> np.ndarray:
    """Return Nx2 polygon in image pixel coords (y up)."""
    rgba = img.convert("RGBA")
    arr = np.array(rgba)
    mask = _silhouette_mask(arr)
    contours = measure.find_contours(mask.astype(float), 0.5)
    if not contours:
        raise ValueError("no contour")
    best = max(contours, key=lambda c: len(c))
    # skimage: row = y down → flip to y up
    h = arr.shape[0]
    poly = np.column_stack([best[:, 1], (h - 1) - best[:, 0]])
    closed = np.vstack([poly, poly[0]])
    return _rdp(closed, SIMPLIFY)


def sprite_to_glb(sprite_path: Path, out_path: Path) -> dict:
    img = Image.open(sprite_path)
    w, h = img.size
    poly = largest_contour_paths(img)

    mesh = trimesh.creation.extrude_polygon(Polygon(poly), height=EXTRUDE_DEPTH)
    mesh.apply_translation([-w / 2, -h / 2, -EXTRUDE_DEPTH / 2])

    # Normalize to unit height ~1 for consistent Three.js scaling
    bounds = mesh.bounds
    size = bounds[1] - bounds[0]
    scale = 1.0 / max(size[1], 1e-6)
    mesh.apply_scale(scale)

    # UV: project XY after scale back to 0-1
    bounds = mesh.bounds
    verts = mesh.vertices.copy()
    uv = np.zeros((len(verts), 2), dtype=np.float64)
    sx = bounds[1][0] - bounds[0][0]
    sy = bounds[1][1] - bounds[0][1]
    uv[:, 0] = (verts[:, 0] - bounds[0][0]) / (sx if sx > 1e-6 else 1)
    uv[:, 1] = (verts[:, 1] - bounds[0][1]) / (sy if sy > 1e-6 else 1)
    uv = np.clip(uv, 0, 1)

    rgba = img.convert("RGBA")
    mesh.visual = trimesh.visual.TextureVisuals(uv=uv, image=rgba)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    mesh.export(out_path, file_type="glb")

    return {
        "source": str(sprite_path.relative_to(ROOT)),
        "glb": str(out_path.relative_to(ROOT)),
        "vertices": int(len(mesh.vertices)),
        "faces": int(len(mesh.faces)),
    }


def main() -> int:
    targets: list[tuple[str, Path]] = []
    for frame in range(5, 25):
        p = SPRITES / f"{frame}.png"
        if p.exists():
            targets.append((str(frame), p))
    for name in ("shop", "treasure"):
        p = SPRITES / f"{name}.png"
        if p.exists():
            targets.append((name, p))
    mob = ROOT / "public/game/sprites/mob.png"
    if mob.exists():
        targets.append(("default", mob))

    entries: dict[str, dict] = {}
    errors: list[str] = []
    for key, path in targets:
        out = OUT / f"{key}.glb"
        try:
            entries[key] = sprite_to_glb(path, out)
            print("OK", key, "→", out)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{key}: {exc}")
            print("FAIL", key, exc, file=sys.stderr)

    manifest = {
        "generator": "scripts/mesh-pipeline/sprite_to_glb.py",
        "extrudeDepth": EXTRUDE_DEPTH,
        "worldHeight": 0.74,
        "mobs": entries,
    }
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("Wrote", MANIFEST)
    # shop.png is often an empty SWF export; billboard fallback is fine.
    hard_fail = [e for e in errors if not e.startswith("shop:")]
    return 1 if hard_fail else 0


if __name__ == "__main__":
    raise SystemExit(main())
