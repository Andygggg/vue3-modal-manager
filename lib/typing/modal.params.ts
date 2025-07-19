import { ModalResize } from '../ModalResize'

/**
 * modal路由
 * @property {string} name modal名稱
 * @property {() => Promise<any>} component modal元件
 */
export interface ModalRouter {
  name: string
  component: () => Promise<any>
}

/**
 * modal資訊
 * @property {string} id modal ID
 * @property {string} name modal名稱
 * @property {HTMLElement} container modal容器
 * @property {HTMLElement} boxElement modal容器父元素
 * @property {HTMLElement} header modal標題元素
 * @property {function} handleDrag modal拖曳事件
 * @property {ModalResize} resize modal調整大小
 */
export interface modalInfo {
  id: string
  name: string
  container: HTMLElement
  boxElement: HTMLElement
  header?: HTMLElement
  handleDrag?: (e: MouseEvent) => void
  resize?: ModalResize | null
}

/**
 * modal參數
 * @property {boolean} drag 是否啟用拖曳功能
 * @property {string} id modal ID
 * @property {createPosition} position modal位置（僅用於懸浮模式）
 * @property {fixedModalPosition} fixedPosition 固定視窗位置（僅用於固定模式）
 * @property {Record<string, any>} props modal參數
 * @property {Record<string, (...args: any[]) => void>} events modal事件
 * @property {boolean} resize 是否啟用調整大小功能
 */
export interface modalParams {
  id?: string
  drag?: boolean
  resize?: boolean
  position?: createPosition
  fixedPosition?: fixedModalPosition
  props?: Record<string, any>
  events?: Record<string, (...args: any[]) => void>
}

/**
 * 創建位置
 * @property {string} left 左邊距
 * @property {string} right 右邊距
 * @property {string} top 上邊距
 * @property {string} bottom 下邊距
 */
export interface createPosition {
  left?: string
  right?: string
  top?: string
  bottom?: string
}

/**
 * 固定視窗位置類型
 */
export type fixedModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'

/**
 * 移動位置
 * @property {number} initialMouseX 滑鼠初始X座標
 * @property {number} initialMouseY 滑鼠初始Y座標
 * @property {number} initialModalX modal初始X座標
 * @property {number} initialModalY modal初始Y座標
 */
export interface movingPosition {
  initialMouseX: number
  initialMouseY: number
  initialModalX: number
  initialModalY: number
}
