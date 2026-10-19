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

TEX_SIZE = 128

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
        h = _mix((0.45, _value_noise(s, 16, 1)), (0.35, _value_noise(s, 42, 2)), (0.2, _value_noise(s, 128, 3)))
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
) -> bpy.types.Material:
    key = f"{name}|{color}|{pattern}|{color2}"
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


def torus(loc, major: float, minor: float, rot=(0, 0, 0), seg: int = 40) -> bpy.types.Object:
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major, minor_radius=minor, location=loc, rotation=rot, major_segments=seg, minor_segments=12
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


def capsule(p0, p1, r: float) -> list[bpy.types.Object]:
    a, b = Vector(p0), Vector(p1)
    d = b - a
    rot = d.to_track_quat("Z", "Y").to_euler()
    body = cylinder(tuple((a + b) / 2), r, d.length, rot=tuple(rot), verts=24)
    return [body, sphere(tuple(a), r, 20, 10), sphere(tuple(b), r, 20, 10)]


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
    dec.ratio = 0.45
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


# --------------------------------------------------------------------------- catalogue

T = tontie

MOBS: dict[str, list] = {
    # key: list of (builder, kwargs, loc, scale)
    "5": [(T, dict(body="#008078", dark="#005850", iris="#1d2a9c"), (0, 0, 0), 1.0)],
    "6": [(T, dict(body="#c80000", dark="#900000", iris="#6a0000", horn_color="#c8c8c8"), (0, 0, 0), 1.0)],
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
    """doka hammer (DefineSprite_261): upright mallet head at -X, handle to the grip at the origin."""
    clear_scene()
    head_x = -0.52
    metal = material("HeadMetal", "#eef0f2", "metal", rough=0.3, metal=0.8, bump=0.3)
    band = material("Band", "#33363c", "metal", rough=0.4, metal=0.6)
    wood = material("Grip", "#f2d060", "wood", rough=0.6)
    head = cylinder((head_x, 0, 0), 0.13, 0.3, verts=48)
    bev = head.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.02
    bev.segments = 4
    _apply_mod(head, bev)
    objs = [solid(head, "HeadBody", metal, 0.3)]
    objs.append(solid(join([cylinder((head_x, 0, z), 0.136, 0.035, verts=48) for z in (-0.11, 0.11)], "Band"), "Band", band, 0.3))
    objs.append(solid(cylinder((-0.2, 0, 0), 0.038, 0.42, rot=(0, math.pi / 2, 0)), "Handle", wood, 0.3))
    objs.append(solid(join([torus((x, 0, 0), 0.04, 0.008, rot=(0, math.pi / 2, 0), seg=24) for x in (-0.1, -0.06, -0.02)], "Wrap"), "Wrap", band, 0.3))
    objs.append(solid(sphere((0.01, 0, 0), 0.05, 20, 10), "Knob", wood, 0.3))
    out = OUT_MODELS / "hammer.glb"
    export_selection(objs, out)
    lo, hi = world_bbox(objs)
    size = hi - lo
    return {
        "glb": str(out.relative_to(ROOT)),
        "faces": sum(len(o.data.polygons) for o in objs),
        "size": [round(size.x, 3), round(size.z, 3), round(size.y, 3)],
        "pivot": "grip at origin, head centre at x = -0.52",
        "source": "procedural/blender (DefineSprite_261 shape)",
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


def export_board() -> dict:
    """Blender Z-up: X right, -Y = screen up (glTF -Z), Z up. Tile top at Z = 0."""
    clear_scene()
    grass = material("Grass", "#5aa81e", "grass", rough=0.95, color2="#86c934", bump=0.8)
    tile = material("Tile", "#9fd84a", "tile", rough=0.8, color2="#b4e36a", bump=0.4)
    pit = material("Pit", "#1a120b", rough=1.0)
    rim = material("Rim", "#5b3d22", "wood", rough=0.8)

    slab = box((0, 0, -TILE_H - SLAB_THICK / 2), (BOARD_WORLD, BOARD_WORLD, SLAB_THICK))
    slab.name = "Board"
    slab.data.materials.append(grass)
    tiles = []
    for hole in HOLE_POS:
        cx, cz = hole_center(hole)
        t = box((cx, -cz, -TILE_H / 2), (TILE_W, TILE_D, TILE_H))
        t.data.materials.append(tile)
        tiles.append(t)
    boolean(slab, join(tiles, "Tiles"), "UNION")

    cutters = []
    for hole in HOLE_POS:
        cx, cz = hole_center(hole)
        c = cylinder((cx, -cz, 0.15 - (PIT_DEPTH + 0.3) / 2), HOLE_RADIUS, PIT_DEPTH + 0.3, verts=40)
        c.data.materials.append(pit)
        cutters.append(c)
    boolean(slab, join(cutters, "Cutters"), "DIFFERENCE")

    rings = []
    for hole in HOLE_POS:
        cx, cz = hole_center(hole)
        r = torus((cx, -cz, 0.0), HOLE_RADIUS + 0.025, 0.03, seg=40)
        r.data.materials.append(rim)
        rings.append(r)
    boolean(slab, join(rings, "Rings"), "UNION")

    pit_slots = {i for i, m in enumerate(slab.data.materials) if m and m.name.startswith("Pit")}
    pit_centers = [p.center for p in slab.data.polygons if p.material_index in pit_slots]
    for hole in HOLE_POS:
        cx, cz = hole_center(hole)
        near = sum(1 for c in pit_centers if (c.x - cx) ** 2 + (c.y + cz) ** 2 < (HOLE_RADIUS + 0.01) ** 2)
        if near < 40:
            raise RuntimeError(f"hole {hole} not cut ({near} pit faces)")

    slab.data.polygons.foreach_set("use_smooth", [False] * len(slab.data.polygons))
    cube_uv(slab, 1.2)
    out = OUT_MODELS / "board.glb"
    export_selection([slab], out)
    dims = slab.dimensions
    return {
        "glb": str(out.relative_to(ROOT)),
        "faces": len(slab.data.polygons),
        "size": [round(dims.x, 3), round(dims.z, 3), round(dims.y, 3)],
        "source": "procedural/blender (HOLE_POS)",
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

    for name, fn in (("hammer", export_hammer), ("board", export_board)):
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
