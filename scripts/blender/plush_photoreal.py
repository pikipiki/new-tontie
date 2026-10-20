"""
Photoreal Goonk plushies (violet & pink) modelled from the reference photos. Blender 5.x, Cycles.

  blender --background --python scripts/blender/plush_photoreal.py
  blender --background --python scripts/blender/plush_photoreal.py -- --no-render
  blender --background --python scripts/blender/plush_photoreal.py -- --samples 64 --size 700 --views pair violet_front

Outputs
  reference/plush/goonk-plush.blend          two collections (Goonk_Violet, Goonk_Pink), studio lights + camera
  reference/plush/renders/<view>.png         Cycles check renders (Metal GPU when available)

Real-world scale, metres: each plush stands ~15 cm tall, feet at z = 0, face towards -Y.

Anatomy read off the photos
  * egg body (slightly top-heavy, flat sitting base), 4 velour gores meeting at the crown with
    sewn seams at +-45 / +-135 deg plus a seam ring around the bottom panel
  * two small, nearly round white vinyl ovals with a big printed black pupil touching the rim:
    the pink one squints (pupils towards the nose), the violet one looks outwards
  * thick trunk growing between the eyes: straight cone on the pink, curved drooping trunk on the violet
  * two stuffed tube arms sewn on the flanks, hands with 3 chunky fingers
  * two small flat feet with 3 toes poking out under the front
  * pink only: wispy yellow fibre tuft on the crown
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import bmesh  # type: ignore
import bpy  # type: ignore
from mathutils import Matrix, Vector  # type: ignore

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "reference/plush"
BLEND = OUT_DIR / "goonk-plush.blend"
RENDERS = OUT_DIR / "renders"

# --------------------------------------------------------------------------- options

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []


def opt(name: str, default):
    if name in ARGS:
        i = ARGS.index(name)
        if isinstance(default, bool):
            return True
        return type(default)(ARGS[i + 1])
    return default


RENDER = not opt("--no-render", False)
FUZZ = not opt("--no-fuzz", False)
SAMPLES = opt("--samples", 128)
SIZE = opt("--size", 900)
DEFAULT_VIEWS = ["pair", "violet_front", "violet_side", "pink_front", "pink_back"]
if "--views" in ARGS:
    VIEWS = []
    for a in ARGS[ARGS.index("--views") + 1 :]:
        if a.startswith("--"):
            break
        VIEWS.append(a)
else:
    VIEWS = DEFAULT_VIEWS

# --------------------------------------------------------------------------- dimensions (m)

H = 0.150  # standing height
DEPTH = 1.0  # body depth / width
# (radius, z) spine of the body, Catmull-Rom interpolated. Widest around 55 % of the height,
# round dome on top, flat sitting base.
BODY_PROFILE = [
    (0.000, 0.000),
    (0.040, 0.000),
    (0.053, 0.006),
    (0.0600, 0.020),
    (0.0665, 0.045),
    (0.0705, 0.072),
    (0.0665, 0.098),
    (0.0590, 0.120),
    (0.0475, 0.137),
    (0.028, 0.1465),
    (0.000, 0.150),
]
SEAM_AZ = [math.radians(a) for a in (45, 135, -45, -135)]
GORE_BULGE = 0.009  # relative puff of each stuffed panel between the seams

def _straight(p0, angle_deg: float, length: float) -> dict:
    a = math.radians(angle_deg)
    p2 = (p0[0], p0[1] - math.cos(a) * length, p0[2] - math.sin(a) * length)
    return dict(p0=p0, p1=tuple((u + v) / 2 for u, v in zip(p0, p2)), p2=p2)


# Per plush: eyes are small, nearly round printed ovals with a big black pupil touching the rim.
# look = pupil direction inside the white (+x outward, +z up): pink squints in, violet looks out.
SPECS = {
    "violet": dict(
        eye=dict(x=0.0215, z=0.111, w=0.0105, h=0.0118, tilt=math.radians(8), pupil=0.0052, look=(1.0, -0.35)),
        # curved trunk: leaves the face horizontally, then droops to a round bulb
        trunk=dict(p0=(0, -0.044, 0.092), p1=(0, -0.101, 0.091), p2=(0, -0.104, 0.047), r0=0.0215, r1=0.0102, taper=0.8),
    ),
    "pink": dict(
        eye=dict(x=0.0245, z=0.108, w=0.0112, h=0.0112, tilt=math.radians(-6), pupil=0.0056, look=(-1.0, 0.05)),
        # straight cone pointing forward and slightly down
        trunk=dict(**_straight((0, -0.046, 0.089), 32, 0.06), r0=0.0225, r1=0.0068, taper=1.0),
    ),
}
ARM = dict(s=(0.058, -0.010, 0.080), e=(0.092, -0.040, 0.072), w=(0.084, -0.080, 0.060), r=0.0118)
FOOT = dict(c=(0.029, -0.049, 0.0055), half=(0.012, 0.018, 0.0055))

# sampled from the photos (velour under warm room light)
PALETTE = {
    "violet": dict(base="#6a50c6", light="#9b8df2", dark="#45308c"),
    "pink": dict(base="#c25cc6", light="#dfa0e2", dark="#89438a"),
}
TUFT_YELLOW = "#e9b800"

# --------------------------------------------------------------------------- maths helpers


def catmull_rom(points: list[tuple[float, float]], n: int) -> list[tuple[float, float]]:
    pts = [points[0]] + list(points) + [points[-1]]
    out = []
    segs = len(points) - 1
    for i in range(segs):
        p0, p1, p2, p3 = pts[i], pts[i + 1], pts[i + 2], pts[i + 3]
        steps = max(2, round(n * math.dist(p1, p2) / 0.02))
        for k in range(steps):
            t = k / steps
            t2, t3 = t * t, t * t * t
            out.append(
                tuple(
                    0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)
                    for j in range(2)
                )
            )
    out.append(points[-1])
    return out


_PROFILE = catmull_rom(BODY_PROFILE, 10)


def body_radius(z: float) -> float:
    z = min(max(z, 0.0), H)
    for (r0, z0), (r1, z1) in zip(_PROFILE, _PROFILE[1:]):
        if z0 <= z <= z1:
            t = 0 if z1 == z0 else (z - z0) / (z1 - z0)
            return r0 + (r1 - r0) * t
    return 0.0


def body_point(az: float, z: float) -> Vector:
    r = body_radius(z)
    return Vector((r * math.sin(az), -DEPTH * r * math.cos(az), z))


def body_normal(az: float, z: float) -> Vector:
    du = body_point(az + 1e-3, z) - body_point(az - 1e-3, z)
    dv = body_point(az, z + 1e-4) - body_point(az, z - 1e-4)
    n = du.cross(dv)
    if n.dot(body_point(az, z) - Vector((0, 0, z))) < 0:
        n = -n
    return n.normalized()


def bezier(p0, p1, p2, t: float) -> Vector:
    a, b, c = Vector(p0), Vector(p1), Vector(p2)
    return a * (1 - t) ** 2 + b * 2 * (1 - t) * t + c * t * t


def bezier_tangent(p0, p1, p2, t: float) -> Vector:
    a, b, c = Vector(p0), Vector(p1), Vector(p2)
    return ((b - a) * 2 * (1 - t) + (c - b) * 2 * t).normalized()


def hex_rgb(h: str) -> tuple[float, float, float]:
    h = h.lstrip("#")
    s = tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in s)  # type: ignore[return-value]


def rgba(h: str, a: float = 1.0):
    return (*hex_rgb(h), a)


# --------------------------------------------------------------------------- object helpers


def mesh_object(name: str, bm: bmesh.types.BMesh, smooth: bool = True) -> bpy.types.Object:
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(obj)
    if smooth:
        me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    return obj


def set_active(obj: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj


def apply_modifier(obj: bpy.types.Object, mod) -> None:
    set_active(obj)
    bpy.ops.object.modifier_apply(modifier=mod.name)


def fur_slots(obj: bpy.types.Object, fur: bpy.types.Material, fuzz: bpy.types.Material) -> None:
    """Slot 1 = velour surface, slot 2 = fuzz strands (hair systems use material index 2)."""
    obj.data.materials.append(fur)
    obj.data.materials.append(fuzz)


def subsurf(obj: bpy.types.Object, levels: int = 1, render: int = 2) -> None:
    m = obj.modifiers.new("Subdivision", "SUBSURF")
    m.levels = levels
    m.render_levels = render


def shade_smooth(obj: bpy.types.Object) -> None:
    obj.data.polygons.foreach_set("use_smooth", [True] * len(obj.data.polygons))


def ellipsoid(center, half, basis: Matrix | None = None, segs: int = 32, rings: int = 16) -> bpy.types.Object:
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0)
    m = Matrix.Diagonal((*half, 1.0))
    if basis is not None:
        m = basis @ m
    bmesh.ops.transform(bm, matrix=Matrix.Translation(center) @ m, verts=bm.verts)
    return mesh_object("Ellipsoid", bm)


def capsule(a, b, r: float) -> list[bpy.types.Object]:
    a, b = Vector(a), Vector(b)
    d = b - a
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=False, segments=20, radius1=r, radius2=r, depth=d.length)
    rot = d.to_track_quat("Z", "Y").to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation((a + b) / 2) @ rot, verts=bm.verts)
    return [mesh_object("Cap", bm), ellipsoid(a, (r, r, r), segs=20, rings=10), ellipsoid(b, (r, r, r), segs=20, rings=10)]


def join(objs: list[bpy.types.Object], name: str) -> bpy.types.Object:
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1:
        bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active
    o.name = name
    o.data.name = name
    return o


def soft_union(parts: list[bpy.types.Object], name: str, voxel: float, smooth_iter: int = 4, decimate: float = 0.35) -> bpy.types.Object:
    """Stuffed appendage: union of primitives -> fine voxel remesh -> relax -> light decimate."""
    obj = join(parts, name)
    rem = obj.modifiers.new("Remesh", "REMESH")
    rem.mode = "VOXEL"
    rem.voxel_size = voxel
    rem.use_smooth_shade = True
    apply_modifier(obj, rem)
    sm = obj.modifiers.new("Smooth", "SMOOTH")
    sm.factor = 0.8
    sm.iterations = smooth_iter
    apply_modifier(obj, sm)
    dec = obj.modifiers.new("Decimate", "DECIMATE")
    dec.ratio = decimate
    apply_modifier(obj, dec)
    shade_smooth(obj)
    return obj


def frame_matrix(x: Vector, y: Vector, z: Vector) -> Matrix:
    """4x4 matrix whose columns are the given local axes."""
    return Matrix((tuple(x), tuple(y), tuple(z))).transposed().to_4x4()


# --------------------------------------------------------------------------- materials


def _principled(mat: bpy.types.Material):
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    return nt, bsdf


def velour_material(name: str, base: str, light: str, dark: str, seams: bool) -> bpy.types.Material:
    """Short-pile crushed velour: sheen rim, mottled pile direction, micro-fibre bump, sewn seams."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt, bsdf = _principled(mat)
    nodes, links = nt.nodes, nt.links

    coord = nodes.new("ShaderNodeTexCoord")

    # crushed pile: large soft mottling between the base colour and its lit / shadowed tones
    mottle = nodes.new("ShaderNodeTexNoise")
    mottle.inputs["Scale"].default_value = 16.0
    mottle.inputs["Detail"].default_value = 3.0
    mottle.inputs["Roughness"].default_value = 0.5
    links.new(coord.outputs["Object"], mottle.inputs["Vector"])
    ramp = nodes.new("ShaderNodeValToRGB")
    b, d, l = hex_rgb(base), hex_rgb(dark), hex_rgb(light)
    ramp.color_ramp.elements[0].position = 0.3
    ramp.color_ramp.elements[0].color = (*(bi + (di - bi) * 0.6 for bi, di in zip(b, d)), 1.0)
    ramp.color_ramp.elements.new(0.52).color = (*b, 1.0)
    ramp.color_ramp.elements[-1].position = 0.76
    ramp.color_ramp.elements[-1].color = (*(bi + (li - bi) * 0.55 for bi, li in zip(b, l)), 1.0)
    links.new(mottle.outputs["Fac"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])

    # micro fibre structure
    fibre = nodes.new("ShaderNodeTexNoise")
    fibre.inputs["Scale"].default_value = 900.0
    fibre.inputs["Detail"].default_value = 3.0
    fibre.inputs["Roughness"].default_value = 0.7
    links.new(coord.outputs["Object"], fibre.inputs["Vector"])
    bump_fibre = nodes.new("ShaderNodeBump")
    bump_fibre.inputs["Strength"].default_value = 0.12
    bump_fibre.inputs["Distance"].default_value = 0.0004
    links.new(fibre.outputs["Fac"], bump_fibre.inputs["Height"])
    normal_out = bump_fibre.outputs["Normal"]

    if seams:
        sep = nodes.new("ShaderNodeSeparateXYZ")
        links.new(coord.outputs["Object"], sep.inputs["Vector"])
        neg_y = nodes.new("ShaderNodeMath")
        neg_y.operation = "MULTIPLY"
        neg_y.inputs[1].default_value = -1.0
        links.new(sep.outputs["Y"], neg_y.inputs[0])
        az = nodes.new("ShaderNodeMath")
        az.operation = "ARCTAN2"
        links.new(sep.outputs["X"], az.inputs[0])
        links.new(neg_y.outputs["Value"], az.inputs[1])
        # cos(4 az) = -1 exactly on the four gore seams (+-45, +-135 deg)
        four = nodes.new("ShaderNodeMath")
        four.operation = "MULTIPLY"
        four.inputs[1].default_value = 4.0
        links.new(az.outputs["Value"], four.inputs[0])
        cos4 = nodes.new("ShaderNodeMath")
        cos4.operation = "COSINE"
        links.new(four.outputs["Value"], cos4.inputs[0])
        gore = nodes.new("ShaderNodeMapRange")
        gore.inputs["From Min"].default_value = -1.0
        gore.inputs["From Max"].default_value = -0.993
        gore.inputs["To Min"].default_value = 1.0
        gore.inputs["To Max"].default_value = 0.0
        gore.clamp = True
        links.new(cos4.outputs["Value"], gore.inputs["Value"])
        # seams fade out at the very crown (all four meet) and stop above the bottom panel
        zmask = nodes.new("ShaderNodeMapRange")
        zmask.inputs["From Min"].default_value = 0.004
        zmask.inputs["From Max"].default_value = 0.012
        zmask.clamp = True
        links.new(sep.outputs["Z"], zmask.inputs["Value"])
        gore_z = nodes.new("ShaderNodeMath")
        gore_z.operation = "MULTIPLY"
        links.new(gore.outputs["Result"], gore_z.inputs[0])
        links.new(zmask.outputs["Result"], gore_z.inputs[1])
        # bottom panel seam ring
        ring_d = nodes.new("ShaderNodeMath")
        ring_d.operation = "SUBTRACT"
        ring_d.inputs[1].default_value = 0.0045
        links.new(sep.outputs["Z"], ring_d.inputs[0])
        ring_abs = nodes.new("ShaderNodeMath")
        ring_abs.operation = "ABSOLUTE"
        links.new(ring_d.outputs["Value"], ring_abs.inputs[0])
        ring = nodes.new("ShaderNodeMapRange")
        ring.inputs["From Min"].default_value = 0.0004
        ring.inputs["From Max"].default_value = 0.0012
        ring.inputs["To Min"].default_value = 1.0
        ring.inputs["To Max"].default_value = 0.0
        ring.clamp = True
        links.new(ring_abs.outputs["Value"], ring.inputs["Value"])
        seam = nodes.new("ShaderNodeMath")
        seam.operation = "MAXIMUM"
        links.new(gore_z.outputs["Value"], seam.inputs[0])
        links.new(ring.outputs["Result"], seam.inputs[1])
        # slightly darker, less sheen in the stitch valley
        darker = nodes.new("ShaderNodeMixRGB")
        darker.blend_type = "MULTIPLY"
        darker.inputs["Color2"].default_value = (0.55, 0.55, 0.6, 1.0)
        links.new(seam.outputs["Value"], darker.inputs["Fac"])
        links.new(ramp.outputs["Color"], darker.inputs["Color1"])
        links.new(darker.outputs["Color"], bsdf.inputs["Base Color"])
        bump_seam = nodes.new("ShaderNodeBump")
        bump_seam.inputs["Strength"].default_value = 0.8
        bump_seam.inputs["Distance"].default_value = 0.0012
        bump_seam.invert = True
        links.new(seam.outputs["Value"], bump_seam.inputs["Height"])
        links.new(normal_out, bump_seam.inputs["Normal"])
        normal_out = bump_seam.outputs["Normal"]

    links.new(normal_out, bsdf.inputs["Normal"])
    bsdf.inputs["Roughness"].default_value = 0.68
    bsdf.inputs["Specular IOR Level"].default_value = 0.3
    bsdf.inputs["Sheen Weight"].default_value = 0.9
    bsdf.inputs["Sheen Roughness"].default_value = 0.3
    bsdf.inputs["Sheen Tint"].default_value = rgba(light)
    bsdf.inputs["Subsurface Weight"].default_value = 0.04
    bsdf.inputs["Subsurface Scale"].default_value = 0.003
    bsdf.inputs["Subsurface Radius"].default_value = (1.0, 0.6, 0.8)
    return mat


