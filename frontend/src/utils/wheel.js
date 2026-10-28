/** Canvas segments start at the right and run clockwise; the pointer is at the top. */
export function getWheelSegment(rotation, segmentCount) {
  if (!Number.isFinite(rotation) || !Number.isInteger(segmentCount) || segmentCount < 1) return 0;
  const pointerAngle = ((270 - rotation) % 360 + 360) % 360;
  return Math.min(segmentCount - 1, Math.floor(pointerAngle / (360 / segmentCount)));
}
