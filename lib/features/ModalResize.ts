import type { modalInfo, modalSize, movementRange, movementRangeXY } from '../types'

/**
 * ModalResize - modal調整大小功能類
 * 
 * @description
 * 這個類為modal提供完整的調整大小功能，支援8個方向的拖拽調整：
 * - 4個邊：東(e)、南(s)、西(w)、北(n)
 * - 4個角：東南(se)、西南(sw)、東北(ne)、西北(nw)
 * 
 * @features
 * ✅ 8方向調整大小把手
 * ✅ 計算邊界限制
 * ✅ 最小尺寸控制
 * ✅ 優化動畫效能
 */
export class ModalResize {
  private currentModal: modalInfo //modal
  private resizeHandlers: Map<string, (e: MouseEvent) => void> = new Map() //儲存個方位拖曳節點
  private resizing: boolean = false //是否正在改變大小
  private resizeDirection: string = '' //當前調整大小的方位
  private initialSize: modalSize //初始大小及位置
  private initialMouse: { x: number; y: number } = { x: 0, y: 0 } //初始滑鼠位置
  private minWidth: number = 100 //最小寬度
  private minHeight: number = 100 //最小高度

  /**
   * 初始化函數
   * @param currentModal modal
   */
  constructor(currentModal: modalInfo) {
    this.currentModal = currentModal
    this.initialSize = this.createEmptyModalSize()
    this.createResizeHandles(currentModal.id)
    this.bindResize(currentModal.id)
  }

  //==================================物件初始化==================================

