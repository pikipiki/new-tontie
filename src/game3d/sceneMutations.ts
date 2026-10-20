import {
  Color,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  type Camera,
  type Object3D,
  type Vector3,
} from 'three'

/**
 * Imperative Three.js updates kept outside components: scene objects are mutable by design,
 * and per-frame writes must not go through React state.
 */

export function findNodesByPrefix(root: Object3D, prefix: string): Object3D[] {
  const found: Object3D[] = []
  root.traverse((o) => {
    if (o.name.startsWith(prefix)) found.push(o)
  })
  return found
}

export function setNodesScaleY(nodes: readonly Object3D[], y: number): void {
  for (const n of nodes) n.scale.y = y
}

/** Damage-state variants baked in the GLB: `Intact*` nodes before the first hit, `Damaged*` after. */
export function showDamageState(root: Object3D, damaged: boolean): void {
  root.traverse((o) => {
    if (o.name.startsWith('Intact')) o.visible = !damaged
    else if (o.name.startsWith('Damaged')) o.visible = damaged
  })
}

/** Recolours matching meshes; metallic tints get a faint self-glow in place of PBR reflections. */
export function tintMeshesByPrefix(
  root: Object3D,
  prefix: string,
  color: string,
  metalness: number,
): void {
  const tint = new Color(color)
  root.traverse((o) => {
    if (
      o instanceof Mesh &&
      o.name.startsWith(prefix) &&
      o.material instanceof MeshLambertMaterial
    ) {
      o.material.color.copy(tint)
      o.material.emissive.copy(tint).multiplyScalar(metalness * 0.25)
    }
  })
}

export function frameCamera(
  camera: Camera,
  fov: number,
  position: Vector3,
  target: Vector3,
): void {
  if (camera instanceof PerspectiveCamera && camera.fov !== fov) {
    camera.fov = fov
    camera.updateProjectionMatrix()
  }
  camera.position.copy(position)
  camera.lookAt(target)
}
