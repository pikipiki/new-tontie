"""
Single-sprite Blender export (same pipeline as batch_export).

  blender --background --python scripts/blender/sprite_retopo.py -- \
    public/game/sprites/mobs/14.png public/game/models/mobs/14.glb
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts/blender"))

from batch_export import MOB_DEPTH, TARGET_MOB_HEIGHT, export_sprite_glb  # noqa: E402


def main() -> int:
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1 :]
    else:
        argv = []

    if len(argv) < 2:
        print("Usage: blender --background --python sprite_retopo.py -- <sprite.png> <out.glb>")
        return 1

    sprite = Path(argv[0]).resolve()
    out = Path(argv[1]).resolve()
    export_sprite_glb(sprite, out, MOB_DEPTH, TARGET_MOB_HEIGHT)
    print("Exported", out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
