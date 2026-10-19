# Mesh pipeline

**Preferred:** Blender batch export (board, holes, hammer, all mobs):

```bash
brew install --cask blender   # once
npm run mesh:blender
```

Script: `scripts/blender/batch_export.py`

**Fallback** (no Blender): Python trimesh extrusion:

```bash
python3 -m venv scripts/mesh-pipeline/.venv
scripts/mesh-pipeline/.venv/bin/pip install -r scripts/mesh-pipeline/requirements.txt
npm run mesh:mobs
```

Outputs land in `public/game/models/` and `reference/models.manifest.json`.
