"""
Tontie 3D assets (Blender 5+), glTF Y-up output.

Every mob, prop and the hammer is modelled in the round from primitives (voxel-remeshed and
smoothed into one organic body), UV cube-projected and textured with generated tileable maps
(plush, rock, brushed metal, wood, grass) plus matching normal maps. Shapes and colours follow
the SWF idle sprites (DefineSprite children of 458, see scripts/export-game-assets.mjs).

Conventions: feet at y = 0, front faces +Z (Blender -Y), eye groups are empties named EyeRig*
(scaled on Y at runtime to blink), hammer pivot = grip at the origin with the head at -X.

  npm run mesh:blender
"""
from __future__ import annotations

import json
import math
import random
import sys
from pathlib import Path

try:
    import bmesh  # type: ignore
    import bpy  # type: ignore
    from mathutils import Vector  # type: ignore
except ImportError:
    print("Run with Blender's Python.", file=sys.stderr)
    raise SystemExit(1)

ROOT = Path(__file__).resolve().parents[2]
OUT_MOBS = ROOT / "public/game/models/mobs"
OUT_MODELS = ROOT / "public/game/models"
MANIFEST = ROOT / "reference/models.manifest.json"

TEX_SIZE = 256

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

# --------------------------------------------------------------------------- textures


def _value_noise(size: int, cells: int, seed: int) -> list[float]:
    rnd = random.Random(seed)
    grid = [[rnd.random() for _ in range(cells)] for _ in range(cells)]
    out = [0.0] * (size * size)
    step = cells / size
    for y in range(size):
        fy = y * step
        y0 = int(fy)
        ty = fy - y0
        ty = ty * ty * (3 - 2 * ty)
        r0 = grid[y0 % cells]
        r1 = grid[(y0 + 1) % cells]
        base = y * size
        for x in range(size):
            fx = x * step
            x0 = int(fx)
            tx = fx - x0
            tx = tx * tx * (3 - 2 * tx)
            x1 = (x0 + 1) % cells
            x0 %= cells
            a = r0[x0] + (r0[x1] - r0[x0]) * tx
            b = r1[x0] + (r1[x1] - r1[x0]) * tx
            out[base + x] = a + (b - a) * ty
    return out


def _mix(*layers: tuple[float, list[float]]) -> list[float]:
    n = len(layers[0][1])
    out = [0.0] * n
    for w, layer in layers:
        for i in range(n):
            out[i] += w * layer[i]
    return out


_HEIGHTS: dict[str, list[float]] = {}


def height_pattern(kind: str) -> list[float]:
    """Tileable grayscale height in [0, 1] (cached across scenes)."""
    if kind in _HEIGHTS:
        return _HEIGHTS[kind]
    s = TEX_SIZE
    if kind == "plush":
        h = _mix((0.35, _value_noise(s, 16, 1)), (0.3, _value_noise(s, 42, 2)), (0.2, _value_noise(s, 128, 3)), (0.15, _value_noise(s, 256, 16)))
    elif kind == "rock":
        big = _value_noise(s, 6, 4)
        crack = _value_noise(s, 10, 5)
        h = _mix((0.6, big), (0.3, _value_noise(s, 24, 6)), (0.1, _value_noise(s, 96, 7)))
        h = [v * (0.55 if abs(c - 0.5) < 0.025 else 1.0) for v, c in zip(h, crack)]
    elif kind == "metal":
        rnd = random.Random(8)
        rows = [rnd.random() for _ in range(s)]
        fine = _value_noise(s, 64, 9)
        h = [0.65 * rows[i // s] + 0.35 * fine[i] for i in range(s * s)]
    elif kind == "wood":
        warp = _value_noise(s, 8, 10)
        h = [0.5 + 0.5 * math.sin(((i % s) / s * 7 + warp[i] * 2.2) * math.tau) for i in range(s * s)]
    elif kind == "grass":
        h = _mix((0.35, _value_noise(s, 8, 11)), (0.4, _value_noise(s, 48, 12)), (0.25, _value_noise(s, 128, 13)))
    elif kind == "tile":
        h = _mix((0.7, _value_noise(s, 8, 14)), (0.3, _value_noise(s, 64, 15)))
    else:
        raise ValueError(kind)
    lo, hi = min(h), max(h)
    h = [(v - lo) / (hi - lo or 1) for v in h]
    _HEIGHTS[kind] = h
    return h


# How strongly the height darkens the albedo, and the normal-map bump per pattern.
PATTERN_CONTRAST = {"plush": 0.16, "rock": 0.35, "metal": 0.12, "wood": 0.22, "grass": 0.3, "tile": 0.1}
PATTERN_BUMP = {"plush": 2.5, "rock": 5.0, "metal": 1.0, "wood": 1.5, "grass": 3.0, "tile": 1.2}


def hex_rgb(h: str) -> tuple[float, float, float]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))  # type: ignore[return-value]


def srgb_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _new_image(name: str, pixels: list[float], non_color: bool) -> bpy.types.Image:
    img = bpy.data.images.new(name, TEX_SIZE, TEX_SIZE, alpha=False)
    if non_color:
        img.colorspace_settings.name = "Non-Color"
    img.pixels.foreach_set(pixels)
    img.pack()
    return img


def color_image(name: str, color: str, kind: str, color2: str | None = None) -> bpy.types.Image:
    h = height_pattern(kind)
    a = hex_rgb(color)
    b = hex_rgb(color2) if color2 else None
    k = PATTERN_CONTRAST[kind]
    px: list[float] = []
    for v in h:
        shade = 1 - k + k * v
        if b is not None:
            px.extend(((a[0] + (b[0] - a[0]) * v) * shade, (a[1] + (b[1] - a[1]) * v) * shade, (a[2] + (b[2] - a[2]) * v) * shade, 1.0))
        else:
            px.extend((a[0] * shade, a[1] * shade, a[2] * shade, 1.0))
    return _new_image(f"{name}_albedo", px, non_color=False)


def normal_image(kind: str) -> bpy.types.Image:
    existing = bpy.data.images.get(f"N_{kind}")
    if existing:
        return existing
    h = height_pattern(kind)
    s = TEX_SIZE
    bump = PATTERN_BUMP[kind]
    px: list[float] = []
    for y in range(s):
        for x in range(s):
            dx = (h[y * s + (x + 1) % s] - h[y * s + (x - 1) % s]) * bump
            dy = (h[((y + 1) % s) * s + x] - h[((y - 1) % s) * s + x]) * bump
            nx, ny, nz = -dx, -dy, 1.0
            ln = math.sqrt(nx * nx + ny * ny + nz * nz)
            px.extend((nx / ln * 0.5 + 0.5, ny / ln * 0.5 + 0.5, nz / ln * 0.5 + 0.5, 1.0))
    return _new_image(f"N_{kind}", px, non_color=True)


# --------------------------------------------------------------------------- materials

_MATS: dict[str, bpy.types.Material] = {}


def material(
    name: str,
    color: str,
    pattern: str | None = None,
    rough: float = 0.85,
    metal: float = 0.0,
    emit: float = 0.0,
    bump: float = 0.6,
    color2: str | None = None,
    sheen: float = 0.0,
) -> bpy.types.Material:
    key = f"{name}|{color}|{pattern}|{color2}|{sheen}"
    if key in _MATS:
        return _MATS[key]
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    rgb = hex_rgb(color)
    if pattern:
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = color_image(name, color, pattern, color2)
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
        if bump > 0:
            ntex = nt.nodes.new("ShaderNodeTexImage")
            ntex.image = normal_image(pattern)
            nmap = nt.nodes.new("ShaderNodeNormalMap")
            nmap.inputs["Strength"].default_value = bump
            nt.links.new(ntex.outputs["Color"], nmap.inputs["Color"])
            nt.links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
    else:
        bsdf.inputs["Base Color"].default_value = (*(srgb_to_linear(c) for c in rgb), 1.0)
    if emit > 0:
        bsdf.inputs["Emission Color"].default_value = (*(srgb_to_linear(c) for c in rgb), 1.0)
        bsdf.inputs["Emission Strength"].default_value = emit
    if sheen > 0:
        # Velvet rim light of the plush fabric (exported as KHR_materials_sheen).
        bsdf.inputs["Sheen Weight"].default_value = sheen
        bsdf.inputs["Sheen Roughness"].default_value = 0.35
        bsdf.inputs["Sheen Tint"].default_value = (*(min(1.0, srgb_to_linear(c) * 1.6 + 0.25) for c in rgb), 1.0)
    _MATS[key] = mat
    return mat


