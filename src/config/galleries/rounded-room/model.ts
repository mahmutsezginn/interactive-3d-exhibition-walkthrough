import type { Vector3Tuple } from "@/features/navigation/navigation-types";

const GALLERY_MODEL_REVISION = "v2";

export const GALLERY_MODEL_OBJ_URL =
  `/galleries/rounded-room/gallery.obj?revision=${GALLERY_MODEL_REVISION}`;
export const GALLERY_MODEL_MATERIAL_URL =
  `/galleries/rounded-room/gallery.mtl?revision=${GALLERY_MODEL_REVISION}`;
export const GALLERY_MODEL_POSITION = [
  -15.46196045,
  0,
  -12.36032593,
] as const satisfies Vector3Tuple;
export const GALLERY_MODEL_SCALE = 0.01;