  /**
   * 初始預設大小及位置
   */
  private createEmptyModalSize(): modalSize {
    return {
      width: 0,
      height: 0,
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      mouseLimits: {
        limitX: { min: 0, max: 0 },
        limitY: { min: 0, max: 0 },
        limitXY: { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } },
      },
    }
  }

  /**
   * 創建調整大小的手柄
   * @param modalId modal的ID
   * @returns 是否成功創建
   */
  private createResizeHandles(modalId: string): boolean {
    //1. 定義方位及確認是否有modal物件
    const directions = ['e', 's', 'se', 'w', 'n', 'ne', 'sw', 'nw']
    const modalBody = this.currentModal.container.querySelector(`#${modalId}`) as HTMLElement
    if (!modalBody) {
      console.warn(`Modal body element with id ${modalId} not found`)
      return false
    }

    //2.檢查是否已有節點存在
    const existingHandles = modalBody.querySelectorAll('.resize-handle')
    if (existingHandles.length > 0) return true

    //3. 設定modal樣式
    const computedStyle = window.getComputedStyle(modalBody)
    if (computedStyle.position === 'static') {
      modalBody.style.position = 'relative'
    }

    //4. 生成每個方位的拖曳節點
    directions.forEach((direction) => {
      const handle = document.createElement('div')
      handle.setAttribute('modalResizeArea', modalId)
      handle.setAttribute('data-direction', direction)
      handle.className = `resize-handle resize-${direction}`

      Object.assign(handle.style, {
        position: 'absolute',
        background: 'transparent',
        pointerEvents: 'auto',
        zIndex: '1001',
      })

      this.setHandleStyle(handle, direction)
      modalBody.appendChild(handle)
    })

    return true
  }

  /**
   * 設定調整大小節點
   * @param handle 節點dom
   * @param direction 方位
   */
  private setHandleStyle(handle: HTMLElement, direction: string): void {
    // 1.各方位節點樣式
    const styles: Record<string, Partial<CSSStyleDeclaration>> = {
      e: { top: '0', right: '0', width: '5px', height: '100%', cursor: 'e-resize' },
      s: { bottom: '0', left: '0', width: '100%', height: '5px', cursor: 's-resize' },
      se: { bottom: '0', right: '0', width: '10px', height: '10px', cursor: 'se-resize' },
      w: { top: '0', left: '0', width: '5px', height: '100%', cursor: 'w-resize' },
      n: { top: '0', left: '0', width: '100%', height: '5px', cursor: 'n-resize' },
      ne: { top: '0', right: '0', width: '10px', height: '10px', cursor: 'ne-resize' },
      sw: { bottom: '0', left: '0', width: '10px', height: '10px', cursor: 'sw-resize' },
      nw: { top: '0', left: '0', width: '10px', height: '10px', cursor: 'nw-resize' },
    }

    // 2.設定樣式
    const style = styles[direction]
    if (style) {
      Object.assign(handle.style, style)
    }
  }

  /**
   * 重置modal物件
   * @param currentModal 當前Modal
   */
  public setCurrentModal(currentModal: modalInfo) {
    // 1.解除先前的綁定
    const oldModalId = this.currentModal.id
    this.unbindResize(oldModalId)

    //2.更新綁定
    this.currentModal = currentModal
    this.createResizeHandles(currentModal.id)
    this.bindResize(currentModal.id)
  }

  //==================================功能綁定==================================

  /**
   * 綁定調整大小事件
   * @param modalId modal的ID
   * @returns 是否成功綁定
   */
  public bindResize(modalId: string): boolean {
    // 1. 檢查Modal body是否存在
    const modalBody = this.currentModal.container.querySelector(`#${modalId}`) as HTMLElement
    if (!modalBody) {
      console.warn(`Modal body not found for ${modalId}`)
      return false
    }

    //2.檢查是否生成節點
    const resizeHandles = modalBody.querySelectorAll(
      `[modalResizeArea="${modalId}"]`,
    ) as NodeListOf<HTMLElement>
    if (resizeHandles.length === 0) {
      console.warn(`No resize handles found for modal ${modalId}`)
      return false
    }

    //3.綁定每個方位的拖曳事件
    this.resizeHandlers.clear() // 清除之前的事件处理器
    resizeHandles.forEach((handle) => {
      const direction = handle.dataset.direction || ''
      const mousedownHandler = (e: MouseEvent) => this.startResize(e, direction)

      const key = `${modalId}-${direction}`
      this.resizeHandlers.set(key, mousedownHandler)
      handle.addEventListener('mousedown', mousedownHandler)
    })

    return true
  }

  /**
   * 解除綁定
   * @param modalId modal的ID
   */
  public unbindResize(modalId: string): void {
    //1. 如果正在拖曳中，強制結束拖曳
    if (this.resizing) this.forceStopResize()

    //2. 移除所有調整大小的節點
    const modalBody = this.currentModal.container.querySelector(`#${modalId}`) as HTMLElement
    if (modalBody) {
      const resizeHandles = modalBody.querySelectorAll(
        `[modalResizeArea="${modalId}"]`,
      ) as NodeListOf<HTMLElement>

      resizeHandles.forEach((handle) => {
        const direction = handle.dataset.direction || ''
        const key = `${modalId}-${direction}`
        const handler = this.resizeHandlers.get(key)

        if (handler) {
          handle.removeEventListener('mousedown', handler)
          this.resizeHandlers.delete(key)
        }

        handle.remove()
      })
    }

    //3.清理狀態
    this.resizeHandlers.clear()
  }

  //==================================開始拖曳==================================

  /**
   * 開始拖曳(開始調整大小)
   * @param e 滑鼠事件
   * @param direction 方位
   * @returns
   */
  private startResize(e: MouseEvent, direction: string): void {
    //1. 檢查是否拖曳中，並停用預設事件
    if (this.resizing || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    // 1. 記錄初始滑鼠標位置
    this.initialMouse = { x: e.clientX, y: e.clientY }

    // 2. 計算modal初始位置及大小
    const positionInfo = this.calculateInitialPosition()
    this.initialSize = {
      width: positionInfo.width,
      height: positionInfo.height,
      left: positionInfo.left,
      top: positionInfo.top,
      right: positionInfo.right,
      bottom: positionInfo.bottom,
      mouseLimits: positionInfo.mouseLimits,
    }

    // 3. 設置調整大小狀態
    this.resizing = true
    this.resizeDirection = direction

    // 4.綁定事件
    document.addEventListener('mousemove', this.handleResize)
    document.addEventListener('mouseup', this.stopResize)

    // 5. 添加調整大小樣式
    this.currentModal.container.classList.add('modal-resizing')
  }

  /**
   * 紀錄拖曳初始位置
   */
  private calculateInitialPosition() {
    // 1.獲取當前modal狀態
    const container = this.currentModal.container
    const boxElement = this.currentModal.boxElement
    const rect = container.getBoundingClientRect()
    const boxRect = boxElement.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(container)
    const transform = computedStyle.transform
    let finalLeft: number, finalTop: number, finalRight: number, finalBottom: number

    // 2.檢查是否使用了 transform
    const hasTransform = transform !== 'none' && transform !== ''

    // 3.計算mdoal位置
    if (hasTransform) {
      // a-1.如果是第一次拖曳，需先將transform清除
      container.style.transform = 'none'
      // a-2.計算 left 和 top的居中值
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      // a-3.計算新的位置
      finalLeft = centerX - rect.width / 2 - boxRect.left
      finalTop = centerY - rect.height / 2 - boxRect.top
      finalRight = boxRect.width - (finalLeft + rect.width)
      finalBottom = boxRect.height - (finalTop + rect.height)

      // a-4.立即使用新的定位，避免modal位置錯亂
      container.style.left = 'auto'
      container.style.top = 'auto'
      container.style.inset = `${finalTop}px ${finalRight}px ${finalBottom}px ${finalLeft}px`
    } else {
      // b-1.如果沒有 transform，直接使用當前位置
      finalLeft = rect.left - boxRect.left
      finalTop = rect.top - boxRect.top
      finalRight = boxRect.width - (finalLeft + rect.width)
      finalBottom = boxRect.height - (finalTop + rect.height)
    }

    // 4.計算滑鼠x軸和y軸的移動範圍
    const mouseLimits = {
      limitX: {
        min: boxRect.left + 5,
        max: boxRect.width + boxRect.left - 5,
      },
      limitY: {
        min: boxRect.top + 5,
        max: boxRect.height + boxRect.top - 5,
      },
      limitXY: {
        x: { min: boxRect.left + 9, max: boxRect.width + boxRect.left - 9 },
        y: { min: boxRect.top + 9, max: boxRect.height + boxRect.top - 9 },
      },
    }

    return {
      width: rect.width,
      height: rect.height,
      left: finalLeft,
      top: finalTop,
      right: finalRight,
      bottom: finalBottom,
      mouseLimits,
    }
  }

  //==================================拖曳中==================================

  /**
   * 拖曳中(正在調整大小)
   * @param e 滑鼠事件
   * @returns
   */
  private handleResize = (e: MouseEvent): void => {
    //1.如果沒有正在調整大小，則返回
    if (!this.resizing) return
    e.preventDefault()

    //2.使用requestAnimationFrame來優化性能(fps)，這樣可以減少在快速移動滑鼠時的計算
    requestAnimationFrame(() => {
      this.performResize(e)
    })
  }

  /**
   * 動態計算modal大小和位置
   * @param e 滑鼠事件
   */
  private performResize(e: MouseEvent): void {
    // 1. 計算移動距離
    const movingClientX = e.clientX
    const movingClientY = e.clientY
    let deltaX = movingClientX - this.initialMouse.x
    let deltaY = movingClientY - this.initialMouse.y

    // 2. 根據方位限制移動範圍
    const range = this.calcMouseMoveRange()
    if ('min' in range) {
      if (this.resizeDirection === 'e' || this.resizeDirection === 'w') {
        deltaX = Math.max(range.min, Math.min(deltaX, range.max))
      } else {
        deltaY = Math.max(range.min, Math.min(deltaY, range.max))
      }
    } else {
      deltaX = Math.max(range.x.min, Math.min(deltaX, range.x.max))
      deltaY = Math.max(range.y.min, Math.min(deltaY, range.y.max))
    }

    // 3. 計算新的尺寸及位置
    const newSizes = this.calculateNewSizes(deltaX, deltaY)

    // 4. 更新modal的尺寸及位置
    const modalBody = this.currentModal.container.querySelector(
      `#${this.currentModal.id}`,
    ) as HTMLElement

    if (modalBody) {
      // 更新modal尺寸
      modalBody.style.width = `${newSizes.width}px`
      modalBody.style.height = `${newSizes.height}px`

      // 更新容器的位置
      this.currentModal.container.style.inset = `${newSizes.top}px ${newSizes.right}px ${newSizes.bottom}px ${newSizes.left}px`

      // 更新 handles 位置
      this.updateHandlesPosition(modalBody)

      // 發出正在拖曳調整大小事件
      this.emitResizeEvent(this.currentModal, newSizes.width, newSizes.height)
    }
  }

  /**
   * 計算新的尺寸及大小
   * @param deltaX x軸位移
   * @param deltaY y軸位移
   * @returns
   */
  private calculateNewSizes(deltaX: number, deltaY: number) {
    // 1. 定義新的尺寸及大小
    let newWidth = this.initialSize.width
    let newHeight = this.initialSize.height
    let newLeft = this.initialSize.left
    let newTop = this.initialSize.top
    let newRight = this.initialSize.right
    let newBottom = this.initialSize.bottom

    // 2. 根據當前調整大小的方位計算新的尺寸
    switch (this.resizeDirection) {
      case 'e':
        newWidth = Math.max(this.minWidth, this.initialSize.width + deltaX)
        newRight = this.initialSize.right - (newWidth - this.initialSize.width)
        break
      case 'w':
        newWidth = Math.max(this.minWidth, this.initialSize.width - deltaX)
        newLeft = this.initialSize.left + (this.initialSize.width - newWidth)
        break
      case 's':
        newHeight = Math.max(this.minHeight, this.initialSize.height + deltaY)
        newBottom = this.initialSize.bottom - (newHeight - this.initialSize.height)
        break
      case 'n':
        newHeight = Math.max(this.minHeight, this.initialSize.height - deltaY)
        newTop = this.initialSize.top + (this.initialSize.height - newHeight)
        break
      case 'se':
        newWidth = Math.max(this.minWidth, this.initialSize.width + deltaX)
        newHeight = Math.max(this.minHeight, this.initialSize.height + deltaY)
        newRight = this.initialSize.right - (newWidth - this.initialSize.width)
        newBottom = this.initialSize.bottom - (newHeight - this.initialSize.height)
        break
      case 'sw':
        newWidth = Math.max(this.minWidth, this.initialSize.width - deltaX)
        newHeight = Math.max(this.minHeight, this.initialSize.height + deltaY)
        newLeft = this.initialSize.left + (this.initialSize.width - newWidth)
        newBottom = this.initialSize.bottom - (newHeight - this.initialSize.height)
        break
      case 'ne':
        newWidth = Math.max(this.minWidth, this.initialSize.width + deltaX)
        newHeight = Math.max(this.minHeight, this.initialSize.height - deltaY)
        newRight = this.initialSize.right - (newWidth - this.initialSize.width)
        newTop = this.initialSize.top + (this.initialSize.height - newHeight)
        break
      case 'nw':
        newWidth = Math.max(this.minWidth, this.initialSize.width - deltaX)
        newHeight = Math.max(this.minHeight, this.initialSize.height - deltaY)
        newLeft = this.initialSize.left + (this.initialSize.width - newWidth)
        newTop = this.initialSize.top + (this.initialSize.height - newHeight)
        break
    }

    return {
      width: newWidth,
      height: newHeight,
      left: newLeft,
      top: newTop,
      right: newRight,
      bottom: newBottom,
    }
  }

  /**
   * 計算各方位滑鼠移動限制
   * @returns
   */
  private calcMouseMoveRange(): movementRange | movementRangeXY {
    switch (this.resizeDirection) {
      case 'e':
        return {
          min: this.minWidth - this.initialSize.width,
          max: this.initialSize.mouseLimits.limitX.max - this.initialMouse.x,
        }
      case 'w':
        return {
          min: this.initialSize.mouseLimits.limitX.min - this.initialMouse.x,
          max: -(this.minWidth - this.initialSize.width),
        }
      case 's':
        return {
          min: this.minHeight - this.initialSize.height,
          max: this.initialSize.mouseLimits.limitY.max - this.initialMouse.y,
        }
      case 'n':
        return {
          min: this.initialSize.mouseLimits.limitY.min - this.initialMouse.y,
          max: -(this.minHeight - this.initialSize.height),
        }
      case 'se':
      case 'sw':
      case 'ne':
      case 'nw':
        const range: movementRangeXY = {
          x: { min: 0, max: 0 },
          y: { min: 0, max: 0 },
        }

        if (this.resizeDirection.includes('e')) {
          range.x.min = this.minWidth - this.initialSize.width
          range.x.max = this.initialSize.mouseLimits.limitXY.x.max - this.initialMouse.x
        } else {
          range.x.min = this.initialSize.mouseLimits.limitXY.x.min - this.initialMouse.x
          range.x.max = -(this.minWidth - this.initialSize.width)
        }

        if (this.resizeDirection.includes('s')) {
          range.y.min = this.minHeight - this.initialSize.height
          range.y.max = this.initialSize.mouseLimits.limitXY.y.max - this.initialMouse.y
        } else {
          range.y.min = this.initialSize.mouseLimits.limitXY.y.min - this.initialMouse.y
          range.y.max = -(this.minHeight - this.initialSize.height)
        }

        return range
      default:
        return { min: 0, max: 0 }
    }
  }

  /**
   * 更新節點(handles)位置
   * @param modalBody modal元素
   */
  private updateHandlesPosition(modalBody: HTMLElement): void {
    //1.獲取所有調整大小的節點(handles)
    const handles = modalBody.querySelectorAll('.resize-handle') as NodeListOf<HTMLElement>
    //2.遍歷每個節點(handles)，根據方位更新位置
    handles.forEach((handle) => {
      const direction = handle.dataset.direction
      if (direction) {
        this.setHandleStyle(handle, direction)
      }
    })
  }

  //==================================拖曳結束==================================

  /**
   * 拖曳結束(結束調整大小)
   */
  private stopResize = (): void => {
    //1.如果沒有正在調整大小，則返回
    if (!this.resizing) return
    const { container, id } = this.currentModal

    //2.移除正在調整大小的類別
    container.classList.remove('modal-resizing')

    //3.更新節點(handles)位置
    const modalBody = container.querySelector(`#${id}`) as HTMLElement
    if (modalBody) {
      this.updateHandlesPosition(modalBody)
    }

    //4.發出調整結束事件
    const rect = container.getBoundingClientRect()
    this.emitResizeEndEvent(this.currentModal, rect.width, rect.height)

    // 重置狀態
    this.resizing = false
    this.resizeDirection = ''

    // 移除事件
    document.removeEventListener('mousemove', this.handleResize)
    document.removeEventListener('mouseup', this.stopResize)
  }

  /**
   * 強制結束拖曳
   */
  private forceStopResize(): void {
    this.resizing = false
    this.resizeDirection = ''
    this.currentModal.container.classList.remove('modal-resizing')
    document.removeEventListener('mousemove', this.handleResize)
    document.removeEventListener('mouseup', this.stopResize)
  }

  //==================================發送事件==================================

  /**
   * 發送正在調整大小事件
   * @param modal modal資訊
   * @param width 寬度
   * @param height 高度
   */
  private emitResizeEvent(modal: modalInfo, width: number, height: number): void {
    const event = new CustomEvent('modal-resize', {
      detail: { modalId: modal.id, width, height },
    })
    modal.container.dispatchEvent(event)
  }

  /**
   * 發送調整大小結束事件
   * @param modal modal資訊
   * @param width 寬度
   * @param height 高度
   */
  private emitResizeEndEvent(modal: modalInfo, width: number, height: number): void {
    const event = new CustomEvent('modal-resize-end', {
      detail: { modalId: modal.id, width, height },
    })
    modal.container.dispatchEvent(event)
  }

  //==================================銷毀物件==================================

  /**
   * 銷毀物件
   */
  public destroy(): void {
    this.unbindResize(this.currentModal.id)
    this.forceStopResize()
  }
}

export default ModalResize
