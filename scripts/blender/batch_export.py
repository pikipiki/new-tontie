"""
Batch GLB export for Tontie 3D (Blender 5+).

  blender --background --python scripts/blender/batch_export.py

Writes:
  public/game/models/mobs/<key>.glb
  public/game/models/board.glb
  public/game/models/hole.glb
  public/game/models/hammer.glb
  reference/models.manifest.json
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

try:
    import bpy  # type: ignore
except ImportError:
    print("Run with Blender's Python.", file=sys.stderr)
    raise SystemExit(1)

ROOT = Path(__file__).resolve().parents[2]
SPRITES = ROOT / "public/game/sprites/mobs"
BOARD_SPRITE = ROOT / "public/game/sprites/board-gameplay-clean.png"
HAMMER_SPRITE = ROOT / "public/game/sprites/hammer/01.png"
OUT_MOBS = ROOT / "public/game/models/mobs"
OUT_MODELS = ROOT / "public/game/models"
MANIFEST = ROOT / "reference/models.manifest.json"

# Depth applied after height normalize → constant world thickness when scaled in Three.js
MOB_DEPTH = 0.32
BOARD_DEPTH_THICK = 0.36
TARGET_MOB_HEIGHT = 1.0
BOARD_WORLD = 4.2


def clear_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def fix_materials(obj: bpy.types.Object) -> None:
    for slot in obj.material_slots:
        mat = slot.material
        if mat is None:
            continue
        mat.use_nodes = True
        mat.blend_method = "CLIP"
        if hasattr(mat, "shadow_method"):
            mat.shadow_method = "CLIP"
        mat.alpha_threshold = 0.42
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf is not None:
            bsdf.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.82
            bsdf.inputs["Specular IOR Level"].default_value = 0.25


def import_sprite_plane(image_path: Path) -> bpy.types.Object:
    bpy.ops.image.import_as_mesh_planes(
        files=[{"name": image_path.name}],
        directory=str(image_path.parent) + os.sep,
        relative=False,
    )
    obj = bpy.context.active_object
    fix_materials(obj)
    return obj


def apply_solidify(obj: bpy.types.Object, thickness: float) -> None:
    mod = obj.modifiers.new(name="Solidify", type="SOLIDIFY")
    mod.thickness = thickness
    mod.offset = 0.0
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bevel = obj.modifiers.new(name="Bevel", type="BEVEL")
    bevel.width = min(thickness * 0.12, 0.04)
    bevel.segments = 2
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    bpy.ops.object.shade_smooth()
    if hasattr(obj.data, "use_auto_smooth"):
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = 0.785398


def normalize_height(obj: bpy.types.Object, target: float) -> None:
    h = obj.dimensions.y
    if h < 1e-6:
        h = max(obj.dimensions)
    scale = target / h
    obj.scale = (obj.scale.x * scale, obj.scale.y * scale, obj.scale.z * scale)
    bpy.ops.object.transform_apply(scale=True)


def center_on_ground(obj: bpy.types.Object) -> None:
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    obj.location = (0.0, 0.0, 0.0)
    bpy.ops.object.transform_apply(location=True)
    # Feet on y=0 (sprite stands on XZ in glTF Y-up after export)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    min_z = min((obj.matrix_world @ v.co).y for v in obj.data.vertices)
    obj.location.y -= min_z
    bpy.ops.object.transform_apply(location=True)


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
        export_materials="EXPORT",
        export_image_format="AUTO",
    )
    mesh = obj.data
    return {
        "glb": str(out_path.relative_to(ROOT)),
        "vertices": len(mesh.vertices),
        "faces": len(mesh.polygons),
    }


def add_side_shell(obj: bpy.types.Object, depth: float) -> None:
    """Dark back/side shell so extrusion reads as volume, not a sticker."""
    side_mat = bpy.data.materials.new("MobSide")
    side_mat.use_nodes = True
    bsdf = side_mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.18, 0.14, 0.12, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.95
    obj.data.materials.append(side_mat)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="DESELECT")
    bpy.ops.object.mode_set(mode="OBJECT")
    for poly in obj.data.polygons:
        if poly.normal.z < 0.35 and abs(poly.normal.y) < 0.85:
            poly.material_index = 1
    obj.data.update()


def stand_vertical_for_gltf(obj: bpy.types.Object) -> None:
    """Face the camera in glTF Y-up: height on Y, depth on Z."""
    obj.rotation_euler = (1.57079632679, 0.0, 0.0)
    bpy.ops.object.transform_apply(rotation=True)


def export_sprite_glb(image_path: Path, out_path: Path, depth: float, height: float) -> dict:
    clear_scene()
    obj = import_sprite_plane(image_path)
    stand_vertical_for_gltf(obj)
    normalize_height(obj, height)
    apply_solidify(obj, depth)
    add_side_shell(obj, depth)
    center_on_ground(obj)
    info = export_glb(obj, out_path)
    info["source"] = str(image_path.relative_to(ROOT))
    return info


def export_board() -> dict:
    clear_scene()
    if not BOARD_SPRITE.exists():
        raise FileNotFoundError(BOARD_SPRITE)
    obj = import_sprite_plane(BOARD_SPRITE)
    # Lay flat on ground (Y-up): default plane faces +Z in Blender → rotate to horizontal
    obj.rotation_euler = (1.57079632679, 0.0, 0.0)
    bpy.ops.object.transform_apply(rotation=True)
    w = obj.dimensions.x
    if w > 1e-6:
        s = BOARD_WORLD / w
        obj.scale = (s, s, s)
        bpy.ops.object.transform_apply(scale=True)
    apply_solidify(obj, BOARD_DEPTH_THICK)
    obj.location = (0.0, 0.0, 0.0)
    bpy.ops.object.transform_apply(location=True)
    out = OUT_MODELS / "board.glb"
    info = export_glb(obj, out)
    info["source"] = str(BOARD_SPRITE.relative_to(ROOT))
    return info


def export_hole() -> dict:
    clear_scene()
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.13,
        depth=0.22,
        location=(0.0, -0.11, 0.0),
        vertices=24,
    )
    pit = bpy.context.active_object
    pit.name = "HolePit"
    pit_mat = bpy.data.materials.new("HolePitMat")
    pit_mat.use_nodes = True
    bsdf = pit_mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.12, 0.07, 0.05, 1.0)
    bsdf.inputs["Roughness"].default_value = 1.0
    pit.data.materials.append(pit_mat)

    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.15,
        minor_radius=0.028,
        location=(0.0, 0.01, 0.0),
        major_segments=24,
        minor_segments=12,
    )
    rim = bpy.context.active_object
    rim.name = "HoleRim"
    rim_mat = bpy.data.materials.new("HoleRimMat")
    rim_mat.use_nodes = True
    bsdf_r = rim_mat.node_tree.nodes["Principled BSDF"]
    bsdf_r.inputs["Base Color"].default_value = (0.35, 0.24, 0.18, 1.0)
    bsdf_r.inputs["Roughness"].default_value = 0.92
    rim.data.materials.append(rim_mat)

    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.34,
        depth=0.04,
        location=(0.0, 0.02, 0.0),
        vertices=4,
    )
    tile = bpy.context.active_object
    tile.name = "HoleTile"
    tile_mat = bpy.data.materials.new("HoleTileMat")
    tile_mat.use_nodes = True
    bsdf_t = tile_mat.node_tree.nodes["Principled BSDF"]
    bsdf_t.inputs["Base Color"].default_value = (0.55, 0.38, 0.28, 1.0)
    bsdf_t.inputs["Roughness"].default_value = 0.88
    tile.data.materials.append(tile_mat)

    bpy.ops.object.select_all(action="DESELECT")
    for o in (pit, rim, tile):
        o.select_set(True)
    bpy.context.view_layer.objects.active = pit
    bpy.ops.object.join()
    joined = bpy.context.active_object
    joined.name = "HoleSlot"

    out = OUT_MODELS / "hole.glb"
    info = export_glb(joined, out)
    info["source"] = "procedural/blender"
    return info


def export_hammer() -> dict:
    clear_scene()
    bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.52, location=(0.0, 0.26, 0.0), vertices=16)
    handle = bpy.context.active_object
    handle_mat = bpy.data.materials.new("Handle")
    handle_mat.use_nodes = True
    handle_mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (
        0.42,
        0.24,
        0.1,
        1.0,
    )
    handle.data.materials.append(handle_mat)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.58, 0.05))
    head = bpy.context.active_object
    head.scale = (0.2, 0.11, 0.14)
    bpy.ops.object.transform_apply(scale=True)
    head_mat = bpy.data.materials.new("Head")
    head_mat.use_nodes = True
    head_mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (
        0.62,
        0.66,
        0.7,
        1.0,
    )
    head_mat.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 0.75
    head.data.materials.append(head_mat)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.58, 0.17))
    face = bpy.context.active_object
    face.scale = (0.14, 0.09, 0.22)
    bpy.ops.object.transform_apply(scale=True)
    face.data.materials.append(head_mat)

    bpy.ops.object.select_all(action="DESELECT")
    for o in (handle, head, face):
        o.select_set(True)
    bpy.context.view_layer.objects.active = handle
    bpy.ops.object.join()
    hammer = bpy.context.active_object
    hammer.name = "Hammer3D"
    normalize_height(hammer, 0.95)
    center_on_ground(hammer)
    out = OUT_MODELS / "hammer.glb"
    info = export_glb(hammer, out)
    info["source"] = "procedural/blender"
    return info


def mob_targets() -> list[tuple[str, Path]]:
    targets: list[tuple[str, Path]] = []
    for frame in range(5, 25):
        p = SPRITES / f"{frame}.png"
        if p.exists():
            targets.append((str(frame), p))
    for name in ("treasure",):
        p = SPRITES / f"{name}.png"
        if p.exists():
            targets.append((name, p))
    mob = ROOT / "public/game/sprites/mob.png"
    if mob.exists():
        targets.append(("default", mob))
    return targets


def main() -> int:
    entries: dict[str, dict] = {}
    errors: list[str] = []

    for key, path in mob_targets():
        out = OUT_MOBS / f"{key}.glb"
        try:
            entries[key] = export_sprite_glb(path, out, MOB_DEPTH, TARGET_MOB_HEIGHT)
            print("OK mob", key)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{key}: {exc}")
            print("FAIL mob", key, exc)

    props: dict[str, dict] = {}
    try:
        props["board"] = export_board()
        print("OK board")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"board: {exc}")
        print("FAIL board", exc)

    try:
        props["hole"] = export_hole()
        print("OK hole")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"hole: {exc}")
        print("FAIL hole", exc)

    try:
        props["hammer"] = export_hammer()
        print("OK hammer")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"hammer: {exc}")
        print("FAIL hammer", exc)

    manifest = {
        "generator": "scripts/blender/batch_export.py",
        "blender": bpy.app.version_string,
        "mobDepth": MOB_DEPTH,
        "worldHeight": 0.74,
        "boardWidth": BOARD_WORLD,
        "mobs": entries,
        "props": props,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("Wrote", MANIFEST)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
