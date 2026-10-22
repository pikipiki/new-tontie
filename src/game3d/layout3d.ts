/**
 * 3D board layout (public barrel). Implementation split under `./layout/` by concern.
 */
export {
  BOARD_DEPTH,
  BOARD_SURFACE_Y,
  BOARD_WIDTH,
  HOLE_TAP_DEPTH,
  HOLE_TAP_WIDTH,
  holeWorldPosition,
} from '@game3d/layout/board'

export {
  MOB_TILT_X,
  MOLE_HIDE_DEPTH,
  MOLE_TOP_SINK,
  moleLiftWorld,
} from '@game3d/layout/board'

export {
  HAMMER_HEAD_HALF_HEIGHT,
  HAMMER_IMPACT_T,
  HAMMER_LANE_Z,
  HAMMER_REACH,
  hammerSwing,
  PLAYER_HOVER,
  PLAYER_SHOULDER,
  PLAYER_YAW,
  strikePose,
  type StrikePose,
} from '@game3d/layout/hammer'

export {
  BASE_FOV,
  CAMERA_POSITION,
  CAMERA_TARGET,
  cameraFit,
  sceneCameraView,
} from '@game3d/layout/camera'

export { PINK_LEDGE_POSITION, PINK_LEDGE_SCALE } from '@game3d/layout/board'
