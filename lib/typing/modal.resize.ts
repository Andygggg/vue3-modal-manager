/**
 * modal大小
 * @property {number} width modal寬度
 * @property {number} height modal高度
 * @property {number} left 左邊距
 * @property {number} top 上邊距
 * @property {number} right 右邊距
 * @property {number} bottom 下邊距
 * @property {object} mouseLimits 滑鼠限制
 */
export interface modalSize {
  width: number
  height: number
  left: number
  top: number
  right: number
  bottom: number
  mouseLimits: {
    limitX: { min: number; max: number }
    limitY: { min: number; max: number }
    limitXY: { x: { min: number; max: number }; y: { min: number; max: number } }
  }
}

/**
 * 移動範圍
 * @property {number} min 最小值
 * @property {number} max 最大值
 */
export interface movementRange {
  min: number
  max: number
}

/**
 * 移動範圍XY
 * @property {movementRange} x X軸移動範圍
 * @property {movementRange} y Y軸移動範圍
 */
export interface movementRangeXY {
  x: movementRange
  y: movementRange
}
