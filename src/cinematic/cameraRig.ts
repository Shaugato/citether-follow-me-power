import type { Camera } from "three";
import { Vector3 } from "three";
import type { CameraKeyframe } from "./beats";

export interface CameraRigState {
  px: number;
  py: number;
  pz: number;
  tx: number;
  ty: number;
  tz: number;
}

export function createCameraRig(camera: Camera, initial: CameraKeyframe) {
  const state: CameraRigState = {
    px: initial.position[0],
    py: initial.position[1],
    pz: initial.position[2],
    tx: initial.target[0],
    ty: initial.target[1],
    tz: initial.target[2],
  };
  const target = new Vector3();

  const apply = () => {
    camera.position.set(state.px, state.py, state.pz);
    target.set(state.tx, state.ty, state.tz);
    camera.lookAt(target);
    camera.updateMatrixWorld();
  };

  return { state, apply };
}
