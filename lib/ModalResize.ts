import type { modalInfo, modalSize, movementRange, movementRangeXY } from './typing'

export class ModalResize {
  private currentModal: modalInfo
  private resizeHandlers: Map<string, (e: MouseEvent) => void> = new Map()
  private resizing: boolean = false
  private resizeDirection: string = ''
  private initialSize: modalSize = {
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
  private initialMouse: { x: number; y: number } = { x: 0, y: 0 }

  /**
   * 初始化函數
   * @param currentModal modal
   */
  constructor(currentModal: modalInfo) {
    this.currentModal = currentModal
    this.createResizeHandles(currentModal.id)
  }

  /**
   * 設置當前modal
   * @param currentModal modal
   */
  public setCurrentModal(currentModal: modalInfo) {
    this.currentModal = currentModal
  }

  /**
   * 建立resize handle
   * @param modalId modalId
   */
  private createResizeHandles(modalId: string) {
    const directions = ['e', 's', 'se', 'w', 'n', 'ne', 'sw', 'nw']
    const modalElement = this.currentModal.container as HTMLElement

    // 1.檢查modalElement是否存在
    if (!modalElement) {
      console.warn(`Modal element with id ${modalId} not found`)
      return
    }

    // 2.檢查是否已經存在 handles
    const existingHandles = modalElement.querySelectorAll('.resize-handle')
    if (existingHandles.length > 0) return // 如果已經存在，則不重複創建

    // 3.創建每個方向的 resize handle
    directions.forEach((direction) => {
      const handle = document.createElement('div')
      handle.setAttribute('modalResizeArea', modalId)
      handle.setAttribute('data-direction', direction)
      handle.className = `resize-handle resize-${direction}`

      // 設置基本樣式
      Object.assign(handle.style, {
        position: 'absolute',
        background: 'transparent',
        pointerEvents: 'auto',
        zIndex: '1000',
      })

      // 根據方向設置特定樣式
      switch (direction) {
        case 'e':
          Object.assign(handle.style, {
            top: '0',
            right: '0',
            width: '5px',
            height: '100%',
            cursor: 'e-resize',
          })
          break
        case 's':
          Object.assign(handle.style, {
            bottom: '0',
            left: '0',
            width: '100%',
            height: '5px',
            cursor: 's-resize',
          })
          break
        case 'se':
          Object.assign(handle.style, {
            bottom: '0',
            right: '0',
            width: '10px',
            height: '10px',
            cursor: 'se-resize',
          })
          break
        case 'w':
          Object.assign(handle.style, {
            top: '0',
            left: '0',
            width: '5px',
            height: '100%',
            cursor: 'w-resize',
          })
          break
        case 'n':
          Object.assign(handle.style, {
            top: '0',
            left: '0',
            width: '100%',
            height: '5px',
            cursor: 'n-resize',
          })
          break
        case 'ne':
          Object.assign(handle.style, {
            top: '0',
            right: '0',
            width: '10px',
            height: '10px',
            cursor: 'ne-resize',
          })
          break
        case 'sw':
          Object.assign(handle.style, {
            bottom: '0',
            left: '0',
            width: '10px',
            height: '10px',
            cursor: 'sw-resize',
          })
          break
        case 'nw':
          Object.assign(handle.style, {
            top: '0',
            left: '0',
            width: '10px',
            height: '10px',
            cursor: 'nw-resize',
          })
          break
      }

      modalElement.appendChild(handle)
    })
  }

  /**
   * 綁定調整大小功能
   * @param modalId 模態框ID
   */
  public bindResize(modalId: string) {
    // 1. 查找所有調整大小的區域
    const resizeHandles = this.currentModal.container.querySelectorAll(
      `[modalResizeArea="${modalId}"]`,
    ) as NodeListOf<HTMLElement>

    if (resizeHandles.length === 0) {
      console.warn(`No resize handles found for modal ${modalId}`)
      return
    }

    // 2. 為每個調整區域綁定事件
    resizeHandles.forEach((handle) => {
      const direction = handle.dataset.direction || ''
      const mousedownHandler = (e: MouseEvent) => this.startResize(e, direction)

      // 保存所有方向的resize handler
      const key = `${modalId}-${direction}`
      this.resizeHandlers.set(key, mousedownHandler)
      handle.addEventListener('mousedown', mousedownHandler)
    })
  }

  /**
   * 開始調整大小
   * @param e 滑鼠事件
   * @param direction 方向
   */
  private startResize(e: MouseEvent, direction: string) {
    e.preventDefault()
    e.stopPropagation()

    // 1. 先設置滑鼠初始位置，確保在計算其他值之前就已經記錄
    this.initialMouse = {
      x: e.clientX,
      y: e.clientY,
    }

    // 2. 計算當前視窗在容器中的位置（考慮 transform）
    const rect = this.currentModal.container.getBoundingClientRect()
    const boxRect = this.currentModal.boxElement.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(this.currentModal.container)
    const transform = computedStyle.transform
    const isTransformed = transform !== 'none' && transform !== ''

    let currentLeft, currentTop, currentRight, currentBottom
    if (isTransformed) {
      // 如果使用了 transform，計算實際位置
      const centerX = boxRect.left + boxRect.width / 2
      const centerY = boxRect.top + boxRect.height / 2
      currentLeft = centerX - rect.width / 2 - boxRect.left
      currentTop = centerY - rect.height / 2 - boxRect.top
      currentRight = boxRect.width - (currentLeft + rect.width)
      currentBottom = boxRect.height - (currentTop + rect.height)
    } else {
      // 如果沒有使用 transform，直接使用當前位置
      currentLeft = rect.left - boxRect.left
      currentTop = rect.top - boxRect.top
      currentRight = boxRect.width - (currentLeft + rect.width)
      currentBottom = boxRect.height - (currentTop + rect.height)
    }

    // 3. 計算滑鼠可移動的範圍
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

    this.initialSize = {
      width: rect.width,
      height: rect.height,
      left: currentLeft,
      top: currentTop,
      right: currentRight,
      bottom: currentBottom,
      mouseLimits,
    }

    this.resizing = true
    this.resizeDirection = direction

    // 4. 綁定滑鼠移動和釋放事件
    document.addEventListener('mousemove', this.handleResize)
    document.addEventListener('mouseup', this.stopResize)

    // 5. 添加表示正在調整大小的class
    this.currentModal.container.classList.add('modal-resizing')
  }

  /**
   * 處理調整大小
   */
  private handleResize = (e: MouseEvent) => {
    if (!this.resizing) return

    e.preventDefault()
    // 使用 requestAnimationFrame 配合螢幕FPS
    requestAnimationFrame(() => {
      // 1. 如果是第一次移動，清除 transform 並設置實際位置
      if (this.currentModal.container.style.transform !== '') {
        this.currentModal.container.style.transform = ''
        this.currentModal.container.style.inset = `${this.initialSize.top}px ${this.initialSize.right}px ${this.initialSize.bottom}px ${this.initialSize.left}px`
      }

      // 2. 根據移動範圍&方向限制，計算實際移動距離
      const movingClientX = e.clientX
      const movingClientY = e.clientY
      let deltaX = movingClientX - this.initialMouse.x
      let deltaY = movingClientY - this.initialMouse.y

      switch (this.resizeDirection) {
        // 單向水平調整 (e, w)
        case 'e':
        case 'w': {
          const range = this.calcMouseMoveRange() as movementRange
          deltaX = Math.max(range.min, Math.min(deltaX, range.max))
          break
        }
        // 單向垂直調整 (n, s)
        case 'n':
        case 's': {
          const range = this.calcMouseMoveRange() as movementRange
          deltaY = Math.max(range.min, Math.min(deltaY, range.max))
          break
        }
        // 雙向調整 (se, sw, ne, nw)
        case 'se':
        case 'sw':
        case 'ne':
        case 'nw': {
          const range = this.calcMouseMoveRange() as movementRangeXY
          deltaX = Math.max(range.x.min, Math.min(deltaX, range.x.max))
          deltaY = Math.max(range.y.min, Math.min(deltaY, range.y.max))
          break
        }
      }

      // 3. 根據方向計算新的尺寸和位置
      let newWidth = this.initialSize.width
      let newHeight = this.initialSize.height
      let newLeft = this.initialSize.left
      let newTop = this.initialSize.top
      let newRight = this.initialSize.right
      let newBottom = this.initialSize.bottom

      // 4. 根據拖曳方向調整尺寸和位置
      switch (this.resizeDirection) {
        // 單向水平調整 (e, w)
        case 'e': // 東
          newWidth = Math.max(100, this.initialSize.width + deltaX)
          newRight = this.initialSize.right - (newWidth - this.initialSize.width)
          break
        case 'w': // 西
          newWidth = Math.max(100, this.initialSize.width - deltaX)
          newLeft = this.initialSize.left + (this.initialSize.width - newWidth)
          break

        // 單向垂直調整 (n, s)
        case 's': // 南
          newHeight = Math.max(100, this.initialSize.height + deltaY)
          newBottom = this.initialSize.bottom - (newHeight - this.initialSize.height)
          break
        case 'n': // 北
          newHeight = Math.max(100, this.initialSize.height - deltaY)
          newTop = this.initialSize.top + (this.initialSize.height - newHeight)
          break

        // 雙向調整 (se, sw, ne, nw)
        case 'se': // 東南
          newWidth = Math.max(100, this.initialSize.width + deltaX)
          newHeight = Math.max(100, this.initialSize.height + deltaY)
          newRight = this.initialSize.right - (newWidth - this.initialSize.width)
          newBottom = this.initialSize.bottom - (newHeight - this.initialSize.height)
          break
        case 'sw': // 西南
          newWidth = Math.max(100, this.initialSize.width - deltaX)
          newHeight = Math.max(100, this.initialSize.height + deltaY)
          newLeft = this.initialSize.left + (this.initialSize.width - newWidth)
          newBottom = this.initialSize.bottom - (newHeight - this.initialSize.height)
          break
        case 'ne': // 東北
          newWidth = Math.max(100, this.initialSize.width + deltaX)
          newHeight = Math.max(100, this.initialSize.height - deltaY)
          newRight = this.initialSize.right - (newWidth - this.initialSize.width)
          newTop = this.initialSize.top + (this.initialSize.height - newHeight)
          break
        case 'nw': // 西北
          newWidth = Math.max(100, this.initialSize.width - deltaX)
          newHeight = Math.max(100, this.initialSize.height - deltaY)
          newLeft = this.initialSize.left + (this.initialSize.width - newWidth)
          newTop = this.initialSize.top + (this.initialSize.height - newHeight)
          break
      }

      const body = this.currentModal.container.querySelector(
        `#${this.currentModal.id}`,
      ) as HTMLElement

      // 5. 更新 modal 的尺寸和位置
      body.style.width = `${newWidth}px`
      body.style.height = `${newHeight}px`
      this.currentModal.container.style.inset = `${newTop}px ${newRight}px ${newBottom}px ${newLeft}px`

      // 6. 發出尺寸變更事件
      this.emitResizeEvent(this.currentModal, newWidth, newHeight)
    })
  }

  /**
   * 計算滑鼠移動範圍
   * @returns movementRange | movementRangeXY
   */
  private calcMouseMoveRange(): movementRange | movementRangeXY {
    switch (this.resizeDirection) {
      // 單向水平調整 (e, w)
      case 'e': // 東
        return {
          min: 100 - this.initialSize.width,
          max: this.initialSize.mouseLimits.limitX.max - this.initialMouse.x,
        }
      case 'w': // 西
        return {
          min: this.initialSize.mouseLimits.limitX.min - this.initialMouse.x,
          max: -(100 - this.initialSize.width),
        }
      // 單向垂直調整 (n, s)
      case 's': // 南
        return {
          min: 100 - this.initialSize.height,
          max: this.initialSize.mouseLimits.limitY.max - this.initialMouse.y,
        }
      case 'n': // 北
        return {
          min: this.initialSize.mouseLimits.limitY.min - this.initialMouse.y,
          max: -(100 - this.initialSize.height),
        }
      // 雙向調整 (se, sw, ne, nw)
      case 'se': // 東南
      case 'sw': // 西南
      case 'ne': // 東北
      case 'nw': // 西北
        const range: movementRangeXY = {
          x: {
            min: 0,
            max: 0,
          },
          y: {
            min: 0,
            max: 0,
          },
        }

        // 根據方向設置 x 範圍
        if (this.resizeDirection.includes('e')) {
          // 東
          range.x.min = 100 - this.initialSize.width
          range.x.max = this.initialSize.mouseLimits.limitXY.x.max - this.initialMouse.x
        } else {
          // 西
          range.x.min = this.initialSize.mouseLimits.limitXY.x.min - this.initialMouse.x
          range.x.max = -(100 - this.initialSize.width)
        }

        // 根據方向設置 y 範圍
        if (this.resizeDirection.includes('s')) {
          // 南
          range.y.min = 100 - this.initialSize.height
          range.y.max = this.initialSize.mouseLimits.limitXY.y.max - this.initialMouse.y
        } else {
          // 北
          range.y.min = this.initialSize.mouseLimits.limitXY.y.min - this.initialMouse.y
          range.y.max = -(100 - this.initialSize.height)
        }

        return range
      default:
        return { min: 0, max: 0 }
    }
  }

  /**
   * 停止調整大小
   */
  private stopResize = () => {
    if (!this.resizing) return

    //1. 移除正在調整大小的類別
    this.currentModal.container.classList.remove('modal-resizing')

    //2. 發出調整結束事件
    const width = parseFloat(this.currentModal.container.style.width)
    const height = parseFloat(this.currentModal.container.style.height)
    this.emitResizeEndEvent(this.currentModal, width, height)

    //3. 重置狀態
    this.resizing = false
    this.resizeDirection = ''

    //4. 移除事件監聽
    document.removeEventListener('mousemove', this.handleResize)
    document.removeEventListener('mouseup', this.stopResize)
  }

  /**
   * 發出尺寸變更事件
   * @param modal modal
   * @param width modal寬度
   * @param height modal高度
   */
  private emitResizeEvent(modal: modalInfo, width: number, height: number) {
    const event = new CustomEvent('modal-resize', {
      detail: {
        modalId: modal.id,
        width,
        height,
      },
    })
    modal.container.dispatchEvent(event)
  }

  /**
   * 發出調整結束事件
   * @param modal modal
   * @param width modal寬度
   * @param height modal高度
   */
  private emitResizeEndEvent(modal: modalInfo, width: number, height: number) {
    const event = new CustomEvent('modal-resize-end', {
      detail: {
        modalId: modal.id,
        width,
        height,
      },
    })
    modal.container.dispatchEvent(event)
  }

  /**
   * 解除調整大小綁定
   * @param modalId modalId
   */
  public unbindResize(modalId: string) {
    // 1. 查找所有調整大小的區域
    const resizeHandles = this.currentModal.container.querySelectorAll(
      `[modalResizeArea="${modalId}"]`,
    ) as NodeListOf<HTMLElement>

    // 2. 解除每個調整區域的事件綁定
    resizeHandles.forEach((handle) => {
      const direction = handle.dataset.direction || ''
      const key = `${modalId}-${direction}`
      const handler = this.resizeHandlers.get(key)

      if (handler) {
        handle.removeEventListener('mousedown', handler)
        this.resizeHandlers.delete(key)
      }
    })

    // 3. 移除所有 resize handles
    const handlesContainer = this.currentModal.container.querySelector(
      `#${modalId} > div[style*="pointer-events: none"]`,
    )
    if (handlesContainer) {
      handlesContainer.remove()
    }
  }
}

export default ModalResize
