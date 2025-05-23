import { createVNode, render } from 'vue'
import { ModalResize } from './ModalResize'

import type { App, AppContext } from 'vue'
import type { ModalRouter, modalInfo, modalParams, createPosition, movingPosition } from './typing'

enum ModalType {
  FIXED, // 固定modal
  DRAGGABLE, // 可拖曳modal
}
export class ModalManager {
  public static modalManager: ModalManager
  public appContext: AppContext | null
  private modalRoutes: Array<ModalRouter>
  private ModalList: Map<string, modalInfo>
  private baseZIndex: number = 1000
  private movingModalId: string
  private initPosition: movingPosition

  constructor(options: Array<ModalRouter>) {
    this.modalRoutes = options
    this.ModalList = new Map()
    this.appContext = null
    this.movingModalId = ''
    this.initPosition = {} as movingPosition
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
   * @returns HTMLDivElement
   */
  private createDivByFixed(modalId: string): HTMLDivElement {
    const container = document.createElement('div')
    container.setAttribute('data-modalId', modalId)
    container.style.position = 'fixed'
    container.style.zIndex = '1000'
    container.style.top = '50%'
    container.style.left = '50%'
    container.style.transform = 'translate(-50%, -50%)'
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.display = 'flex'
    container.style.alignItems = 'center'
    container.style.justifyContent = 'center'
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'
    return container
  }

  /**
   * 建立modal div(懸浮)元素
   * @param modalId modal ID
   * @returns HTMLDivElement
   */
  private createDraggableDiv(modalId: string): HTMLDivElement {
    const container = document.createElement('div')
    // 計算畫面中心（加上滾動量）
    const centerX = window.scrollX + window.innerWidth / 2
    const centerY = window.scrollY + window.innerHeight / 2

    container.setAttribute('data-modalId', modalId)
    container.style.position = 'absolute'
    container.style.zIndex = `${this.baseZIndex + this.ModalList.size}`
    // 設定 top/left 為中心點
    container.style.left = `${centerX}px`
    container.style.top = `${centerY}px`
    container.style.transform = 'translate(-50%, -50%)'
    container.style.width = 'max-content'
    container.style.height = 'max-content'
    container.style.borderRadius = '10px'
    container.style.boxShadow =
      'rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px'
    return container
  }

  //==========================================開啟 modal===================================================

  /**
   * 打開固定位置的視窗
   * @param name modal 名稱
   * @param params modal 參數
   * @returns 回傳一個包含結果資訊的 Promise：
   * - `success`：是否成功開啟
   * - `msg`：訊息
   * - `modalId`：此 modal 的唯一 ID
   */
  public async openModal(
    name: string,
    params?: modalParams,
  ): Promise<{ success: boolean; msg: string; modalId: string }> {
    return this.createModal(name, ModalType.FIXED, params)
  }

  /**
   * 打開可拖動的視窗
   * @param name modal 名稱
   * @param params modal 參數
   * @returns 回傳一個包含結果資訊的 Promise：
   * - `success`：是否成功開啟
   * - `msg`：訊息
   * - `modalId`：此 modal 的唯一 ID
   */
  public async openPopover(
    name: string,
    params?: modalParams,
  ): Promise<{ success: boolean; msg: string; modalId: string }> {
    // 檢查是否已存在相同名稱的模態框
    const existingModal = [...this.ModalList.values()].find((router) => router.name === name)
    if (existingModal) {
      console.warn(`Modal ${name} is existing`)
      return { success: false, msg: `Modal ${name} is existing`, modalId: '' }
    }

    return this.createModal(name, ModalType.DRAGGABLE, params)
  }

  /**
   * 打開可拖動的視窗(多)
   * @param name modal 名稱
   * @param params modal 參數
   * @returns 回傳一個包含結果資訊的 Promise：
   * - `success`：是否成功開啟
   * - `msg`：訊息
   * - `modalId`：此 modal 的唯一 ID
   */
  public async openPopovers(
    name: string,
    params?: modalParams,
  ): Promise<{ success: boolean; msg: string; modalId: string }> {
    return this.createModal(name, ModalType.DRAGGABLE, params)
  }

  private async createModal(
    name: string,
    type: ModalType,
    params?: modalParams,
  ): Promise<{ success: boolean; msg: string; modalId: string }> {
    // 1. 查找路由
    const router = this.modalRoutes.find((item) => item.name === name)
    if (!router) {
      console.error(`Modal ${name} not found`)
      return { success: false, msg: 'not found Modal', modalId: '' }
    }

    try {
      // 2. 創建容器和ID
      const modalId = this.generateId(name)

      // 根據類型創建不同的容器
      const container =
        type === 0 ? this.createDivByFixed(modalId) : this.createDraggableDiv(modalId)

      // 3. 處理容器的附加位置
      const box = params?.id ? document.getElementById(params.id) : null
      if (box) {
        box.style.position = 'relative'
        box.appendChild(container)
      } else {
        document.body.appendChild(container)
      }

      // 4. 記錄模態框信息
      this.ModalList.set(modalId, {
        id: modalId,
        container,
        name,
        boxElement: box ? box : document.body,
      })

      // 5. 載入組件
      const moduleComponent = await router.component()
      const component = moduleComponent.default

      // 6. 設定props和事件
      const eventProps: Record<string, any> = {
        ...params?.props,
        modalId,
        onClosed: () => this.closeModal(modalId),
      }

      // 添加自訂事件
      if (params?.events) {
        Object.entries(params.events).forEach(([eventName, handler]) => {
          // 將事件名格式化為 Vue 事件格式 (on + 首字母大寫)
          const formattedEventName = `on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`
          eventProps[formattedEventName] = handler
        })
      }

      // 7. 創建和渲染組件
      const vnode = createVNode(component, eventProps)
      if (this.appContext) vnode.appContext = this.appContext
      render(vnode, container)

      // 8. 處理拖拽和位置（僅適用於DRAGGABLE類型）
      if (type === 1) {
        const isDrag = params?.drag ?? false
        if (isDrag) this.bindDrag(modalId)

        const position = params?.position ?? null
        if (position) this.setPosition(modalId, position)

        const isResize = Boolean(params?.resize)
        if (isResize) {
          const currentModal = this.ModalList.get(modalId)
          if (currentModal) {
            currentModal.resize = new ModalResize(currentModal)
            currentModal.resize.bindResize(modalId)
          }
        }
      }

      return { success: true, msg: 'success', modalId }
    } catch (error) {
      console.error(`Failed to load modal ${name}:`, error)
      return { success: false, msg: 'Failed to load modal', modalId: '' }
    }
  }

  //==========================================關閉modal===================================================
  /**
   * 關閉modal
   * @param modalId modal Id
   * @returns
   */
  public closeModal(modalId: string) {
    //1.查找modal
    const currentModal = this.ModalList.get(modalId)
    if (!currentModal) return

    //2.清理渲染
    render(null, currentModal.container)
    //3.移除容器
    if (currentModal.container.parentNode) {
      currentModal.container.parentNode.removeChild(currentModal.container)
    }

    //4.判斷目前容器是否還有其他modal，沒有的話才移除容器的position
    const hasModal = currentModal.boxElement.querySelectorAll('div[data-modalId]')
    if (hasModal.length === 0) currentModal.boxElement.style.position = ''

    //5.從列表中移除
    this.ModalList.delete(modalId)
  }

  /**
   * 關閉所有modal
   */
  public removeAllModal() {
    const keys = [...this.ModalList.values()]

    keys.forEach((item) => {
      this.closeModal(item.id)
    })

    console.log(`%c 移除所有modal`, 'color: green; font-size: 14px')
  }

  //==========================================modal拖曳功能===================================================
  /**
   * 綁定拖曳功能
   * modal元件需在拖曳處加上modalDraggableArea='modalId'
   * @param modalId modal Id
   * @returns
   */
  public bindDrag(modalId: string) {
    //1.查找modal
    const currentModal = this.ModalList.get(modalId)
    if (!currentModal) return

    //2.綁定該modal拖曳處
    currentModal.header = currentModal.container.querySelector(
      `[modalDraggableArea = ${modalId}]`,
    ) as HTMLElement
    currentModal.header.style.cursor = 'move'
    //3.綁定滑鼠按住監聽
    if (!currentModal.handleDrag) currentModal.handleDrag = (e) => this.startDrag(e, modalId)
    currentModal.header.addEventListener('mousedown', currentModal.handleDrag)
  }

  /**
   * 解除拖曳功能
   * @param modalId modal Id
   * @returns
   */
  public unbindDrag(modalId: string) {
    //1.查找modal
    const currentModal = this.ModalList.get(modalId)
    if (!currentModal || !currentModal.header) return

    //2.移除 cursor 樣式
    currentModal.header.style.cursor = ''

    //3.解除事件綁定
    if (currentModal.handleDrag)
      currentModal.header.removeEventListener('mousedown', currentModal.handleDrag)
  }

  /**
   * 開始拖曳
   * @param e 滑鼠事件
   * @param modalId modal Id
   * @returns
   */
  private startDrag = (e: MouseEvent, modalId: string): void => {
    //1.查找modal，並記錄當前被拖曳的modal
    this.movingModalId = modalId
    const currentModal = this.ModalList.get(this.movingModalId)
    if (!currentModal) return

    //2.將當前modal移至最上層
    this.bringToFront(modalId)
    //3.記錄初始滑鼠、modal的初始位置
    const rect = currentModal.container.getBoundingClientRect()
    this.initPosition = {
      initialMouseX: e.clientX,
      initialMouseY: e.clientY,
      initialModalX: rect.left,
      initialModalY: rect.top,
    }
    //4.綁定滑鼠移動、放開監聽
    document.addEventListener('mousemove', this.calcMouseDisplacement)
    document.addEventListener('mouseup', this.stopDrag)
    e.preventDefault()
  }

  /**
   * 計算modal元件階層
   * @param modalId modal Id
   * @returns
   */
  private bringToFront(modalId: string): void {
    //1.查找modal
    const currentModal = this.ModalList.get(modalId)
    if (!currentModal) return

    //2.判斷當前 modal 是否在最上層
    const currentZIndex = parseInt(currentModal.container.style.zIndex)
    const highestZIndex = this.baseZIndex + this.ModalList.size
    if (currentZIndex === highestZIndex) return

    //3.調整所有 modal z-index
    this.ModalList.forEach((modal) => {
      const modalZIndex = parseInt(modal.container.style.zIndex)
      if (modal.id === modalId) {
        // 將當前點擊的 modal 設置為最高層
        modal.container.style.zIndex = `${highestZIndex}`
        modal.container.style.boxShadow =
          'rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px'
      } else if (modalZIndex > currentZIndex) {
        // 將其他較高層的 modal 降低一層
        modal.container.style.zIndex = `${modalZIndex - 1}`
        modal.container.style.boxShadow = ''
      }
    })
  }

  /**
   * 計算拖曳modal元件的位移
   * @param e 滑鼠事件
   * @returns
   */
  private calcMouseDisplacement = (e: MouseEvent): void => {
    //1.查詢當前拖曳中的modal，及modal當前的初始位置
    const currentModal = this.ModalList.get(this.movingModalId)
    const { initialMouseX, initialMouseY, initialModalX, initialModalY } = this.initPosition
    if (!currentModal) return

    //2.計算滑鼠移動距離
    const deltaX = e.clientX - initialMouseX
    const deltaY = e.clientY - initialMouseY

    //3.計算新位置:元素初始位置+滑鼠移動距離
    let axisX = initialModalX + deltaX
    let axisY = initialModalY + deltaY

    //4.抓取目前容器與modal邊界
    const targetRect = currentModal.boxElement.getBoundingClientRect()
    const modalRect = currentModal.container.getBoundingClientRect()

    //5.限制範圍
    const limitMinX = targetRect.left
    const limitMaxX = targetRect.right - modalRect.width
    const limitMinY = targetRect.top
    const limitMaxY = targetRect.bottom - modalRect.height

    //6.計算最大與最小值
    axisX = Math.max(limitMinX, Math.min(axisX, limitMaxX))
    axisY = Math.max(limitMinY, Math.min(axisY, limitMaxY))

    //7.計算相對於容器的位置
    const relativeX = axisX - targetRect.left
    const relativeY = axisY - targetRect.top

    //8.更新位置
    currentModal.container.style.left = `${relativeX}px`
    currentModal.container.style.top = `${relativeY}px`
    currentModal.container.style.transform = 'none'
  }

  /**
   * 停止拖曳
   */
  private stopDrag = (): void => {
    //解除綁定modal元件的滑鼠事件
    document.removeEventListener('mousemove', this.calcMouseDisplacement)
    document.removeEventListener('mouseup', this.stopDrag)
  }
  //==========================================modal位置===================================================
  /**
   * 指定視窗生成位置
   * @param modalId modal Id
   * @param position 位置座標
   * @returns
   */
  private setPosition(modalId: string, position: createPosition): void {
    //1.查找modal
    const currentModal = this.ModalList.get(modalId)
    if (!currentModal) return

    //2.重置modal position
    currentModal.container.style.top = position.top ?? 'auto'
    currentModal.container.style.bottom = position.bottom ?? 'auto'
    currentModal.container.style.left = position.left ?? 'auto'
    currentModal.container.style.right = position.right ?? 'auto'
    currentModal.container.style.transform = ''
  }

  /**
   * 移動視窗至指定容器
   * @param modalId
   * @param target
   * @returns
   */
  public moveToLayers(modalId: string, target: string) {
    //1.查找modal
    const currentModal = this.ModalList.get(modalId)
    if (!currentModal) return

    //2.獲取新的容器
    const layers = document.getElementById(target) as HTMLDivElement
    if (layers) {
      //3.移動至新容器置中
      currentModal.boxElement.style.position = ''
      layers.style.position = 'relative'
      layers.appendChild(currentModal.container)
      currentModal.container.style.top = '50%'
      currentModal.container.style.left = '50%'
      currentModal.container.style.transform = 'translate(-50%, -50%)'
      //更新modalList的容器資訊
      currentModal.boxElement = layers
      if (currentModal.resize) currentModal.resize.setCurrentModal(currentModal)
    }
  }
}

export const createModalManager = (options: Array<ModalRouter>): ModalManager => {
  const instance = new ModalManager(options)
  ModalManager.modalManager = instance
  return instance
}

export const useModalManager = () => {
  const modalManager = ModalManager.modalManager
  return modalManager
}
