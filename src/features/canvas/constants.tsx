export let CANVAS_SLOW_DOWN_FACTOR = 10;
export const BOTTOM_TILE_HEIGHT = 50;

export function increaseSlowDownFactor() {
  CANVAS_SLOW_DOWN_FACTOR++;
}

export function decreaseSlowDownFactor() {
  CANVAS_SLOW_DOWN_FACTOR--;
}
