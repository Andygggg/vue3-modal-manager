import { createVNode, render } from 'vue'
import { ModalResize } from '../features/ModalResize'
import { ModalDrag } from '../features/ModalDrag'

import type { App, AppContext } from 'vue'
import type {
  modalRouter,
  modalInfo,
  fixedModalParams,
  draggableModalParams,
  modalResponse,
  modalMode,
  modalParamsMap,
  modalDirection,
  modalPosition,
} from '../types'

/**
 * ModalManager - modal管理器核心類
 *
 * @description
 * 這個類是整個modal系統的核心管理器，負責modal的創建、管理和銷毀：
 * - 支援兩種模式：固定modal(fixed) 和 可拖拽modal(draggable)
 * - 提供完整的生命週期管理和Vue.js整合
 * - 智慧的層級管理和容器定位功能
 *
 * @features
 * ✅ 雙模式支援 (fixed/draggable)
 * ✅ 類型安全的方法重載
 * ✅ Vue.js 插件整合
 * ✅ 動態層級管理 (z-index)
 * ✅ 容器間移動功能
 * ✅ 完整資源清理
 * ✅ 路由式組件載入
 * ✅ 自訂事件支援
 *
 * @modes
 * - fixed: 固定位置modal，帶遮罩層
 * - draggable: 可拖拽modal，支援拖拽和調整大小
 */

export class ModalManager {
  public static modalManager: ModalManager //ModalManager物件
  public appContext: AppContext | null //vue生成資訊
  private modalRoutes: Array<modalRouter> //modal rotes
  private ModalList: Map<string, modalInfo> //modal 管理列表
  private baseZIndex: number = 1000 //z-index 預設值

  /**
   * 初始化函數
   * @param options modal router
   */
  constructor(options: Array<modalRouter>) {
    this.modalRoutes = options
    this.ModalList = new Map()
    this.appContext = null
  }

  install(app: App) {
    // vue初始化app生成管理器
    app.config.globalProperties.$modalManager = this
    app.provide('modalManager', this)

    const originalMount = app.mount
    app.mount = (...args) => {
      const vm = originalMount.call(app, ...args)

      setTimeout(() => {
        if (app._container && app._container._vnode) {
          this.appContext = app._container._vnode.appContext
          // console.log('Modal Manager: AppContext has been set')
        } else {
          console.warn('Modal Manager: Unable to get appContext')
        }
      }, 0)

      return vm
    }
  }