# --------------------------------------------------------------------------- primitives


def clear_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _MATS.clear()


def _active() -> bpy.types.Object:
    return bpy.context.view_layer.objects.active


def _apply_scale(obj: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)


def sphere(loc, radii, segs: int = 32, rings: int = 16, rot=(0, 0, 0)) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, radius=1.0, location=loc, rotation=rot)
    o = _active()
    o.scale = radii if isinstance(radii, tuple) else (radii, radii, radii)
    _apply_scale(o)
    return o


def cone(loc, r1: float, r2: float, depth: float, rot=(0, 0, 0), verts: int = 24) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    o = _active()
    _apply_scale(o)
    return o


def cylinder(loc, r: float, depth: float, rot=(0, 0, 0), verts: int = 32) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = _active()
    _apply_scale(o)
    return o


def torus(loc, major: float, minor: float, rot=(0, 0, 0), seg: int = 32, minor_seg: int = 8) -> bpy.types.Object:
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major, minor_radius=minor, location=loc, rotation=rot, major_segments=seg, minor_segments=minor_seg
    )
    o = _active()
    _apply_scale(o)
    return o


def box(loc, size, rot=(0, 0, 0), bevel: float = 0.0) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    o = _active()
    o.scale = size
    _apply_scale(o)
    if bevel > 0:
        mod = o.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return o


