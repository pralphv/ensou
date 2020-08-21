/**
 * try to destroy id first
 * if destroyed, return
 * if failed, destroy all of id_0, id_1, id_2...
 * @param layerRef canvas layer reference
 * @param id target id to destroy
 */
export function destroyCanvasNodes(layerRef: any, id: string) {
  function reallyDestroy(id: string): boolean {
    const targetNode = layerRef?.current?.findOne(`#${id}`);
    if (targetNode) {
      targetNode.destroy();
      return true
    } else {
      return false
    }
  }

  const destroyed = reallyDestroy(id);
  if (destroyed) {
    return;
  }
  for (let i = 0; i < 200; i++) {
    reallyDestroy(`${id}_${i}`);
  }
}