  //==========================================創建modal外層元素===================================================
  /**
   * 建立modal ID
   * @param name modal元件名稱
   * @returns modal ID
   */
  private generateId(name: string): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `${name}-${timestamp}-${random}`
  }

  /**
   * 建立modal div(固定)元素
   * @param modalId modal ID
   * @param direction 方位
   * @returns HTMLDivElement
   */
  private createDivByFixed(modalId: string, direction: modalDirection = 'center'): HTMLDivElement {
    const container = document.createElement('div')
    container.setAttribute('data-modalId', modalId)
    container.style.position = 'fixed'
    container.style.zIndex = '1000'
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.display = 'flex'
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'

    // 根據direction選擇對應的樣式
    this.applyFixedModalStyles(container, direction)
    return container
  }

  /**
   * modal div(固定)樣式
   */
  private applyFixedModalStyles(container: HTMLElement, direction: modalDirection): void {
    const styleMap: Record<modalDirection, Partial<CSSStyleDeclaration>> = {
      center: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        alignItems: 'center',
        justifyContent: 'center',
      },
      top: {
        top: '0',
        left: '0',
        alignItems: 'flex-start',
        justifyContent: 'center',
      },
      bottom: {
        top: '0',
        left: '0',
        alignItems: 'flex-end',
        justifyContent: 'center',
      },
      left: {
        top: '0',
        left: '0',
        alignItems: 'center',
        justifyContent: 'flex-start',
      },
      right: {
        top: '0',
        left: '0',
        alignItems: 'center',
        justifyContent: 'flex-end',
      },
    }

    const styles = styleMap[direction]
    if (styles) {
      Object.assign(container.style, styles)
    }
  }

  /**
   * 建立modal div(拖拽)元素
   */
  private createDivByDraggable(modalId: string, position?: modalPosition): HTMLElement {
    const container = document.createElement('div')

    container.setAttribute('data-modalId', modalId)
    container.style.position = 'absolute'
    container.style.zIndex = `${this.baseZIndex + this.ModalList.size}`
    container.style.width = 'max-content'
    container.style.height = 'max-content'

    // 根據position選擇對應的樣式
    if (position) {
      this.applyCustomPosition(container, position)
    } else {
      this.applyCenterPosition(container)
    }

    return container
  }

  /**
   * modal div(拖拽)樣式-自訂義position
   */
  private applyCustomPosition(container: HTMLElement, position: modalPosition): void {
    container.style.top = position.top ?? 'auto'
    container.style.bottom = position.bottom ?? 'auto'
    container.style.left = position.left ?? 'auto'
    container.style.right = position.right ?? 'auto'
    container.style.transform = ''
  }

  /**
   * modal div(拖拽)樣式-置中
   */
  private applyCenterPosition(container: HTMLElement): void {
    const centerX = window.scrollX + window.innerWidth / 2
    const centerY = window.scrollY + window.innerHeight / 2
    container.style.left = `${centerX}px`
    container.style.top = `${centerY}px`
    container.style.transform = 'translate(-50%, -50%)'
  }

  //==========================================開啟 modal===================================================

  /**
   * 打開modal
   * @param name modal route名稱
   * @param mode fixed(固定) draggable(拖曳)
   * @param params 根據mode載入對應的參數配置
   * @returns success:建立狀態 msg:描述 modalId: modal ID
   */
  public async openModal(
    name: string,
    mode: 'fixed',
    params?: fixedModalParams,
  ): Promise<modalResponse>

  public async openModal(
    name: string,
    mode: 'draggable',
    params?: draggableModalParams,
  ): Promise<modalResponse>

  public async openModal<T extends modalMode>(
    name: string,
    mode: T,
    params?: modalParamsMap[T],
  ): Promise<modalResponse> {
    // console.log(`Opening ${mode} modal: ${name}`)

    try {
      if (mode === 'fixed') {
        //fixed(固定)
        const fixedParams = params as fixedModalParams
        return await this.createFixedModal(name, fixedParams)
      } else if (mode === 'draggable') {
        //draggable(拖曳)
        const draggableParams = params as draggableModalParams
        return await this.createDraggableModal(name, draggableParams)
      } else {
        throw new Error(`Unsupported modal mode: ${mode}`)
      }
    } catch (error) {
      console.error(`Failed to load modal ${name}:`, error)
      return { success: false, msg: 'Failed to load modal', modalId: '' }
    }
  }

  /**
   * 建立modal(固定)
   * @param name modal route名稱
   * @param params 配置參數
   * @returns
   */
  private async createFixedModal(name: string, params?: fixedModalParams): Promise<modalResponse> {
    // 1. 查找路由
    const router = this.modalRoutes.find((item) => item.name === name)
    if (!router) {
      console.error(`Modal ${name} not found`)
      return { success: false, msg: 'not found Modal', modalId: '' }
    }

    try {
      // 2. 創建容器和ID
      const modalId = this.generateId(name)
      const container = this.createDivByFixed(modalId, params?.direction || 'center')

      // 3. 處理容器載入
      const success = this.mountContainer(container, params?.id)
      if (!success) {
        return { success: false, msg: 'Failed to mount container', modalId: '' }
      }

      // 4. 記錄modal info
      const box = params?.id ? document.getElementById(params.id) : null
      this.ModalList.set(modalId, {
        id: modalId,
        container,
        name,
        boxElement: box || document.body,
      })

      // 5. 渲染组件
      const renderSuccess = await this.renderComponent(router, modalId, params)
      if (!renderSuccess) {
        this.cleanupFailedModal(modalId)
        return { success: false, msg: 'Failed to render component', modalId: '' }
      }

      return { success: true, msg: 'success', modalId }
    } catch (error) {
      console.error(`Failed to load modal ${name}:`, error)
      return { success: false, msg: 'Failed to load modal', modalId: '' }
    }
  }

  /**
   * 建立modal(拖曳)
   * @param name modal route名稱
   * @param params 配置參數
   * @returns
   */
  private async createDraggableModal(
    name: string,
    params?: draggableModalParams,
  ): Promise<modalResponse> {
    // 1. 查找路由
    const router = this.modalRoutes.find((item) => item.name === name)
    if (!router) {
      console.error(`Modal ${name} not found`)
      return { success: false, msg: 'not found Modal', modalId: '' }
    }

    try {
      // 2. 創建容器和ID
      const modalId = this.generateId(name)
      const container = this.createDivByDraggable(modalId, params?.position)
      // 點選容器置頂功能
      container.addEventListener('click', () => this.bringToFront(modalId))

      // 3. 處理容器載入
      const success = this.mountContainer(container, params?.id, params?.position)
      if (!success) {
        return { success: false, msg: 'Failed to mount container', modalId: '' }
      }

      // 4. 記錄modal info
      const box = params?.id ? document.getElementById(params.id) : null
      this.ModalList.set(modalId, {
        id: modalId,
        container,
        name,
        boxElement: box || document.body,
      })

      // 5. 渲染组件
      const renderSuccess = await this.renderComponent(router, modalId, params)
      if (!renderSuccess) {
        this.cleanupFailedModal(modalId)
        return { success: false, msg: 'Failed to render component', modalId: '' }
      }

      // 6. 設置拖拽和調整大小功能
      await this.setupDraggableModalFeatures(modalId, params)

      return { success: true, msg: 'success', modalId }
    } catch (error) {
      console.error(`Failed to load modal ${name}:`, error)
      return { success: false, msg: 'Failed to load modal', modalId: '' }
    }
  }

  /**
   * 掛載容器至指定元素位置
   */
  private mountContainer(
    container: HTMLElement,
    targetId?: string,
    position?: modalPosition,
  ): boolean {
    try {
      const box = targetId ? document.getElementById(targetId) : null
      if (box) {
        box.style.position = 'relative'
        box.appendChild(container)
      } else {
        document.body.appendChild(container)
      }

      if (position) {
        this.applyCustomPosition(container, position)
      } else {
        container.style.top = '50%'
        container.style.left = '50%'
        container.style.transform = 'translate(-50%, -50%)'
      }

      return true
    } catch (error) {
      console.error('Failed to mount container:', error)
      return false
    }
  }

  /**
   * 渲染组件
   */
  private async renderComponent(
    router: modalRouter,
    modalId: string,
    params?: fixedModalParams | draggableModalParams,
  ): Promise<boolean> {
    try {
      // 1. 載入組件
      const moduleComponent = await router.component()
      const component = this.extractComponent(moduleComponent)

      if (!component) {
        throw new Error('Failed to extract component from module')
      }

      // 2. 設定props和事件
      const eventProps = this.buildEventProps(modalId, params)

      // 3. 創建和渲染組件
      const currentModal = this.ModalList.get(modalId)
      if (!currentModal) return false

      const vnode = createVNode(component, eventProps)
      if (this.appContext) vnode.appContext = this.appContext
      render(vnode, currentModal.container)

      return true
    } catch (error) {
      console.error('Failed to load and render component:', error)
      return false
    }
  }

  /**
   * 提取組件
   */
  private extractComponent(moduleComponent: any): any {
    if (moduleComponent?.default) {
      return moduleComponent.default
    }

    if (this.isValidComponent(moduleComponent)) {
      return moduleComponent
    }

    return null
  }

  /**
   * 检查是否為有效组件
   */
  private isValidComponent(component: any): boolean {
    return (
      typeof component === 'function' ||
      (component &&
        typeof component === 'object' &&
        (component.render || component.template || component.setup))
    )
  }

  /**
   * 添加props參數 emit事件
   */
  private buildEventProps(
    modalId: string,
    params?: fixedModalParams | draggableModalParams,
  ): Record<string, any> {
    const eventProps: Record<string, any> = {
      ...params?.props,
      modalId,
      onClosed: () => this.closeModal(modalId),
    }

    // 添加自訂事件
    if (params?.events) {
      Object.entries(params.events).forEach(([eventName, handler]) => {
        const formattedEventName = `on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`
        eventProps[formattedEventName] = handler
      })
    }

    return eventProps
  }

  /**
   * 設置modal(拖曳)可選功能
   */
  private async setupDraggableModalFeatures(
    modalId: string,
    params?: draggableModalParams,
  ): Promise<void> {
    const currentModal = this.ModalList.get(modalId)
    if (!currentModal || !params) return

    try {
      // 設置拖拽功能
      if (params.drag) currentModal.drag = new ModalDrag(currentModal)

      // 設置調整大小功能
      if (params.resize) currentModal.resize = new ModalResize(currentModal)
    } catch (error) {
      console.error(`Failed to setup draggable features for modal ${modalId}:`, error)
    }
  }

  /**
   * 清除建置失败的modal
   */
  private cleanupFailedModal(modalId: string): void {
    const modal = this.ModalList.get(modalId)
    if (modal) {
      // 清理DOM
      if (modal.container.parentNode) {
        modal.container.parentNode.removeChild(modal.container)
      }

      // 清理功能殘留
      if (modal.drag) modal.drag.destroy?.()

      if (modal.resize) modal.resize.destroy?.()

      // 管理列表移除物件
      this.ModalList.delete(modalId)
    }
  }

  //==========================================關閉modal===================================================
  /**
   * 關閉modal
   * @param modalId modal Id
   * @returns 返回结果
   */
  public closeModal(modalId: string): boolean {
    //1.查找modal
    const currentModal = this.ModalList.get(modalId)
    if (!currentModal) {
      console.warn(`Modal ${modalId} not found`)
      return false
    }

    try {
      //2.清理功能殘留
      if (currentModal.drag) currentModal.drag.destroy?.()
      if (currentModal.resize) currentModal.resize.destroy?.()

      //3.清理渲染
      render(null, currentModal.container)

      //4.移除容器
      if (currentModal.container.parentNode) {
        currentModal.container.parentNode.removeChild(currentModal.container)
      }

      //5.判斷目前容器是否還有其他modal，沒有的話才移除容器的position
      const hasModal = currentModal.boxElement.querySelectorAll('div[data-modalId]')

      if (hasModal.length === 0) {
        currentModal.boxElement.style.position = ''
      }

      //6.從列表中移除
      this.ModalList.delete(modalId)

      return true
    } catch (error) {
      console.error(`Failed to close modal ${modalId}:`, error)
      return false
    }
  }

  /**
   * 關閉所有modal
   * @returns 返回關閉数量
   */
  public removeAllModal(): number {
    const keys = [...this.ModalList.values()]
    let closedCount = 0

    keys.forEach((item) => {
      if (this.closeModal(item.id)) {
        closedCount++
      }
    })

    console.log(`%c 移除了 ${closedCount} 個modal`, 'color: green; font-size: 14px')
    return closedCount
  }

  //==========================================modal位置===================================================
  /**
   * 移動視窗至指定容器
   * @param modalId
   * @param target
   * @returns 返回結果
   */
  public moveToLayers(modalId: string, target: string): boolean {
    //1.查找modal
    const currentModal = this.ModalList.get(modalId)
    if (!currentModal) {
      console.warn(`Modal ${modalId} not found`)
      return false
    }

    //2.獲取新的容器
    const layers = document.getElementById(target) as HTMLDivElement
    if (!layers) {
      console.warn(`Target container ${target} not found`)
      return false
    }

    try {
      //3.移動至新容器置中
      currentModal.boxElement.style.position = ''
      layers.style.position = 'relative'
      layers.appendChild(currentModal.container)
      // 重新居中
      this.applyCenterPosition(currentModal.container)

      //4.更新modalList的容器資訊
      currentModal.boxElement = layers

      //5.更新功能实綁定
      if (currentModal.resize) {
        currentModal.resize.setCurrentModal(currentModal)
      }
      if (currentModal.drag) {
        currentModal.drag.setCurrentModal(currentModal)
      }

      return true
    } catch (error) {
      console.error(`Failed to move modal ${modalId} to ${target}:`, error)
      return false
    }
  }

  /**
   * 計算modal元件階層
   * @param modalId modal Id
   * @returns 返回結果
   */
  private bringToFront(modalId: string): boolean {
    //1.查找modal
    const currentModal = this.ModalList.get(modalId)
    if (!currentModal) return false

    //2.判斷當前 modal 是否在最上層
    const currentZIndex = parseInt(currentModal.container.style.zIndex)
    const highestZIndex = this.baseZIndex + this.ModalList.size
    if (currentZIndex >= highestZIndex) return false // 🔧 已经在最上层

    //3.調整所有 modal z-index
    this.ModalList.forEach((modal) => {
      const modalZIndex = parseInt(modal.container.style.zIndex)
      if (modal.id === modalId) {
        // 將當前點擊的 modal 設置為最高層
        modal.container.style.zIndex = `${highestZIndex}`
      } else if (modalZIndex > currentZIndex) {
        // 將其他較高層的 modal 降低一層
        modal.container.style.zIndex = `${modalZIndex - 1}`
      }
    })

    return true
  }

  //==========================================工具方法===================================================

  /**
   * 已開啟的modal狀態列表
   */
  public getOpenModals(): modalInfo[] {
    return Array.from(this.ModalList.values())
  }

  /**
   * 檢查modal是否存在
   */
  public hasModal(modalId: string): boolean {
    return this.ModalList.has(modalId)
  }

  /**
   * 已開啟modal數量
   */
  public getModalCount(): number {
    return this.ModalList.size
  }
}

/**
 * 建置modal route
 * @param options route
 * @returns ModalManager物件
 */
export const createModalManager = (options: Array<modalRouter>): ModalManager => {
  const instance = new ModalManager(options)
  ModalManager.modalManager = instance
  return instance
}

export const useModalManager = () => {
  const modalManager = ModalManager.modalManager
  if (!modalManager) {
    throw new Error('Modal Manager not initialized. Call createModalManager first.')
  }
  return modalManager
}
