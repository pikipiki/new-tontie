"""
Tontie 3D assets (Blender 5+), glTF Y-up output.

- Sprites (mobs, hammer): silhouette mesh built from opaque pixels only, cropped,
  feet at y=0, front facing +Z, extruded with a dark rim so thickness follows the outline.
- Board: modelled playfield (grass slab, 9 raised tiles, deep pits) aligned to HOLE_POS.

  npm run mesh:blender
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

try:
    import bmesh  # type: ignore
    import bpy  # type: ignore
except ImportError:
    print("Run with Blender's Python.", file=sys.stderr)
    raise SystemExit(1)

ROOT = Path(__file__).resolve().parents[2]
SPRITES = ROOT / "public/game/sprites/mobs"
HAMMER_SPRITE = ROOT / "public/game/sprites/hammer/01.png"
OUT_MOBS = ROOT / "public/game/models/mobs"
OUT_MODELS = ROOT / "public/game/models"
MANIFEST = ROOT / "reference/models.manifest.json"

ALPHA_CUTOFF = 0.6
GRID_CELLS = 72
# Shared sprite scale so relative sizes match the SWF (a ~100 px Tontie ≈ 0.75 world).
SPRITE_WORLD_PER_PX = 0.0075
MOB_DEPTH = 0.2
HAMMER_DEPTH = 0.16

# Must match src/game/layout.ts + src/game3d/layout3d.ts
GAME_PX = 400.0
BOARD_WORLD = 4.2
PX = BOARD_WORLD / GAME_PX
HOLE_POS = {
    7: (58, 98), 8: (164, 98), 9: (270, 98),
    4: (58, 178), 5: (164, 178), 6: (270, 178),
    1: (58, 258), 2: (164, 258), 3: (270, 258),
}
HOLE_RADIUS = 0.3
PIT_DEPTH = 1.1
SLAB_THICK = 1.3
TILE_W = 1.0
TILE_D = 0.78
TILE_H = 0.08


def clear_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def principled(name: str, rgb: tuple[float, float, float], roughness: float = 0.85) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def sprite_material(image: bpy.types.Image) -> bpy.types.Material:
    mat = bpy.data.materials.new(image.name)
    mat.use_nodes = True
    mat.blend_method = "CLIP"
    mat.alpha_threshold = ALPHA_CUTOFF
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.75
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = image
    tex.interpolation = "Closest"
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
    return mat


def world_xz(px: float, py: float) -> tuple[float, float]:
    return (px - GAME_PX / 2) * PX, (py - GAME_PX / 2) * PX


def hole_center(hole: int) -> tuple[float, float]:
    x, y = HOLE_POS[hole]
    return world_xz(x + 36, y + 36)


def opaque_cells(image: bpy.types.Image) -> tuple[set[tuple[int, int]], int, tuple[int, int, int, int]]:
    """Return opaque grid cells (cx, cy from bottom), cell size in px, and px bbox (x0, y0, x1, y1)."""
    w, h = image.size
    px = list(image.pixels[:])

    def alpha(x: int, y: int) -> float:
        return px[(y * w + x) * 4 + 3]

    xs: list[int] = []
    ys: list[int] = []
    for y in range(h):
        for x in range(w):
            if alpha(x, y) >= ALPHA_CUTOFF:
                xs.append(x)
                ys.append(y)
    if not xs:
        raise ValueError(f"{image.name}: no opaque pixels")
    x0, x1, y0, y1 = min(xs), max(xs) + 1, min(ys), max(ys) + 1
    cell = max(1, math.ceil(max(x1 - x0, y1 - y0) / GRID_CELLS))

    cells: set[tuple[int, int]] = set()
    for cy in range(0, math.ceil((y1 - y0) / cell)):
        for cx in range(0, math.ceil((x1 - x0) / cell)):
            hit = 0
            total = 0
            for yy in range(y0 + cy * cell, min(y1, y0 + (cy + 1) * cell)):
                for xx in range(x0 + cx * cell, min(x1, x0 + (cx + 1) * cell)):
                    total += 1
                    if alpha(xx, yy) >= ALPHA_CUTOFF:
                        hit += 1
            if total and hit * 2 >= total:
                cells.add((cx, cy))
    return cells, cell, (x0, y0, x1, y1)


def silhouette_object(image_path: Path, depth: float) -> bpy.types.Object:
    image = bpy.data.images.load(str(image_path), check_existing=False)
    image.alpha_mode = "STRAIGHT"
    w, h = image.size
    cells, cell, (x0, y0, x1, y1) = opaque_cells(image)

    scale = SPRITE_WORLD_PER_PX
    cx_mid = (x0 + x1) / 2

    bm = bmesh.new()
    uv_layer = bm.loops.layers.uv.new("UVMap")
    verts: dict[tuple[int, int], bmesh.types.BMVert] = {}

    def vert(gx: int, gy: int) -> bmesh.types.BMVert:
        key = (gx, gy)
        v = verts.get(key)
        if v is None:
            pxx = min(x1, x0 + gx * cell)
            pxy = min(y1, y0 + gy * cell)
            # Blender Z-up: X right, Z up, front faces -Y (becomes +Z in glTF).
            v = bm.verts.new(((pxx - cx_mid) * scale, 0.0, (pxy - y0) * scale))
            verts[key] = v
        return v

    for (cx, cy) in cells:
        quad = [vert(cx, cy), vert(cx + 1, cy), vert(cx + 1, cy + 1), vert(cx, cy + 1)]
        face = bm.faces.new(quad)
        for loop, (gx, gy) in zip(face.loops, ((cx, cy), (cx + 1, cy), (cx + 1, cy + 1), (cx, cy + 1))):
            u = min(x1, x0 + gx * cell) / w
            v = min(y1, y0 + gy * cell) / h
            loop[uv_layer].uv = (u, v)

    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    mesh = bpy.data.meshes.new(image_path.stem)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(image_path.stem, mesh)
    bpy.context.collection.objects.link(obj)
    mesh.materials.append(sprite_material(image))
    mesh.materials.append(principled("Rim", (0.12, 0.08, 0.06), 0.9))

    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    mod = obj.modifiers.new("Solidify", "SOLIDIFY")
    mod.thickness = depth
    mod.offset = 0.0
    mod.use_rim = True
    mod.material_offset_rim = 1
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj


def export_glb(obj: bpy.types.Object, out_path: Path) -> dict:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=str(out_path),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
    )
    dims = obj.dimensions
    return {
        "glb": str(out_path.relative_to(ROOT)),
        "vertices": len(obj.data.vertices),
        "faces": len(obj.data.polygons),
        "size": [round(dims.x, 3), round(dims.z, 3), round(dims.y, 3)],
    }


def export_sprite_glb(image_path: Path, out_path: Path, depth: float) -> dict:
    clear_scene()
    obj = silhouette_object(image_path, depth)
    info = export_glb(obj, out_path)
    info["source"] = str(image_path.relative_to(ROOT))
    return info


def boolean(target: bpy.types.Object, cutter: bpy.types.Object, op: str) -> None:
    mod = target.modifiers.new(f"{op}_{cutter.name}", "BOOLEAN")
    mod.operation = op
    mod.solver = "EXACT"
    if hasattr(mod, "material_mode"):
        mod.material_mode = "TRANSFER"
    mod.object = cutter
    bpy.context.view_layer.objects.active = target
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter, do_unlink=True)


def join(objs: list[bpy.types.Object]) -> bpy.types.Object:
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    return bpy.context.active_object


def add_box(name: str, size: tuple[float, float, float], loc: tuple[float, float, float], mat) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    obj.data.materials.append(mat)
    return obj


def export_board() -> dict:
    """Blender Z-up: X right, -Y = screen up (glTF -Z), Z up. Tile top at Z = 0."""
    clear_scene()
    grass = principled("Grass", (0.42, 0.72, 0.12))
    tile = principled("Tile", (0.62, 0.86, 0.26), 0.7)
    pit = principled("Pit", (0.07, 0.05, 0.04), 1.0)
    rim = principled("Rim", (0.28, 0.2, 0.12), 0.8)

    slab = add_box("Board", (BOARD_WORLD, BOARD_WORLD, SLAB_THICK), (0, 0, -TILE_H - SLAB_THICK / 2), grass)

    tiles = [
        add_box(f"Tile{hole}", (TILE_W, TILE_D, TILE_H), (hole_center(hole)[0], -hole_center(hole)[1], -TILE_H / 2), tile)
        for hole in HOLE_POS
    ]
    boolean(slab, join(tiles), "UNION")

    cutters = []
    for hole in HOLE_POS:
        x, z = hole_center(hole)
        bpy.ops.mesh.primitive_cylinder_add(
            radius=HOLE_RADIUS, depth=PIT_DEPTH + 0.3, location=(x, -z, 0.15 - (PIT_DEPTH + 0.3) / 2), vertices=40
        )
        cutter = bpy.context.active_object
        cutter.data.materials.append(pit)
        cutters.append(cutter)
    boolean(slab, join(cutters), "DIFFERENCE")

    rings = []
    for hole in HOLE_POS:
        x, z = hole_center(hole)
        bpy.ops.mesh.primitive_torus_add(
            major_radius=HOLE_RADIUS + 0.025, minor_radius=0.03, location=(x, -z, 0.0), major_segments=40
        )
        ring = bpy.context.active_object
        ring.data.materials.append(rim)
        rings.append(ring)
    boolean(slab, join(rings), "UNION")

    pit_slots = {i for i, m in enumerate(slab.data.materials) if m and m.name.startswith("Pit")}
    pit_centers = [p.center for p in slab.data.polygons if p.material_index in pit_slots]
    for hole in HOLE_POS:
        x, z = hole_center(hole)
        near = sum(1 for c in pit_centers if (c.x - x) ** 2 + (c.y + z) ** 2 < (HOLE_RADIUS + 0.01) ** 2)
        if near < 40:
            raise RuntimeError(f"hole {hole} not cut ({near} pit faces)")

    bpy.context.view_layer.objects.active = slab
    for poly in slab.data.polygons:
        poly.use_smooth = False
    out = OUT_MODELS / "board.glb"
    info = export_glb(slab, out)
    info["source"] = "procedural/blender (HOLE_POS)"
    info["holeRadius"] = HOLE_RADIUS
    info["pitDepth"] = PIT_DEPTH
    return info


def mob_targets() -> list[tuple[str, Path]]:
    targets: list[tuple[str, Path]] = []
    for frame in range(5, 25):
        p = SPRITES / f"{frame}.png"
        if p.exists():
            targets.append((str(frame), p))
    treasure = SPRITES / "treasure.png"
    if treasure.exists() and treasure.stat().st_size > 400:
        targets.append(("treasure", treasure))
    mob = ROOT / "public/game/sprites/mob.png"
    if mob.exists():
        targets.append(("default", mob))
        targets.append(("shop", mob))
    return targets


def main() -> int:
    entries: dict[str, dict] = {}
    errors: list[str] = []

    for key, path in mob_targets():
        try:
            entries[key] = export_sprite_glb(path, OUT_MOBS / f"{key}.glb", MOB_DEPTH)
            print("OK mob", key, entries[key]["size"])
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{key}: {exc}")
            print("FAIL mob", key, exc)

    props: dict[str, dict] = {}
    try:
        props["hammer"] = export_sprite_glb(HAMMER_SPRITE, OUT_MODELS / "hammer.glb", HAMMER_DEPTH)
        print("OK hammer")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"hammer: {exc}")
        print("FAIL hammer", exc)
    try:
        props["board"] = export_board()
        print("OK board")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"board: {exc}")
        print("FAIL board", exc)

    manifest = {
        "generator": "scripts/blender/batch_export.py",
        "blender": bpy.app.version_string,
        "mobDepth": MOB_DEPTH,
        "worldPerPx": SPRITE_WORLD_PER_PX,
        "boardWidth": BOARD_WORLD,
        "holeRadius": HOLE_RADIUS,
        "pitDepth": PIT_DEPTH,
        "mobs": entries,
        "props": props,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("Wrote", MANIFEST)
    for e in errors:
        print("ERROR", e)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
