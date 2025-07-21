import type { Component } from "vue"
import type {ModalResize} from '../features/ModalResize'
import type { ModalDrag } from "lib/features/ModalDrag"

/**
 * modal路由
 * @property {string} name modal名稱
 * @property {() => Promise<Component>} component modal元件
 */
export interface modalRouter {
  name: string
  component: () => Promise<{ default: Component }>  // 明确指定有 default 属性
}

/**
 * modal資訊
 * @property {string} id modal ID
 * @property {string} name modal名稱
 * @property {HTMLElement} container modal容器
 * @property {HTMLElement} boxElement modal容器父元素
 */
export interface modalInfo {
  id: string
  name: string
  container: HTMLElement
  boxElement: HTMLElement
  resize?: ModalResize | null
  drag?: ModalDrag | null
}

/**
 * modal參數
 * @property {string} id modal ID
 * @property {Record<string, any>} props modal參數
 * @property {Record<string, (...args: any[]) => void>} events modal事件
 */
interface baseModalParams {
  id?: string
  props?: Record<string, any>
  events?: Record<string, (...args: any[]) => void>
}

/**
 * Modal模式
 */
export type modalMode = 'fixed' | 'draggable'

/**
 * 根据模式获取对应的参数类型
 */
export type modalParamsMap = {
  fixed: fixedModalParams
  draggable: draggableModalParams
}

/**
 * 固定modal位置类型
 */
export type modalDirection = 'center' | 'top' | 'bottom' | 'left' | 'right'

/**
 * 創建位置 (用于拖拽modal)
 * @property {string} left 左邊距
 * @property {string} right 右邊距
 * @property {string} top 上邊距
 * @property {string} bottom 下邊距
 */
export interface modalPosition {
  left?: string
  right?: string
  top?: string
  bottom?: string
}

/**
 * 固定modal参数
 */
export interface fixedModalParams extends baseModalParams {
  direction?: modalDirection
}

/**
 * 拖拽modal参数
 */
export interface draggableModalParams extends baseModalParams {
  drag?: boolean
  resize?: boolean
  position?: modalPosition
}

/**
 * 开启Modal的响应类型
 */
export interface modalResponse {
  success: boolean
  msg: string
  modalId: string
}