def strand_material(name: str, color: str, roughness: float = 0.45) -> bpy.types.Material:
    """Principled Hair BSDF with direct colouring (fibres keep their dye colour, no washed-out halo)."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    hair = nt.nodes.new("ShaderNodeBsdfHairPrincipled")
    hair.parametrization = "COLOR"
    hair.inputs["Color"].default_value = rgba(color)
    hair.inputs["Roughness"].default_value = roughness
    hair.inputs["Radial Roughness"].default_value = 0.5
    hair.inputs["Coat"].default_value = 0.05
    hair.inputs["IOR"].default_value = 1.45
    out = nt.nodes["Material Output"]
    nt.links.new(hair.outputs["BSDF"], out.inputs["Surface"])
    return mat


def fuzz_material(name: str, base: str, light: str) -> bpy.types.Material:
    return strand_material(name, base, 0.5)


def plain_material(name: str, color: str, rough: float, bump: float = 0.0) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt, bsdf = _principled(mat)
    bsdf.inputs["Base Color"].default_value = rgba(color)
    bsdf.inputs["Roughness"].default_value = rough
    if bump > 0:
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = 600.0
        b = nt.nodes.new("ShaderNodeBump")
        b.inputs["Strength"].default_value = bump
        b.inputs["Distance"].default_value = 0.0002
        nt.links.new(noise.outputs["Fac"], b.inputs["Height"])
        nt.links.new(b.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


# --------------------------------------------------------------------------- hair


def add_hair(obj: bpy.types.Object, name: str, count: int, length: float, radius: float, material_index: int, **kw) -> None:
    obj.modifiers.new(name, "PARTICLE_SYSTEM")
    psys = obj.particle_systems[-1]
    psys.name = name
    st = psys.settings
    st.name = f"{obj.name}_{name}"
    st.type = "HAIR"
    st.count = count
    st.hair_length = length
    st.use_advanced_hair = True
    st.use_modifier_stack = True  # grow from the subdivided / displaced surface
    st.radius_scale = radius
    st.root_radius = 1.0
    st.tip_radius = 0.0
    st.shape = kw.get("shape", 0.0)
    st.material = material_index
    st.child_type = "SIMPLE"
    st.child_percent = kw.get("child_count", 4)
    st.rendered_child_count = kw.get("child_count", 4)
    st.child_radius = kw.get("child_radius", 0.0008)
    st.roughness_endpoint = kw.get("rough_end", 0.0015)
    st.roughness_end_shape = 1.0
    st.roughness_2 = kw.get("rough_2", 0.0)
    st.roughness_2_size = kw.get("rough_2_size", 1.0)
    if kw.get("kink"):
        st.kink = "CURL"
        st.kink_amplitude = kw["kink"][0]
        st.kink_frequency = kw["kink"][1]
    st.display_step = 3
    st.render_step = 4
    st.hair_step = kw.get("hair_step", 5)


# --------------------------------------------------------------------------- parts


def build_body(fur: bpy.types.Material, fuzz: bpy.types.Material) -> bpy.types.Object:
    bm = bmesh.new()
    prof = _PROFILE
    verts = [bm.verts.new((r, 0, z)) for r, z in prof]
    edges = [bm.edges.new((a, b)) for a, b in zip(verts, verts[1:])]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=96, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    rmax = max(r for r, _ in prof)
    for v in bm.verts:
        x, y, z = v.co
        r = math.hypot(x, y)
        if r < 1e-6:
            continue
        az = math.atan2(x, -y)
        # four stuffed gores bulge between the seams (mean radius preserved)
        w = (r / rmax) ** 1.5
        f = 0.5 + 0.5 * math.cos(4 * az)
        k = 1 + GORE_BULGE * w * (f - 0.5)
        v.co = Vector((x * k, y * k * DEPTH, z))
    body = mesh_object("Body", bm)
    fur_slots(body, fur, fuzz)
    subsurf(body, 1, 2)
    tex = bpy.data.textures.new(f"{fur.name}_stuffing", "CLOUDS")
    tex.noise_scale = 0.035
    tex.noise_depth = 2
    disp = body.modifiers.new("Stuffing", "DISPLACE")
    disp.texture = tex
    disp.strength = 0.0016
    disp.mid_level = 0.5
    if FUZZ:
        add_hair(body, "Fuzz", 20000, 0.0012, 0.00011, 2, child_count=3, child_radius=0.0007, rough_end=0.0005, hair_step=2)
    return body


def build_trunk(spec: dict, fur: bpy.types.Material, fuzz: bpy.types.Material) -> bpy.types.Object:
    p0, p1, p2 = spec["p0"], spec["p1"], spec["p2"]
    r0, r1, taper = spec["r0"], spec["r1"], spec["taper"]
    bm = bmesh.new()
    rings = []
    n, segs = 22, 28
    side = Vector((1, 0, 0))

    def ring(center: Vector, t: Vector, radius: float):
        up = t.cross(side).normalized()
        return [bm.verts.new(center + (side * math.cos(a) * 1.0 + up * math.sin(a) * 0.93) * radius) for a in (i / segs * math.tau for i in range(segs))]

    for i in range(n + 1):
        t = i / n
        rad = r0 + (r1 - r0) * t**taper
        rings.append(ring(bezier(p0, p1, p2, t), bezier_tangent(p0, p1, p2, t), rad))
    tip_c, tip_t = bezier(p0, p1, p2, 1.0), bezier_tangent(p0, p1, p2, 1.0)
    caps = 6
    for k in range(1, caps):
        phi = k / caps * math.pi / 2
        rings.append(ring(tip_c + tip_t * r1 * 1.05 * math.sin(phi), tip_t, r1 * math.cos(phi)))
    pole = bm.verts.new(tip_c + tip_t * r1 * 1.05)
    for ra, rb in zip(rings, rings[1:]):
        for i in range(segs):
            bm.faces.new((ra[i], ra[(i + 1) % segs], rb[(i + 1) % segs], rb[i]))
    last = rings[-1]
    for i in range(segs):
        bm.faces.new((last[i], last[(i + 1) % segs], pole))
    trunk = mesh_object("Trunk", bm)
    fur_slots(trunk, fur, fuzz)
    subsurf(trunk, 1, 2)
    if FUZZ:
        add_hair(trunk, "Fuzz", 3000, 0.001, 0.00012, 2, child_count=3, child_radius=0.0007, rough_end=0.0004, hair_step=2)
    return trunk


def build_eye(side: int, spec: dict, white: bpy.types.Material, black: bpy.types.Material) -> list[bpy.types.Object]:
    cx, cz = side * spec["x"], spec["z"]
    # anchor the eye on the body surface at that x / z
    r = body_radius(cz)
    az = math.asin(max(-1, min(1, cx / r)))
    p = body_point(az, cz)
    n = body_normal(az, cz)
    up = (Vector((0, 0, 1)) - n * n.z).normalized()
    right = up.cross(n).normalized()
    basis = Matrix.Rotation(-side * spec["tilt"], 4, n) @ frame_matrix(right, -n, up)
    w, h, d = spec["w"], spec["h"], 0.0032
    center = p + n * 0.0012
    sclera = ellipsoid(center, (w, d, h), basis, 40, 20)
    sclera.name = f"Eye_{'R' if side > 0 else 'L'}"
    sclera.data.materials.append(white)
    subsurf(sclera, 1, 1)

    # printed pupil: a thin cap draped on the white dome, pushed against the rim along `look`
    pr = spec["pupil"]
    lx, lz = spec["look"]
    ln = math.hypot(lx, lz) or 1.0
    reach = max(0.0, 1 - pr / min(w, h) * 1.12)
    ox, oz = side * lx / ln * w * reach, lz / ln * h * reach
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=16, radius=1.0)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y > 1e-4], context="VERTS")
    for v in bm.verts:
        sx, sy, sz = v.co
        x, z = ox + sx * pr, oz + sz * pr
        k = max(0.0, 1 - (x / w) ** 2 - (z / h) ** 2)
        v.co = Vector((x, -d * math.sqrt(k) - 0.00022 + sy * 0.00025, z))
    bmesh.ops.transform(bm, matrix=Matrix.Translation(center) @ basis, verts=bm.verts)
    pupil = mesh_object(f"Pupil_{'R' if side > 0 else 'L'}", bm)
    pupil.data.materials.append(black)
    return [sclera, pupil]


def build_arm(side: int, fur: bpy.types.Material, fuzz: bpy.types.Material) -> bpy.types.Object:
    mirror = Vector((side, 1, 1))
    s = Vector(ARM["s"]) * mirror
    e = Vector(ARM["e"]) * mirror
    w = Vector(ARM["w"]) * mirror
    r = ARM["r"]
    parts: list[bpy.types.Object] = []
    # tube along the bent arm
    n = 14
    prev = None
    for i in range(n + 1):
        t = i / n
        c = bezier(s, e, w, t)
        rad = r * (1.0 - 0.1 * t)
        if prev is not None:
            parts += capsule(prev, c, rad)
        prev = c
    # three chunky fingers fanned out from a small palm (no thumb)
    f = (w - e).normalized()
    palm = (Vector((0, 0, 1)) - f * f.z).normalized()
    sd = f.cross(palm).normalized()
    hand_c = w + f * 0.007
    parts.append(ellipsoid(hand_c, (0.0112, 0.0105, 0.0068), frame_matrix(sd, f, palm), 32, 16))
    for i in (-1, 0, 1):
        ang = i * 0.48
        d = (f * math.cos(ang) + sd * math.sin(ang)).normalized()
        base = hand_c + sd * i * 0.0052 + f * 0.004
        tip = base + d * (0.0165 - abs(i) * 0.0022)
        parts += capsule(base, tip, 0.0051 * (1 - 0.08 * abs(i)))
    arm = soft_union(parts, f"Arm_{'R' if side > 0 else 'L'}", voxel=0.0011, smooth_iter=5, decimate=0.3)
    fur_slots(arm, fur, fuzz)
    subsurf(arm, 1, 1)
    if FUZZ:
        add_hair(arm, "Fuzz", 3500, 0.001, 0.00012, 2, child_count=3, child_radius=0.0007, rough_end=0.0004, hair_step=2)
    return arm


def build_foot(side: int, fur: bpy.types.Material, fuzz: bpy.types.Material) -> bpy.types.Object:
    cx, cy, cz = FOOT["c"]
    cx *= side
    hx, hy, hz = FOOT["half"]
    parts = [ellipsoid((cx, cy, cz), (hx, hy, hz), None, 32, 16)]
    for i in (-1, 0, 1):
        base = Vector((cx + i * 0.0075, cy - hy + 0.004, cz - 0.0005))
        tip = base + Vector((i * 0.0015, -0.0065 + abs(i) * 0.0015, -0.0003))
        parts += capsule(base, tip, 0.0038)
    foot = soft_union(parts, f"Foot_{'R' if side > 0 else 'L'}", voxel=0.0009, smooth_iter=4, decimate=0.35)
    fur_slots(foot, fur, fuzz)
    subsurf(foot, 1, 1)
    if FUZZ:
        add_hair(foot, "Fuzz", 1000, 0.0009, 0.00012, 2, child_count=3, child_radius=0.0006, rough_end=0.0004, hair_step=2)
    return foot


def build_tuft(fur_color: str) -> bpy.types.Object:
    """Wispy yellow fibre tuft on the crown (marabou-like), done with child hair."""
    center = Vector((0, -0.010, 0.1462))
    n = Vector((0, -0.22, 1)).normalized()
    up = (Vector((0, -1, 0)) - n * n.y).normalized()
    right = up.cross(n).normalized()
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=24, radius=0.011)
    bmesh.ops.transform(bm, matrix=Matrix.Translation(center) @ frame_matrix(right, up, n), verts=bm.verts)
    scalp = mesh_object("TuftScalp", bm)
    scalp.data.materials.append(plain_material("TuftScalp", fur_color, 0.8))
    hair = strand_material("TuftHair", TUFT_YELLOW, 0.35)
    scalp.data.materials.append(hair)
    add_hair(
        scalp,
        "Tuft",
        34,
        0.03,
        0.00028,
        2,
        child_count=6,
        child_radius=0.008,
        rough_end=0.02,
        rough_2=0.008,
        rough_2_size=0.25,
        kink=(0.0035, 2.5),
        hair_step=6,
    )
    st = scalp.particle_systems[-1].settings
    st.tip_radius = 0.3
    st.shape = -0.1
    return scalp


def build_plush(key: str, with_tuft: bool) -> bpy.types.Object:
    pal = PALETTE[key]
    coll = bpy.data.collections.new(f"Goonk_{key.capitalize()}")
    bpy.context.scene.collection.children.link(coll)
    layer_coll = bpy.context.view_layer.layer_collection.children[coll.name]
    bpy.context.view_layer.active_layer_collection = layer_coll

    fur_body = velour_material(f"{key}_velour_body", pal["base"], pal["light"], pal["dark"], seams=True)
    fur = velour_material(f"{key}_velour", pal["base"], pal["light"], pal["dark"], seams=False)
    fuzz = fuzz_material(f"{key}_fuzz", pal["base"], pal["light"])
    white = plain_material(f"{key}_eye_white", "#f2f1ec", 0.38, bump=0.05)
    black = plain_material(f"{key}_pupil", "#07070a", 0.45)  # printed ink dot, not a glass bead

    root = bpy.data.objects.new(f"Goonk_{key.capitalize()}", None)
    root.empty_display_size = 0.05
    coll.objects.link(root)

    spec = SPECS[key]
    objs = [build_body(fur_body, fuzz), build_trunk(spec["trunk"], fur, fuzz)]
    for side in (1, -1):
        objs += build_eye(side, spec["eye"], white, black)
        objs.append(build_arm(side, fur, fuzz))
        objs.append(build_foot(side, fur, fuzz))
    if with_tuft:
        objs.append(build_tuft(pal["base"]))
    for o in objs:
        o.parent = root
        o.name = f"{key}_{o.name}"
    bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection
    return root


# --------------------------------------------------------------------------- studio


def studio() -> bpy.types.Object:
    scene = bpy.context.scene
    coll = bpy.data.collections.new("Studio")
    scene.collection.children.link(coll)

    def link(o):
        coll.objects.link(o)
        return o

    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=6.0)
    ground = mesh_object("Ground", bm, smooth=False)
    bpy.context.collection.objects.unlink(ground)
    link(ground)
    sheet = bpy.data.materials.new("Sheet")
    sheet.use_nodes = True
    nt, bsdf = _principled(sheet)
    bsdf.inputs["Base Color"].default_value = rgba("#b9a48f")
    bsdf.inputs["Roughness"].default_value = 0.9
    bsdf.inputs["Sheen Weight"].default_value = 0.5
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3.0
    noise.inputs["Detail"].default_value = 6.0
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.4
    b.inputs["Distance"].default_value = 0.004
    nt.links.new(noise.outputs["Fac"], b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], bsdf.inputs["Normal"])
    ground.data.materials.append(sheet)

    def area(name, loc, target, power, size, color=(1, 1, 1)):
        ld = bpy.data.lights.new(name, "AREA")
        ld.energy = power
        ld.size = size
        ld.color = color
        o = link(bpy.data.objects.new(name, ld))
        o.location = loc
        o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        return o

    mid = (0, 0, 0.08)
    area("Key", (0.45, -0.55, 0.65), mid, 55, 0.6, (1.0, 0.95, 0.88))
    area("Fill", (-0.7, -0.5, 0.3), mid, 16, 1.0, (0.9, 0.94, 1.0))
    area("Rim", (0.15, 0.6, 0.5), mid, 40, 0.4)

    world = bpy.data.worlds.new("Studio")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.55, 0.52, 0.5, 1.0)
    bg.inputs["Strength"].default_value = 0.25
    scene.world = world

    cam_data = bpy.data.cameras.new("Camera")
    cam_data.lens = 65
    cam_data.sensor_width = 36
    cam = link(bpy.data.objects.new("Camera", cam_data))
    scene.camera = cam
    return cam


def aim(cam: bpy.types.Object, target, distance: float, az_deg: float, elev_deg: float, lens: float) -> None:
    az, el = math.radians(az_deg), math.radians(elev_deg)
    t = Vector(target)
    cam.location = t + Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el))) * distance
    cam.rotation_euler = (t - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.data.lens = lens


def hide_tree(obj: bpy.types.Object, hidden: bool) -> None:
    obj.hide_render = hidden
    for c in obj.children:
        hide_tree(c, hidden)


def setup_render() -> None:
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    cy = scene.cycles
    cy.samples = SAMPLES
    cy.use_adaptive_sampling = True
    cy.use_denoising = True
    cy.denoiser = "OPENIMAGEDENOISE"
    cy.max_bounces = 6
    cy.transparent_max_bounces = 8
    scene.cycles_curves.shape = "THICK"
    scene.cycles_curves.subdivisions = 2
    scene.render.resolution_x = scene.render.resolution_y = SIZE
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    # Khronos PBR Neutral keeps the dye saturation of the velour with a soft highlight roll-off
    # (AgX pushes these mid-tones to pastel, Standard clips the sheet).
    scene.view_settings.view_transform = opt("--view", "Khronos PBR Neutral")
    scene.view_settings.look = "None"
    scene.view_settings.exposure = opt("--exposure", -0.55)
    scene.view_settings.gamma = 1.0
    prefs = bpy.context.preferences.addons.get("cycles")
    if prefs:
        cp = prefs.preferences
        try:
            cp.compute_device_type = "METAL"
            cp.refresh_devices()
            for d in cp.devices:
                d.use = d.type == "METAL"
            if any(d.use for d in cp.devices):
                cy.device = "GPU"
                print("Cycles device: METAL GPU")
        except Exception as exc:  # noqa: BLE001
            print("Cycles GPU unavailable, CPU fallback:", exc)


def render_views(cam: bpy.types.Object, roots: dict[str, bpy.types.Object], spacing: float) -> None:
    RENDERS.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    mid_z = 0.078
    for view in VIEWS:
        for r in roots.values():
            hide_tree(r, False)
        if view == "pair":
            aim(cam, (0, 0, mid_z), 0.78, 22, 14, 65)
            scene.render.resolution_x, scene.render.resolution_y = int(SIZE * 1.5), SIZE
        else:
            key, _, angle = view.partition("_")
            for k, r in roots.items():
                hide_tree(r, k != key)
            x = roots[key].location.x
            az = {"front": 20, "side": 80, "back": 170, "face": 0}.get(angle, 20)
            aim(cam, (x, 0, mid_z), 0.5, az, 10, 70)
            scene.render.resolution_x = scene.render.resolution_y = SIZE
        scene.render.filepath = str(RENDERS / f"{view}.png")
        print("Rendering", view)
        bpy.ops.render.render(write_still=True)
    for r in roots.values():
        hide_tree(r, False)
    aim(cam, (0, 0, mid_z), 0.78, 22, 14, 65)
    scene.render.resolution_x, scene.render.resolution_y = int(SIZE * 1.5), SIZE


# --------------------------------------------------------------------------- main


def main() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.save_version = 0  # no .blend1 next to the output
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "CENTIMETERS"

    spacing = 0.105
    violet = build_plush("violet", with_tuft=False)
    pink = build_plush("pink", with_tuft=True)
    violet.location = (-spacing, 0, 0)
    pink.location = (spacing, 0, 0)
    pink.rotation_euler = (0, 0, math.radians(-8))
    violet.rotation_euler = (0, 0, math.radians(10))

    cam = studio()
    setup_render()
    aim(cam, (0, 0, 0.078), 0.78, 22, 14, 65)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND), compress=True)
    faces = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == "MESH")
    print(f"Saved {BLEND} ({faces} base faces, {len(bpy.data.objects)} objects)")

    if RENDER:
        render_views(cam, {"violet": violet, "pink": pink}, spacing)
        bpy.ops.wm.save_as_mainfile(filepath=str(BLEND), compress=True)


if __name__ == "__main__":
    main()
