import {
  Color,
  Mesh,
  MeshStandardMaterial,
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
  root.traverse((node) => {
    if (node.name.startsWith(prefix)) found.push(node)
  })
  return found
}

export function setNodesScaleY(
  nodes: readonly Object3D[],
  scaleY: number,
): void {
  for (const node of nodes) node.scale.y = scaleY
}

/** Damage-state variants baked in the GLB: `Intact*` nodes before the first hit, `Damaged*` after. */
export function showDamageState(root: Object3D, damaged: boolean): void {
  root.traverse((node) => {
    if (node.name.startsWith('Intact')) node.visible = !damaged
    else if (node.name.startsWith('Damaged')) node.visible = damaged
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
  root.traverse((node) => {
    if (
      node instanceof Mesh &&
      node.name.startsWith(prefix) &&
      node.material instanceof MeshStandardMaterial
    ) {
      node.material.color.copy(tint)
      node.material.metalness = metalness
      node.material.roughness = metalness > 0 ? 0.28 : 0.85
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