def capsule(p0, p1, r: float, verts: int = 12) -> list[bpy.types.Object]:
    a, b = Vector(p0), Vector(p1)
    d = b - a
    rot = d.to_track_quat("Z", "Y").to_euler()
    body = cylinder(tuple((a + b) / 2), r, d.length, rot=tuple(rot), verts=verts)
    return [body, sphere(tuple(a), r, verts, verts // 2), sphere(tuple(b), r, verts, verts // 2)]


def join(objs: list[bpy.types.Object], name: str) -> bpy.types.Object:
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1:
        bpy.ops.object.join()
    o = _active()
    o.name = name
    return o


def _apply_mod(obj: bpy.types.Object, mod) -> None:
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)


def shade_smooth(obj: bpy.types.Object) -> None:
    n = len(obj.data.polygons)
    obj.data.polygons.foreach_set("use_smooth", [True] * n)


def cube_uv(obj: bpy.types.Object, cube_size: float) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.cube_project(cube_size=cube_size, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode="OBJECT")


def blob(
    parts: list[bpy.types.Object],
    name: str,
    mat: bpy.types.Material,
    voxel: float = 0.011,
    smooth: int = 8,
    rocky: float = 0.0,
    uv_size: float = 0.5,
    decimate: float = 0.25,
) -> bpy.types.Object:
    """Union of primitives → voxel remesh → (rock displace) → smooth → cube UV → material."""
    obj = join(parts, name)
    rem = obj.modifiers.new("Remesh", "REMESH")
    rem.mode = "VOXEL"
    rem.voxel_size = voxel
    _apply_mod(obj, rem)
    if rocky > 0:
        tex = bpy.data.textures.new(f"{name}_rock", "CLOUDS")
        tex.noise_scale = 0.09
        tex.noise_depth = 2
        disp = obj.modifiers.new("Displace", "DISPLACE")
        disp.texture = tex
        disp.strength = rocky
        disp.mid_level = 0.5
        _apply_mod(obj, disp)
    sm = obj.modifiers.new("Smooth", "SMOOTH")
    sm.factor = 0.9
    sm.iterations = smooth
    _apply_mod(obj, sm)
    dec = obj.modifiers.new("Decimate", "DECIMATE")
    dec.ratio = decimate
    _apply_mod(obj, dec)
    shade_smooth(obj)
    cube_uv(obj, uv_size)
    obj.data.materials.append(mat)
    return obj


def solid(obj: bpy.types.Object, name: str, mat: bpy.types.Material, uv_size: float | None = 0.5, smooth=True) -> bpy.types.Object:
    obj.name = name
    if smooth:
        shade_smooth(obj)
    if uv_size:
        cube_uv(obj, uv_size)
    obj.data.materials.append(mat)
    return obj


def empty(name: str, loc=(0, 0, 0)) -> bpy.types.Object:
    e = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(e)
    e.location = loc
    return e


def group(name: str, objs: list[bpy.types.Object], loc=(0, 0, 0), scale: float = 1.0, rot=(0, 0, 0)) -> bpy.types.Object:
    g = empty(name)
    for o in objs:
        o.parent = g
    g.location = loc
    g.scale = (scale, scale, scale)
    g.rotation_euler = rot
    return g


# --------------------------------------------------------------------------- parts
# Blender frame: X right, -Y = front (glTF +Z, towards the camera), Z up.


def eye(center, r: float, iris: str, rig_name: str = "EyeRig") -> bpy.types.Object:
    """Big cyclops eye (sprite: white dome with black outline, large iris, pupil, highlight)."""
    cx, cy, cz = center
    depth = 0.6
    sclera = solid(sphere((0, 0, 0), (r, r * depth, r), 48, 24), "Sclera", material("Sclera", "#fbfbf7", rough=0.25), None)
    outline = solid(
        torus((0, -r * 0.05, 0), r * 0.98, r * 0.07, rot=(math.pi / 2, 0, 0), seg=48),
        "EyeLine",
        material("EyeLine", "#14121c", rough=0.4),
        None,
    )
    # Iris / pupil / spec sit on the dome front (y = -r * depth), slightly proud of it.
    iris_o = solid(
        sphere((0, -r * depth * 0.86, 0), (r * 0.6, r * 0.16, r * 0.6), 40, 16),
        "Iris",
        material(f"Iris{iris}", iris, rough=0.2),
        None,
    )
    pupil = solid(
        sphere((0, -r * depth * 0.98, 0), (r * 0.3, r * 0.07, r * 0.3), 32, 12),
        "Pupil",
        material("Pupil", "#0b0b14", rough=0.15),
        None,
    )
    spec = solid(
        sphere((-r * 0.2, -r * depth * 1.02, r * 0.22), (r * 0.13, r * 0.05, r * 0.13), 16, 8),
        "Spec",
        material("Spec", "#ffffff", rough=0.1, emit=1.5),
        None,
    )
    rig = empty(rig_name, (cx, cy, cz))
    for o in (sclera, outline, iris_o, pupil, spec):
        o.parent = rig
    return rig


def horn(loc, color: str, r: float = 0.04, h: float = 0.12, rot=(0, 0, 0)) -> bpy.types.Object:
    return solid(cone(loc, r, 0.0, h, rot=rot), "Horn", material(f"Horn{color}", color, "plush", rough=0.55, bump=0.3), 0.3)


def tontie(
    body: str,
    dark: str,
    iris: str = "#1d2a9c",
    horn_color: str | None = "#f8f898",
    devil: bool = False,
    visor: bool = False,
    tail: bool = False,
    wings: bool = False,
    rocky: bool = False,
) -> list[bpy.types.Object]:
    """The hooded cyclops (DefineSprite_81 & co.): hood-head, belly, stubby arms and legs."""
    pattern = "rock" if rocky else "plush"
    w = 1.3 if rocky else 1.0
    parts = [
        sphere((0, 0, 0.49), (0.185 * w, 0.165 * w, 0.18 * w)),
        sphere((0, 0, 0.29), (0.125 * w, 0.11 * w, 0.15 * w)),
        *capsule((0.068 * w, 0, 0.2), (0.075 * w, 0, 0.06), 0.052 * w),
        *capsule((-0.068 * w, 0, 0.2), (-0.075 * w, 0, 0.06), 0.052 * w),
        sphere((0.08 * w, -0.025, 0.035), (0.062 * w, 0.08 * w, 0.04)),
        sphere((-0.08 * w, -0.025, 0.035), (0.062 * w, 0.08 * w, 0.04)),
        *capsule((0.115 * w, 0, 0.37), (0.21 * w, -0.015, 0.21), 0.042 * w),
        *capsule((-0.115 * w, 0, 0.37), (-0.21 * w, -0.015, 0.21), 0.042 * w),
    ]
    if rocky:
        parts += [sphere((0.17, 0.02, 0.55), 0.1), sphere((-0.15, 0.03, 0.36), 0.11), sphere((0.12, 0.05, 0.25), 0.09)]
    out = [
        blob(
            parts,
            "Body",
            material(f"Body{body}", body, pattern, rough=0.9, color2=dark if rocky else None),
            rocky=0.035 if rocky else 0.0,
            smooth=4 if rocky else 8,
        )
    ]
    # Hood opening: the eye fills it and stands proud of the (smoothed) head surface.
    face_y = -0.15 * w
    eye_r = 0.135 * (1.1 if rocky else 1.0)
    eye_z = 0.5
    out.append(
        solid(
            torus((0, face_y - 0.005, eye_z), eye_r + 0.022, 0.03, rot=(math.pi / 2, 0, 0), seg=48),
            "Hood",
            material(f"Hood{dark}", dark, pattern, rough=0.85),
            0.3,
        )
    )
    if visor:
        out.append(solid(sphere((0, face_y, eye_z), (eye_r, 0.06, eye_r)), "Visor", material(f"Visor{dark}", dark, "plush"), 0.3))
    else:
        out.append(eye((0, face_y + 0.02, eye_z), eye_r, iris))
    if horn_color:
        out.append(horn((0, 0, 0.69 if not rocky else 0.74), horn_color, 0.045, 0.13))
    if devil:
        for side in (1, -1):
            out.append(horn((side * 0.14, 0, 0.62), "#d01010", 0.04, 0.14, rot=(0, side * 0.6, 0)))
    if tail:
        out.append(solid(sphere((0, 0.14, 0.16), 0.075), "Tail", material("Tail", "#f2f2f2", "plush"), 0.3))
    if wings:
        for side in (1, -1):
            out.append(bat_wing(side))
    return out


def bat_wing(side: int) -> bpy.types.Object:
    pts = [(0, 0), (0.1, 0.12), (0.24, 0.16), (0.3, 0.06), (0.24, 0.0), (0.2, -0.06), (0.13, -0.02), (0.08, -0.08), (0.03, -0.04)]
    bm = bmesh.new()
    verts = [bm.verts.new((side * (0.12 + x), 0.05, 0.42 + y)) for x, y in pts]
    bm.faces.new(verts if side > 0 else list(reversed(verts)))
    mesh = bpy.data.meshes.new("Wing")
    bm.to_mesh(mesh)
    bm.free()
    o = bpy.data.objects.new("Wing", mesh)
    bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    sol = o.modifiers.new("Solidify", "SOLIDIFY")
    sol.thickness = 0.018
    sol.offset = 0
    _apply_mod(o, sol)
    o.rotation_euler = (0, 0, side * -0.35)
    _apply_scale(o)
    return solid(o, "Wing", material("Wing", "#e01818", "plush", rough=0.7), 0.3, smooth=False)


def spike_ball(color: str, chain: bool = True) -> list[bpy.types.Object]:
    r = 0.17
    out = [solid(sphere((0, 0, r), r, 40, 20), "Ball", material(f"Ball{color}", color, "plush", rough=0.6), 0.4)]
    spikes = []
    n = 14
    for i in range(n):
        y = 1 - 2 * (i + 0.5) / n
        rad = math.sqrt(1 - y * y)
        th = i * math.pi * (3 - math.sqrt(5))
        d = Vector((math.cos(th) * rad, math.sin(th) * rad, y))
        tip = Vector((0, 0, r)) + d * (r + 0.035)
        spikes.append(cone(tuple(tip), 0.035, 0.0, 0.08, rot=tuple(d.to_track_quat("Z", "Y").to_euler()), verts=16))
    out.append(solid(join(spikes, "Spikes"), "Spikes", material("Spike", "#e8e8e8", "metal", rough=0.35, metal=0.4), 0.3))
    if chain:
        links = []
        for i in range(4):
            x = r + 0.02 + i * 0.065
            links.append(torus((x, 0, max(0.03, r - i * 0.045)), 0.035, 0.011, rot=(math.pi / 2 if i % 2 else 0, 0, 0.0), seg=24))
        out.append(solid(join(links, "Chain"), "Chain", material("Chain", "#bfc4c9", "metal", rough=0.3, metal=0.9), 0.3))
    return out


def slime(body: str, dark: str, radius: float, face: str | None, horn_color: str | None) -> list[bpy.types.Object]:
    """Dome slime (frames 8 / 16): open-bottom dome, darker ridged skirt, lighter face window."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=radius, location=(0, 0, 0))
    dome = _active()
    bm = bmesh.new()
    bm.from_mesh(dome.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-4], context="VERTS")
    for v in bm.verts:
        k = 1 - v.co.z / radius
        flare = 1 + 0.12 * k**3
        v.co.x *= flare
        v.co.y *= flare
        v.co.z *= 0.88
    bm.to_mesh(dome.data)
    bm.free()
    out = [solid(dome, "Dome", material(f"Slime{body}", body, "plush", rough=0.35, bump=0.25), 0.5)]
    bumps = []
    for i in range(16):
        a = i / 16 * math.tau
        bumps.append(sphere((math.cos(a) * radius * 1.06, math.sin(a) * radius * 1.06, 0.03), (0.05, 0.05, 0.035), 16, 8))
    out.append(solid(join(bumps, "Skirt"), "Skirt", material(f"Skirt{dark}", dark, "plush", rough=0.4), 0.3))
    if face:
        out.append(
            solid(
                sphere((0, -radius * 0.9, radius * 0.38), (radius * 0.62, radius * 0.22, radius * 0.38)),
                "Face",
                material(f"Face{face}", face, "plush", rough=0.3, bump=0.2),
                0.3,
            )
        )
    if horn_color:
        out.append(horn((0, 0, radius * 0.88 + radius * 0.16), horn_color, radius * 0.16, radius * 0.4))
    return out


def bomb(color: str, dark: str) -> list[bpy.types.Object]:
    r = 0.15
    out = [solid(sphere((0, 0, r), r, 40, 20), "Bomb", material(f"Bomb{color}", color, "plush", rough=0.22, bump=0.15, color2=dark), 0.4)]
    out.append(solid(cylinder((0, 0, 2 * r - 0.005), 0.05, 0.045), "Cap", material("Cap", "#4a4a52", "metal", rough=0.35, metal=0.7), 0.2))
    bpy.ops.curve.primitive_bezier_curve_add(location=(0, 0, 0))
    curve = _active()
    sp = curve.data.splines[0]
    pts = [(0.0, 0.0, 2 * r + 0.01), (0.06, 0.0, 2 * r + 0.08)]
    for bp, co in zip(sp.bezier_points, pts):
        bp.co = co
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    curve.data.bevel_depth = 0.012
    curve.data.bevel_resolution = 3
    bpy.ops.object.convert(target="MESH")
    fuse = _active()
    out.append(solid(fuse, "Fuse", material("Fuse", "#784010", "wood", rough=0.9), 0.2))
    out.append(solid(sphere((0.065, 0, 2 * r + 0.095), 0.026, 12, 8), "Spark", material("Spark", "#ffb020", rough=0.4, emit=4.0), None))
    return out


def heart(color: str = "#e01818") -> list[bpy.types.Object]:
    parts = [
        sphere((0.055, 0, 0.17), (0.075, 0.05, 0.075)),
        sphere((-0.055, 0, 0.17), (0.075, 0.05, 0.075)),
        cone((0, 0, 0.085), 0.115, 0.0, 0.15, rot=(math.pi, 0, 0)),
    ]
    for p in parts[2:]:
        p.scale = (1, 0.45, 1)
        _apply_scale(p)
    return [blob(parts, "Heart", material(f"Heart{color}", color, "plush", rough=0.3, bump=0.2), voxel=0.008, smooth=10)]


def devil_head(body: str, dark: str) -> list[bpy.types.Object]:
    """Frame 18: tiny round devil (single eye, red horns, little feet)."""
    parts = [sphere((0, 0, 0.12), (0.12, 0.11, 0.11)), sphere((0.05, -0.02, 0.02), (0.04, 0.05, 0.025)), sphere((-0.05, -0.02, 0.02), (0.04, 0.05, 0.025))]
    out = [blob(parts, "Body", material(f"Body{body}", body, "plush"), voxel=0.008)]
    out.append(eye((0, -0.08, 0.13), 0.072, "#c00000"))
    for side in (1, -1):
        out.append(horn((side * 0.08, 0, 0.22), "#d01010", 0.03, 0.09, rot=(0, side * 0.6, 0)))
    return out


def treasure_chest() -> list[bpy.types.Object]:
    wood = material("ChestWood", "#8a5a2b", "wood", rough=0.8)
    gold = material("ChestGold", "#ffcc33", "metal", rough=0.3, metal=0.9)
    out = [solid(box((0, 0, 0.1), (0.38, 0.26, 0.2), bevel=0.012), "Chest", wood, 0.3)]
    # Full barrel: its lower half sits inside the box, the upper half is the rounded lid.
    lid = cylinder((0, 0, 0.2), 0.13, 0.38, rot=(0, math.pi / 2, 0), verts=32)
    lid.scale = (1, 1, 0.75)
    _apply_scale(lid)
    out.append(solid(lid, "Lid", wood, 0.3))
    bands = [box((x, 0, 0.16), (0.035, 0.275, 0.33), bevel=0.006) for x in (-0.13, 0.13)]
    out.append(solid(join(bands, "Bands"), "Bands", gold, 0.3))
    out.append(solid(box((0, -0.135, 0.19), (0.07, 0.03, 0.08), bevel=0.008), "Lock", gold, 0.3))
    return out


def shop_stall() -> list[bpy.types.Object]:
    wood = material("StallWood", "#a0682e", "wood", rough=0.8)
    out = [solid(box((0, 0, 0.11), (0.46, 0.26, 0.22), bevel=0.012), "Counter", wood, 0.3)]
    posts = [cylinder((x, 0.1, 0.33), 0.02, 0.44) for x in (-0.21, 0.21)]
    out.append(solid(join(posts, "Posts"), "Posts", wood, 0.3))
    for i in range(6):
        x = -0.225 + i * 0.09
        color = "#e8343a" if i % 2 == 0 else "#fafafa"
        out.append(
            solid(
                box((x + 0.045, -0.02, 0.56), (0.09, 0.32, 0.025), rot=(-0.35, 0, 0), bevel=0.004),
                f"Awning{i}",
                material(f"Awning{color}", color, "plush", rough=0.8),
                0.3,
            )
        )
    out.append(
        solid(
            cylinder((0, -0.14, 0.15), 0.07, 0.02, rot=(math.pi / 2, 0, 0)),
            "Coin",
            material("CoinGold", "#ffcc33", "metal", rough=0.3, metal=0.9),
            0.2,
        )
    )
    out.append(solid(sphere((0.12, -0.02, 0.27), (0.07, 0.07, 0.06)), "Bag", material("Bag", "#d9b56b", "plush"), 0.3))
    return out


# --------------------------------------------------------------------------- Goonk plushies
# Velvet plush family: pear body, drooping trunk nose, googly eyes, four-finger hands.


def plush_mat(name: str, color: str, dark: str) -> bpy.types.Material:
    return material(name, color, "plush", rough=0.9, bump=0.32, color2=dark, sheen=1.0)


def googly(
    center,
    r: float,
    look=(0.0, -0.25),
    rig: str = "EyeRig",
    turn: float = 0.0,
    sclera_scale: float = 1.0,
    pupil: float = 0.46,
) -> bpy.types.Object:
    """Toy googly eye: white oval dome, black pupil resting low, glossy highlight."""
    sr = r * sclera_scale
    sclera = solid(sphere((0, 0, 0), (sr, sr * 0.5, sr * 1.18), 24, 12), "Sclera", material("GooglyWhite", "#fbfbf6", rough=0.18), None)
    lx, lz = look[0] * sr * 0.55, look[1] * sr * 0.6
    k = max(0.0, 1 - (lx / sr) ** 2 - (lz / (sr * 1.18)) ** 2)
    front = -sr * 0.5 * math.sqrt(k)
    pr = sr * pupil
    pupil_o = solid(sphere((lx, front + pr * 0.12, lz), (pr, pr * 0.28, pr), 16, 8), "Pupil", material("GooglyBlack", "#0a0a10", rough=0.12), None)
    spec = solid(
        sphere((lx - pr * 0.35, front - pr * 0.2, lz + pr * 0.4), (pr * 0.28, pr * 0.1, pr * 0.28), 8, 4),
        "Spec",
        material("GooglySpec", "#ffffff", rough=0.05, emit=1.2),
        None,
    )
    e = empty(rig, center)
    for o in (sclera, pupil_o, spec):
        o.parent = e
    e.rotation_euler = (0, 0, turn)
    return e


def trunk_parts(base, mid, tip, r0: float, r1: float, n: int = 10) -> list[bpy.types.Object]:
    """Drooping trunk nose as a chain of spheres along a quadratic curve (merged by the body remesh)."""
    a, b, c = Vector(base), Vector(mid), Vector(tip)
    parts = []
    for i in range(n + 1):
        t = i / n
        p = a * (1 - t) ** 2 + b * 2 * (1 - t) * t + c * t * t
        r = r0 + (r1 - r0) * t
        parts.append(sphere(tuple(p), r, 20, 10))
    parts.append(sphere(tuple(c), (r1 * 1.15, r1 * 1.15, r1 * 0.95), 20, 10))
    return parts


def plush_arm(name: str, shoulder, elbow, hand, finger_dir, spread, mat, r: float = 0.042) -> bpy.types.Object:
    """Soft arm ending in a three-finger plush hand (one blob, so seams vanish)."""
    h = Vector(hand)
    d = Vector(finger_dir).normalized()
    s = Vector(spread).normalized()
    parts = [*capsule(shoulder, elbow, r), *capsule(elbow, hand, r * 0.92), sphere(hand, (r * 1.25, r * 1.05, r * 1.15), 24, 12)]
    for i in range(3):
        off = (i - 1) * r * 0.78
        base = h + s * off + d * r * 0.5
        tip = base + d * r * (1.45 - abs(i - 1) * 0.2) + s * off * 0.5
        parts += capsule(tuple(base), tuple(tip), r * 0.46)
    return blob(parts, name, mat, voxel=0.0065, smooth=3, uv_size=0.25, decimate=0.1)


def plush_body(parts: list[bpy.types.Object], mat) -> bpy.types.Object:
    return blob(parts, "Body", mat, voxel=0.0095, smooth=6, uv_size=0.35, decimate=0.1)


def pear(cz: float, w: float, d: float, h: float) -> list[bpy.types.Object]:
    """Pear-shaped plush body: head dome over a wider belly, two little feet."""
    return [
        sphere((0, 0, cz + h * 0.18), (w * 0.9, d * 0.9, h * 0.62)),
        sphere((0, 0, cz - h * 0.12), (w, d, h * 0.5)),
        sphere((w * 0.42, -d * 0.35, 0.045), (w * 0.3, d * 0.38, 0.05)),
        sphere((-w * 0.42, -d * 0.35, 0.045), (w * 0.3, d * 0.38, 0.05)),
    ]


def goonk_nose(zc: float, fwd: float = 0.0) -> list[bpy.types.Object]:
    """Violet trunk: wide at the face, leaves it horizontally, then droops into a round bulb."""
    return trunk_parts((0, -0.17 - fwd, zc), (0, -0.36 - fwd, zc), (0.0, -0.39 - fwd, zc - 0.17), 0.095, 0.045, n=14)


def goonk_cone_nose(zc: float, length: float = 0.24, droop_deg: float = 30) -> list[bpy.types.Object]:
    """Pink snout: straight thick cone pointing forward and slightly down."""
    a = math.radians(droop_deg)
    base = Vector((0, -0.17, zc))
    tip = base + Vector((0, -math.cos(a), -math.sin(a))) * length
    return trunk_parts(tuple(base), tuple((base + tip) / 2), tuple(tip), 0.1, 0.03, n=12)


def goonk_ears(z: float, x: float) -> list[bpy.types.Object]:
    return [sphere((side * x, 0.02, z), (0.07, 0.04, 0.075), rot=(0, side * 0.6, 0)) for side in (1, -1)]


def goonk_grip_arms(fur, z: float, x: float) -> list[bpy.types.Object]:
    """Long arms bent at the elbow, four-finger hands gripping the rim of the hole."""
    return [
        plush_arm(
            "Arm",
            (side * x, -0.02, z),
            (side * (x + 0.12), -0.07, z - 0.1),
            (side * (x + 0.07), -0.21, z - 0.17),
            (side * 0.1, -0.75, -0.65),
            (1, 0, 0.0),
            fur,
            r=0.036,
        )
        for side in (1, -1)
    ]


VIOLET = ("#7f52dc", "#5631b4")


def goonk_violet() -> list[bpy.types.Object]:
    """Violet Goonk plush (replaces the green Tontie, catalog frame 5)."""
    fur = plush_mat("VioletPlush", *VIOLET)
    w, d, h, cz = 0.29, 0.26, 0.54, 0.3
    parts = pear(cz, w, d, h) + goonk_ears(0.58, 0.17) + goonk_nose(0.4)
    out = [plush_body(parts, fur)]
    for side in (1, -1):
        out.append(googly((side * 0.092, -0.215, 0.5), 0.056, look=(side * 0.75, -0.3), turn=side * 0.3))
    out += goonk_grip_arms(fur, 0.34, 0.22)
    return out


BOWL_R, BOWL_H = 0.315, 0.36


def bowl_r(z: float, R: float = BOWL_R, H: float = BOWL_H) -> float:
    """Outer radius of the upside-down rice bowl at height z above the rim."""
    r0 = R * 0.46
    k = max(0.0, 1 - (z / H) ** 2)
    return r0 + (R - r0) * math.sqrt(k)


def bowl_point(rim_z: float, az: float, z: float, lift: float = 0.003) -> Vector:
    r = bowl_r(z) + lift
    return Vector((r * math.sin(az), -r * math.cos(az), rim_z + z))


def lathe(name: str, profile: list[tuple[float, float]], steps: int = 48) -> bpy.types.Object:
    """Surface of revolution around Z from (radius, z) points."""
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in profile]
    edges = [bm.edges.new((a, b)) for a, b in zip(verts, verts[1:])]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=steps, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    o = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(o)
    return o


def ceramic_bowl(rim_z: float) -> list[bpy.types.Object]:
    """Upside-down rice bowl: glazed white wall, foot ring on top, blue rim bands and diamond chain."""
    R, H = BOWL_R, BOWL_H
    n = 14
    prof = [(bowl_r(H * math.sin(i / n * math.pi / 2)), H * math.sin(i / n * math.pi / 2)) for i in range(n + 1)]
    r0 = bowl_r(H)
    prof += [(r0 - 0.002, H + 0.03), (r0 - 0.022, H + 0.03), (r0 - 0.024, H + 0.01), (0.0, H + 0.006)]
    shell = lathe("BowlShell", prof, steps=36)
    sol = shell.modifiers.new("Solidify", "SOLIDIFY")
    sol.thickness = 0.014
    sol.offset = 0
    _apply_mod(shell, sol)
    shell.location = (0, 0, rim_z)
    bpy.ops.object.select_all(action="DESELECT")
    shell.select_set(True)
    bpy.context.view_layer.objects.active = shell
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    glaze = material("Glaze", "#f7f3ea", rough=0.14)
    blue = material("BowlBlue", "#2a4fae", rough=0.22)
    out = [solid(shell, "BowlShell", glaze, None)]
    lines = []
    for z, t in ((0.006, 0.011), (0.02, 0.004), (0.092, 0.006), (H - 0.06, 0.005), (H - 0.012, 0.005)):
        lines.append(torus((0, 0, rim_z + z), bowl_r(z) + 0.008, t, seg=40, minor_seg=5))
    out.append(solid(join(lines, "BowlLines"), "BowlLines", blue, None))
    marks = []
    count = 22
    for i in range(count):
        az = i / count * math.tau
        for z, size, tag in ((0.056, 0.042, "d"), (H - 0.036, 0.02, "s")):
            p = bowl_point(rim_z, az, z, 0.009)
            m = box(tuple(p), (size, 0.005, size), rot=(0, math.pi / 4, 0))
            m.rotation_euler = (0, 0, az) if tag == "d" else (0, 0, az)
            _apply_scale(m)
            m.location = p
            marks.append(m)
        dot = sphere(tuple(bowl_point(rim_z, az + math.pi / count, 0.056, 0.006)), 0.009, 6, 4)
        marks.append(dot)
    out.append(solid(join(marks, "BowlDiamonds"), "BowlDiamonds", blue, None))
    return out


def bowl_crack(rim_z: float) -> bpy.types.Object:
    """Zigzag fracture across the front of the bowl (shown after the first hammer hit)."""
    H = BOWL_H
    ink = material("Crack", "#3b3029", rough=0.6)
    main = [(-0.05, 0.0), (0.12, 0.15), (-0.03, 0.32), (0.15, 0.5), (0.03, 0.68), (0.2, 0.86), (0.08, 0.98)]
    branch = [(-0.03, 0.32), (-0.25, 0.42), (-0.2, 0.58), (-0.42, 0.68)]
    twig = [(0.15, 0.5), (0.37, 0.44), (0.52, 0.58)]
    segs = []
    for path, r in ((main, 0.0075), (branch, 0.006), (twig, 0.005)):
        pts = [bowl_point(rim_z, az, f * H, 0.009) for az, f in path]
        for a, b in zip(pts, pts[1:]):
            segs += capsule(tuple(a), tuple(b), r, verts=6)
    chip = sphere(tuple(bowl_point(rim_z, -0.05, 0.01, -0.002)), (0.032, 0.012, 0.022), 12, 6)
    segs.append(chip)
    return solid(join(segs, "DamagedCrack"), "DamagedCrack", ink, None)


def goonk_bowl() -> list[bpy.types.Object]:
    """Violet Goonk wearing a rice bowl down to its eyes (replaces the red Tontie, frame 6, two hits).

    Intact*: calm eyes peeking under the rim, hands on the hole rim. Damaged* (after the first
    hit): cracked bowl, wide scared eyes, sweat drop, hands pressed to its cheeks.
    """
    fur = plush_mat("VioletPlush", *VIOLET)
    w, d, h, cz = 0.29, 0.26, 0.5, 0.29
    parts = pear(cz, w, d, h) + goonk_nose(0.33)
    out = [plush_body(parts, fur)]
    rim_z = 0.43
    out.append(group("Bowl", ceramic_bowl(rim_z)))
    out.append(group("DamagedBowl", [bowl_crack(rim_z)]))

    calm = []
    scared = []
    for side in (1, -1):
        calm.append(googly((side * 0.095, -0.222, 0.41), 0.054, look=(side * 0.7, -0.55), turn=side * 0.3))
        scared.append(
            googly((side * 0.098, -0.222, 0.395), 0.054, look=(side * 0.05, -0.1), rig="EyeRigScared", turn=side * 0.3, sclera_scale=1.2, pupil=0.24)
        )
    calm += goonk_grip_arms(fur, 0.3, 0.22)
    for side in (1, -1):
        scared.append(
            plush_arm(
                "Arm",
                (side * 0.23, -0.04, 0.3),
                (side * 0.32, -0.19, 0.22),
                (side * 0.2, -0.26, 0.26),
                (-side * 0.6, -0.3, 0.75),
                (0, 0.4, 1),
                fur,
                r=0.036,
            )
        )
    sweat = [sphere((0.22, -0.2, 0.39), (0.024, 0.016, 0.03), 16, 8), cone((0.22, -0.2, 0.425), 0.018, 0.0, 0.032, verts=16)]
    scared.append(solid(join(sweat, "Sweat"), "Sweat", material("Sweat", "#8fd6ff", rough=0.08, emit=0.25), None))
    mouth = sphere((0.085, -0.255, 0.19), (0.032, 0.012, 0.024), 16, 8)
    scared.append(solid(mouth, "Mouth", material("Mouth", "#2a0f3a", rough=0.5), None))
    out.append(group("IntactPose", calm))
    out.append(group("DamagedPose", scared))
    return out


def star_prism(loc, r_out: float, r_in: float, depth: float, rot=(0, 0, 0)) -> bpy.types.Object:
    bm = bmesh.new()
    ring = []
    for i in range(10):
        a = math.pi / 2 + i * math.pi / 5
        r = r_out if i % 2 == 0 else r_in
        ring.append(bm.verts.new((r * math.cos(a), r * math.sin(a), 0)))
    face = bm.faces.new(ring)
    ext = bmesh.ops.extrude_face_region(bm, geom=[face])
    bmesh.ops.translate(bm, verts=[v for v in ext["geom"] if isinstance(v, bmesh.types.BMVert)], vec=(0, 0, depth))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Star")
    bm.to_mesh(mesh)
    bm.free()
    o = bpy.data.objects.new("Star", mesh)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = rot
    bev = o.modifiers.new("Bevel", "BEVEL")
    bev.width = depth * 0.35
    bev.segments = 2
    _apply_mod(o, bev)
    return o


PLAYER_SHOULDER = (0.2, -0.02, 0.48)


def goonk_pink() -> list[bpy.types.Object]:
    """Pink Goonk plush with its yellow tuft: the player who swings the hammer.

    The hammer arm lives in hammer.glb (pivot = shoulder); this body keeps the other arm.
    """
    fur = plush_mat("PinkPlush", "#f08cc8", "#cf63a6")
    w, d, h, cz = 0.29, 0.26, 0.72, 0.4
    parts = pear(cz, w, d, h) + goonk_cone_nose(0.57)
    out = [plush_body(parts, fur)]
    for side in (1, -1):
        out.append(googly((side * 0.095, -0.21, 0.66), 0.056, look=(-side * 0.8, 0.0), turn=side * 0.3))
    out.append(plush_arm("Arm", (-0.22, -0.02, 0.46), (-0.31, -0.07, 0.36), (-0.31, -0.14, 0.27), (-0.1, -0.6, -1.0), (0, 0, 1), fur))
    hair = material("Tuft", "#ffd42e", "plush", rough=0.8, bump=0.4, sheen=0.5)
    rnd = random.Random(7)
    strands = []
    for i in range(16):
        a = i / 16 * math.tau
        tilt = 0.35 + rnd.random() * 0.35
        length = 0.09 + rnd.random() * 0.06
        base = (math.cos(a) * 0.035, math.sin(a) * 0.03, 0.75)
        strands.append(cone(base, 0.014, 0.0, length, rot=(math.sin(a) * -tilt, math.cos(a) * tilt, 0), verts=8))
        strands[-1].location.z += length * 0.4
    out.append(solid(join(strands, "Tuft"), "Tuft", hair, 0.2))
    return out


def export_player() -> dict:
    clear_scene()
    root = group("Player", goonk_pink())
    objs = descendants(root)
    out = OUT_MODELS / "player.glb"
    export_selection(objs, out)
    lo, hi = world_bbox(objs)
    size = hi - lo
    sx, sy, sz = PLAYER_SHOULDER
    return {
        "glb": str(out.relative_to(ROOT)),
        "faces": sum(len(o.data.polygons) for o in objs if o.type == "MESH"),
        "size": [round(size.x, 3), round(size.z, 3), round(size.y, 3)],
        "shoulder": [sx, sz, -sy],
        "source": "procedural/blender (Goonk pink plush)",
    }


# --------------------------------------------------------------------------- catalogue

T = tontie

MOBS: dict[str, list] = {
    # key: list of (builder, kwargs, loc, scale)
    "5": [(goonk_violet, dict(), (0, 0, 0), 1.0)],
    "6": [(goonk_bowl, dict(), (0, 0, 0), 1.0)],
    "7": [(spike_ball, dict(color="#009860"), (-0.08, 0, 0), 1.0)],
    "8": [(slime, dict(body="#a880f8", dark="#4000c0", radius=0.17, face=None, horn_color="#60c8f8"), (0, 0, 0), 1.0)],
    "9": [(T, dict(body="#f8c800", dark="#d8a000", iris="#707000", horn_color="#f8e8a8"), (0, 0, 0), 0.62)],
    "10": [(T, dict(body="#0080d8", dark="#006088", visor=True), (0, 0, 0), 0.92)],
    "11": [(T, dict(body="#008078", dark="#005850"), (-0.08, 0, 0), 0.55), (spike_ball, dict(color="#009860", chain=False), (0.17, -0.05, 0), 0.45)],
    "12": [(bomb, dict(color="#0000f8", dark="#0000b8"), (0, 0, 0), 1.0)],
    "13": [(T, dict(body="#00d8d8", dark="#009898", iris="#007070"), (0.07, 0, 0), 0.58), (spike_ball, dict(color="#00d8d8", chain=False), (-0.17, -0.05, 0), 0.45)],
    "14": [(T, dict(body="#1000d8", dark="#000080", iris="#c00000", horn_color=None, devil=True), (-0.06, 0, 0), 0.62), (bomb, dict(color="#0000f8", dark="#0000b8"), (0.16, -0.07, 0), 0.6)],
    "15": [(T, dict(body="#6860f8", dark="#0000c0", iris="#c00000", horn_color=None, devil=True), (-0.06, 0, 0), 0.62), (bomb, dict(color="#0000f8", dark="#0000b8"), (0.16, -0.07, 0), 0.6)],
    "16": [(slime, dict(body="#d000f8", dark="#8800b0", radius=0.3, face="#f850f8", horn_color="#c8c8c8"), (0, 0, 0), 1.0)],
    "17": [(T, dict(body="#0080d8", dark="#006088", visor=True, tail=True), (0, 0, 0), 0.6)],
    "18": [(devil_head, dict(body="#0000f8", dark="#0000b8"), (0, 0, 0), 1.0)],
    "19": [(T, dict(body="#f8c8f8", dark="#c8a0c8", iris="#8a4a8a", horn_color="#c8a0c8"), (-0.07, 0, 0), 0.6), (heart, dict(), (0.17, -0.05, 0), 0.9)],
    "20": [(slime, dict(body="#d000f8", dark="#8800b0", radius=0.22, face="#f850f8", horn_color=None), (0, 0, 0), 1.0), (T, dict(body="#00d8d8", dark="#009898", iris="#007070"), (0, 0.02, 0.15), 0.6), (spike_ball, dict(color="#00d8d8", chain=False), (-0.2, -0.1, 0.12), 0.38)],
    "21": [(bomb, dict(color="#f80000", dark="#c80000"), (0, 0, 0), 1.0)],
    "22": [(T, dict(body="#989898", dark="#606060", iris="#404040", horn_color="#c8c8c8", rocky=True), (0, 0, 0), 1.05)],
    "23": [(bomb, dict(color="#9800f8", dark="#6000a8"), (0, 0, 0), 1.0)],
    "24": [(slime, dict(body="#9800f8", dark="#8800b0", radius=0.24, face="#f850f8", horn_color=None), (0, 0, 0), 1.0), (T, dict(body="#303030", dark="#101010", iris="#c00000", horn_color=None, devil=True, wings=True), (0, 0.02, 0.17), 0.66), (bomb, dict(color="#f80000", dark="#c80000"), (-0.25, -0.12, 0), 0.55), (bomb, dict(color="#9800f8", dark="#6000a8"), (0.25, -0.12, 0), 0.55)],
    "treasure": [(treasure_chest, dict(), (0, 0, 0), 1.0)],
    "shop": [(shop_stall, dict(), (0, 0, 0), 1.0)],
}
MOBS["default"] = MOBS["5"]


# --------------------------------------------------------------------------- export


def descendants(obj: bpy.types.Object) -> list[bpy.types.Object]:
    out = [obj]
    for c in obj.children:
        out.extend(descendants(c))
    return out


def world_bbox(objs: list[bpy.types.Object]) -> tuple[Vector, Vector]:
    bpy.context.view_layer.update()
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for o in objs:
        if o.type != "MESH":
            continue
        for v in o.data.vertices:
            w = o.matrix_world @ v.co
            lo = Vector((min(lo.x, w.x), min(lo.y, w.y), min(lo.z, w.z)))
            hi = Vector((max(hi.x, w.x), max(hi.y, w.y), max(hi.z, w.z)))
    return lo, hi


def export_selection(objs: list[bpy.types.Object], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.export_scene.gltf(
        filepath=str(out_path),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_image_format="JPEG",
        export_jpeg_quality=82,
    )


def build_mob(key: str) -> dict:
    clear_scene()
    root = empty("Mob")
    for i, (builder, kwargs, loc, scale) in enumerate(MOBS[key]):
        part = group(f"Part{i}", builder(**kwargs), loc=loc, scale=scale)
        part.parent = root
    objs = descendants(root)
    lo, hi = world_bbox(objs)
    root.location = (0, 0, -lo.z)
    lo, hi = world_bbox(objs)
    out = OUT_MOBS / f"{key}.glb"
    export_selection(objs, out)
    meshes = [o for o in objs if o.type == "MESH"]
    size = hi - lo
    return {
        "glb": str(out.relative_to(ROOT)),
        "parts": len(meshes),
        "faces": sum(len(o.data.polygons) for o in meshes),
        "eyes": sum(1 for o in objs if o.name.startswith("EyeRig")),
        "size": [round(size.x, 3), round(size.z, 3), round(size.y, 3)],
        "source": "procedural/blender (sprite-matched)",
    }


def export_hammer() -> dict:
    """Plush mallet held by the pink Goonk: upright pink head at -X, purple handle, yellow grip,
    and the plush's arm from its shoulder (the swing pivot, at the origin) to the hand."""
    clear_scene()
    head_x = -0.52
    pink = material("HeadPlush", "#ff86bd", "plush", rough=0.9, bump=0.3, color2="#e8609e", sheen=0.7)
    handle = material("HandlePlush", "#8b55dc", "plush", rough=0.85, bump=0.6, sheen=0.5)
    grip = material("GripPlush", "#f3c21f", "plush", rough=0.8, bump=0.6, sheen=0.4)
    star = material("Star", "#ffd92e", "plush", rough=0.7, bump=0.4, sheen=0.4)
    fur = plush_mat("PinkPlush", "#f49ccd", "#d873ad")
    head = blob(
        [cylinder((head_x, 0, 0), 0.145, 0.27, verts=48), sphere((head_x, 0, 0.12), (0.142, 0.142, 0.05)), sphere((head_x, 0, -0.12), (0.142, 0.142, 0.05))],
        "HeadBody",
        pink,
        voxel=0.008,
        smooth=4,
        uv_size=0.3,
    )
    objs = [head]
    objs.append(solid(torus((head_x, 0, 0), 0.146, 0.012, rot=(0, 0, 0), seg=48), "Seam", material("Seam", "#e45d9b", "plush"), 0.3))
    for side in (-1, 1):
        objs.append(solid(star_prism((head_x, side * 0.148, 0.0), 0.075, 0.033, 0.018, rot=(side * math.pi / 2, 0, 0)), "Star", star, 0.2))
    objs.append(solid(cylinder((-0.27, 0, 0), 0.032, 0.26, rot=(0, math.pi / 2, 0)), "Handle", handle, 0.3))
    objs.append(solid(cylinder((-0.11, 0, 0), 0.04, 0.1, rot=(0, math.pi / 2, 0)), "Grip", grip, 0.3))
    objs.append(solid(sphere((-0.055, 0, 0), 0.045, 20, 10), "Knob", grip, 0.3))
    objs.append(plush_arm("PlayerArm", (0.0, 0.0, 0.0), (-0.05, -0.05, -0.05), (-0.12, -0.02, 0.0), (0, 1, 0.15), (1, 0, 0), fur, r=0.04))
    out = OUT_MODELS / "hammer.glb"
    export_selection(objs, out)
    lo, hi = world_bbox(objs)
    size = hi - lo
    return {
        "glb": str(out.relative_to(ROOT)),
        "faces": sum(len(o.data.polygons) for o in objs),
        "size": [round(size.x, 3), round(size.z, 3), round(size.y, 3)],
        "pivot": "player shoulder at origin, head centre at x = -0.52",
        "source": "procedural/blender (Goonk plush mallet)",
    }


def world_xz(px: float, py: float) -> tuple[float, float]:
    return (px - GAME_PX / 2) * PX, (py - GAME_PX / 2) * PX


def hole_center(hole: int) -> tuple[float, float]:
    x, y = HOLE_POS[hole]
    return world_xz(x + 36, y + 36)


def boolean(target: bpy.types.Object, cutter: bpy.types.Object, op: str) -> None:
    mod = target.modifiers.new(f"{op}_{cutter.name}", "BOOLEAN")
    mod.operation = op
    mod.solver = "EXACT"
    if hasattr(mod, "material_mode"):
        mod.material_mode = "TRANSFER"
    mod.object = cutter
    _apply_mod(target, mod)
    bpy.data.objects.remove(cutter, do_unlink=True)


TITLE_FONT = Path("/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf")


def felt_text(text: str, loc, size: float, mat: bpy.types.Material, extrude: float, offset: float = 0.0) -> bpy.types.Object:
    """Upright felt lettering facing the player (-Y), converted to a light mesh."""
    cu = bpy.data.curves.new(f"Text_{text}", "FONT")
    cu.body = text
    if TITLE_FONT.exists():
        cu.font = bpy.data.fonts.load(str(TITLE_FONT), check_existing=True)
    cu.size = size
    cu.align_x = "CENTER"
    cu.align_y = "CENTER"
    cu.extrude = extrude
    cu.offset = offset
    cu.bevel_depth = extrude * 0.4
    cu.bevel_resolution = 0
    cu.resolution_u = 2
    o = bpy.data.objects.new(f"Text_{text}", cu)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (math.pi / 2, 0, 0)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.ops.object.convert(target="MESH")
    o = _active()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return solid(o, f"Text_{text}", mat, 0.2, smooth=False)


def goonk_patch(x: float, y: float, z: float, r: float, body_mat, look: float = 1.0) -> list[bpy.types.Object]:
    """Flat felt Goonk face sewn on a panel (facing -Y): head disc, googly eyes, drooping trunk."""
    face = (math.pi / 2, 0, 0)
    out = [solid(cylinder((x, y, z), r, 0.02, rot=face, verts=24), "PatchHead", body_mat, 0.2)]
    for i, side in enumerate((1, -1)):
        ex = x + side * r * 0.38
        out.append(solid(cylinder((ex, y - 0.012, z + r * 0.25), r * 0.27, 0.012, rot=face, verts=16), "PatchEye", material("FeltWhite", "#fffaf0", "plush", rough=0.9, bump=0.3), 0.2))
        px = ex + look * (side if i == 0 else side) * r * 0.1
        out.append(solid(cylinder((px, y - 0.02, z + r * 0.2), r * 0.13, 0.008, rot=face, verts=12), "PatchPupil", material("FeltBlack", "#120a1c", rough=0.9), None))
    out.append(solid(join(capsule((x, y - 0.015, z + r * 0.05), (x + r * 0.1, y - 0.015, z - r * 0.55), r * 0.17, verts=8), "PatchTrunk"), "PatchTrunk", body_mat, 0.2))
    return out


def table_mascot(builder, loc, scale: float, yaw: float) -> bpy.types.Object:
    """A plush Goonk sitting on a corner of the table (static, part of board.glb)."""
    return group(f"Mascot_{builder.__name__}", builder(), loc=loc, scale=scale, rot=(0, 0, yaw))


def export_board() -> dict:
    """Plush arcade table. Blender Z-up: X right, -Y = screen up (glTF -Z), Z up. Carpet top at Z = 0.

    Pink fuzzy carpet, holes with padded violet plush rims and a deep dark-violet pit, a padded
    violet bumper around the edge, glossy violet cabinet sides and yellow felt star appliques.
    """
    clear_scene()
    carpet = material("Carpet", "#f3a3d3", "plush", rough=0.95, color2="#e07fbf", bump=1.1, sheen=0.8)
    cabinet = material("Cabinet", "#5a2f9c", "tile", rough=0.4, color2="#6c3cb4", bump=0.2)
    pit = material("Pit", "#1c0d2e", rough=1.0)
    rim = material("RimPlush", "#8a5ad8", "plush", rough=0.9, bump=0.9, color2="#6a3cc0", sheen=0.9)
    bumper = material("BumperPlush", "#7a48cc", "plush", rough=0.9, bump=0.9, color2="#5c30aa", sheen=0.9)
    felt = material("StarFelt", "#ffd23a", "plush", rough=0.9, bump=0.6, sheen=0.5)
    # the upright panel only catches the key light at a grazing angle, so it glows a little
    back_plush = material("BackPlush", "#ffb8e0", "plush", rough=0.95, bump=1.0, color2="#f08cc8", sheen=0.8, emit=0.35)

    slab = box((0, 0, -SLAB_THICK / 2), (BOARD_WORLD, BOARD_WORLD, SLAB_THICK))
    slab.name = "Board"
    slab.data.materials.append(carpet)
    slab.data.materials.append(cabinet)

    cutters = []
    for hole in HOLE_POS:
        cx, cz = hole_center(hole)
        c = cylinder((cx, -cz, 0.15 - (PIT_DEPTH + 0.3) / 2), HOLE_RADIUS, PIT_DEPTH + 0.3, verts=40)
        c.data.materials.append(pit)
        cutters.append(c)
    boolean(slab, join(cutters, "Cutters"), "DIFFERENCE")

    slots = {m.name.split(".")[0]: i for i, m in enumerate(slab.data.materials) if m}
    pit_slot, carpet_slot, cab_slot = slots["Pit"], slots["Carpet"], slots["Cabinet"]
    for poly in slab.data.polygons:
        if poly.material_index == carpet_slot and poly.normal.z < 0.5:
            poly.material_index = cab_slot
    pit_centers = [p.center for p in slab.data.polygons if p.material_index == pit_slot]
    for hole in HOLE_POS:
        cx, cz = hole_center(hole)
        near = sum(1 for c in pit_centers if (c.x - cx) ** 2 + (c.y + cz) ** 2 < (HOLE_RADIUS + 0.01) ** 2)
        if near < 40:
            raise RuntimeError(f"hole {hole} not cut ({near} pit faces)")
    slab.data.polygons.foreach_set("use_smooth", [False] * len(slab.data.polygons))
    cube_uv(slab, 0.6)

    rings = [torus((cx, -cz, 0.012), HOLE_RADIUS + 0.035, 0.058, seg=28, minor_seg=6) for cx, cz in map(hole_center, HOLE_POS)]
    rings_o = solid(join(rings, "HoleRims"), "HoleRims", rim, 0.3)

    half = BOARD_WORLD / 2
    rails = []
    for x0, y0, x1, y1 in ((-half, -half, half, -half), (half, -half, half, half), (half, half, -half, half), (-half, half, -half, -half)):
        rails += capsule((x0, y0, 0.03), (x1, y1, 0.03), 0.09)
    bumper_o = solid(join(rails, "Bumper"), "Bumper", bumper, 0.4)

    stars = [
        star_prism((x, -z, 0.0), 0.11 * k, 0.05 * k, 0.012, rot=(0, 0, a))
        for x, z, k, a in ((-1.65, 1.72, 1.0, 0.2), (0.0, 1.78, 0.75, -0.3), (1.65, 1.7, 0.9, 0.5), (-1.7, -1.55, 0.8, -0.2), (1.7, -1.6, 1.0, 0.1), (0.0, -1.6, 0.7, 0.4))
    ]
    stars_o = solid(join(stars, "Stars"), "Stars", felt, 0.2)

    # cabinet back panel standing behind the far edge (Blender +Y), facing the player
    back_h = 1.8
    back = solid(box((0, half + 0.1, back_h / 2 - 0.1), (BOARD_WORLD + 0.18, 0.2, back_h + 0.2), bevel=0.04), "BackPanel", back_plush, 0.6, smooth=False)
    frame = []
    for p0, p1 in (((-half, half, 0.0), (-half, half, back_h)), ((half, half, 0.0), (half, half, back_h)), ((-half, half, back_h), (half, half, back_h))):
        frame += capsule(p0, p1, 0.1)
    frame_o = solid(join(frame, "BackFrame"), "BackFrame", bumper, 0.4)
    back_stars = [
        star_prism((x, half - 0.005, z), 0.16 * k, 0.07 * k, 0.02, rot=(math.pi / 2, 0, a))
        for x, z, k, a in ((-1.78, 1.55, 0.75, 0.2), (1.78, 1.5, 0.8, -0.1), (-0.6, 0.38, 0.7, 0.5), (0.05, 0.42, 0.5, 0.0), (0.65, 0.36, 0.65, -0.3), (-1.65, 0.95, 0.5, -0.4), (1.65, 1.0, 0.55, 0.3))
    ]
    back_stars_o = solid(join(back_stars, "BackStars"), "BackStars", felt, 0.2)

    # title in yellow felt letters on a violet felt outline
    title_y = half - 0.02
    title = felt_text("TONTIE", (0, title_y - 0.04, 1.0), 0.62, material("TitleFelt", "#ffd23a", "plush", rough=0.85, bump=0.6, sheen=0.5), 0.035)
    outline = felt_text("TONTIE", (0, title_y - 0.01, 1.0), 0.62, material("TitleOutline", "#4b1f8f", "plush", rough=0.9, bump=0.5), 0.018, offset=0.035)

    # little felt Goonk faces sewn on the back panel and on the front plate
    violet_felt = material("PatchViolet", "#8a5ad8", "plush", rough=0.9, bump=0.6, color2="#6a3cc0", sheen=0.6)
    pink_felt = material("PatchPink", "#ff8fcf", "plush", rough=0.9, bump=0.6, color2="#e46aae", sheen=0.6)
    patches = []
    for x, z, r, m, look in ((-1.32, 0.5, 0.2, violet_felt, 1.0), (1.32, 0.55, 0.2, pink_felt, -1.0), (-1.95, 0.25, 0.13, pink_felt, -1.0), (1.95, 0.28, 0.13, violet_felt, 1.0)):
        patches += goonk_patch(x, half - 0.01, z, r, m, look)

    # cream sign plate on the front of the cabinet, with Goonks and stars
    plate_y = -half - 0.012
    plate = solid(box((0, plate_y, -0.32), (2.9, 0.025, 0.42), bevel=0.02), "FrontPlate", material("PlateFelt", "#fff1dc", "plush", rough=0.9, bump=0.5), 0.3, smooth=False)
    plate_trim = solid(join(capsule((-1.45, plate_y - 0.01, -0.11), (1.45, plate_y - 0.01, -0.11), 0.025) + capsule((-1.45, plate_y - 0.01, -0.53), (1.45, plate_y - 0.01, -0.53), 0.025), "PlateTrim"), "PlateTrim", bumper, 0.3)
    for i, x in enumerate((-1.1, -0.37, 0.37, 1.1)):
        patches += goonk_patch(x, plate_y - 0.015, -0.32, 0.14, violet_felt if i % 2 == 0 else pink_felt, 1.0 if i < 2 else -1.0)
    plate_stars = [star_prism((x, plate_y - 0.02, -0.32), 0.07, 0.03, 0.012, rot=(math.pi / 2, 0, a)) for x, a in ((-1.33, 0.3), (-0.73, -0.2), (0.0, 0.1), (0.73, 0.4), (1.33, -0.3))]
    plate_stars_o = solid(join(plate_stars, "PlateStars"), "PlateStars", felt, 0.2)

    # quilted piping inset on the carpet
    inset = half - 0.3
    piping = []
    for x0, y0, x1, y1 in ((-inset, -inset, inset, -inset), (inset, -inset, inset, inset), (inset, inset, -inset, inset), (-inset, inset, -inset, -inset)):
        piping += capsule((x0, y0, 0.0), (x1, y1, 0.0), 0.022)
    piping_o = solid(join(piping, "Piping"), "Piping", rim, 0.3)

    # plush Goonks sitting on the far corners, gripping the bumper
    mascots = [
        table_mascot(goonk_violet, (-1.78, half - 0.22, 0.02), 0.62, 0.35),
        table_mascot(goonk_violet, (1.8, half - 0.25, 0.02), 0.55, -0.4),
    ]
    mascot_objs = [o for m in mascots for o in descendants(m)]

    objs = [slab, rings_o, bumper_o, stars_o, back, frame_o, back_stars_o, title, outline, plate, plate_trim, plate_stars_o, piping_o, *patches, *mascot_objs]
    out = OUT_MODELS / "board.glb"
    export_selection(objs, out)
    dims = slab.dimensions
    return {
        "glb": str(out.relative_to(ROOT)),
        "faces": sum(len(o.data.polygons) for o in objs if o.type == "MESH"),
        "size": [round(dims.x, 3), round(dims.z, 3), round(dims.y, 3)],
        "source": "procedural/blender (HOLE_POS, plush arcade table)",
        "holeRadius": HOLE_RADIUS,
        "pitDepth": PIT_DEPTH,
    }


def main() -> int:
    only = set(sys.argv[sys.argv.index("--") + 1 :]) if "--" in sys.argv else set()
    previous = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    entries: dict[str, dict] = dict(previous.get("mobs", {})) if only else {}
    props: dict[str, dict] = dict(previous.get("props", {})) if only else {}
    errors: list[str] = []

    for key in MOBS:
        if only and key not in only:
            continue
        try:
            entries[key] = build_mob(key)
            print("OK mob", key, entries[key]["size"], entries[key]["faces"])
        except Exception as exc:  # noqa: BLE001
            import traceback

            traceback.print_exc()
            errors.append(f"{key}: {exc}")
            print("FAIL mob", key, exc)

    for name, fn in (("hammer", export_hammer), ("player", export_player), ("board", export_board)):
        if only and name not in only:
            continue
        try:
            props[name] = fn()
            print("OK", name)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{name}: {exc}")
            print("FAIL", name, exc)

    manifest = {
        "generator": "scripts/blender/batch_export.py",
        "blender": bpy.app.version_string,
        "boardWidth": BOARD_WORLD,
        "holeRadius": HOLE_RADIUS,
        "pitDepth": PIT_DEPTH,
        "textureSize": TEX_SIZE,
        "mobs": dict(sorted(entries.items(), key=lambda kv: (not kv[0].isdigit(), int(kv[0]) if kv[0].isdigit() else 0, kv[0]))),
        "props": props,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("Wrote", MANIFEST)
    for e in errors:
        print("ERROR", e)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
