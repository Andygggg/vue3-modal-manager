import type { modalInfo, movingCoordinates } from '../types'

/**
 * ModalDrag - modal拖拽功能類
 * 
 * @description
 * 這個類為modal提供完整的拖拽移動功能，讓使用者可以透過滑鼠拖拽來移動modal位置：
 * - 支援滑鼠拖拽移動
 * - 計算邊界限制，防止拖拽超出容器範圍
 * - 拖拽和即時位置更新
 * 
 * @features
 * ✅ 滑鼠拖拽移動
 * ✅ 計算邊界限制
 * 
 * @usage
 * modal元件需在可拖拽區域加上屬性：modalDraggableArea="modalId"
 */
export class ModalDrag {
  private currentModal: modalInfo //modal
  private modalHeader: HTMLElement | null = null //modal header元素
  private handleDrag: ((e: MouseEvent) => void) | null = null //拖曳事件方法
  private initPosition: movingCoordinates //初始位置
  private isDragging: boolean = false //是否正在拖曳

  /**
   * 初始化函數
   * @param currentModal modal
   */
  constructor(currentModal: modalInfo) {
    this.currentModal = currentModal
    this.initPosition = {} as movingCoordinates
    this.bindDrag()
  }

  //==================================物件初始化==================================

  /**
   * 設置當前modal
   * @param currentModal modal
   */
  public setCurrentModal(currentModal: modalInfo) {
    this.currentModal = currentModal
    // 重新绑定
    if (this.modalHeader) {
      this.unbindDrag()
      this.bindDrag()
    }
  }

  //==================================功能綁定==================================

  /**
   * 綁定拖曳功能
   * modal元件需在拖曳處加上modalDraggableArea='modalId'
   * @returns
   */
  public bindDrag(): boolean {
    //1.查找modal
    const { id, container } = this.currentModal

    //2.綁定該modal拖曳處
    this.modalHeader = container.querySelector(`[modalDraggableArea="${id}"]`)
    if (!this.modalHeader) {
      console.warn(`Modal drag area not found for modal: ${id}`)
      return false
    }
    this.modalHeader.style.cursor = 'move'
    //3.綁定滑鼠按住監聽
    if (!this.handleDrag) this.handleDrag = (e) => this.startDrag(e)
    this.modalHeader.addEventListener('mousedown', this.handleDrag)
    return true
  }

  /**
   * 解除拖曳功能
   * @returns
   */
  public unbindDrag() {
    if (!this.modalHeader) return

    //2.移除 cursor 樣式
    this.modalHeader.style.cursor = ''

    //3.解除事件綁定
    if (this.handleDrag) this.modalHeader.removeEventListener('mousedown', this.handleDrag)
    //如果正在拖拽，强制停止
    if (this.isDragging) {
      this.forceStopDrag()
    }
  }

  //==================================開始拖曳==================================

  /**
   * 開始拖曳
   * @param e 滑鼠事件
   * @param modalId modal Id
   * @returns
   */
  private startDrag = (e: MouseEvent): void => {
    // 1.防止重复拖拽，並設置拖曳狀態
    if (this.isDragging || e.button !== 0) return
    this.isDragging = true
    const { container } = this.currentModal

    //2.記錄初始滑鼠、modal的初始位置
    const rect = container.getBoundingClientRect()
    this.initPosition = {
      initialMouseX: e.clientX,
      initialMouseY: e.clientY,
      initialModalX: rect.left,
      initialModalY: rect.top,
    }
    //3..綁定滑鼠移動、放開監聽事件
    document.addEventListener('mousemove', this.calcMouseDisplacement)
    document.addEventListener('mouseup', this.stopDrag)
    // 4.防止文本選擇其他行为
    e.preventDefault()
    e.stopPropagation()
    // 5.添加拖拽中的樣式
    container.classList.add('modal-dragging')
  }

  //==================================拖曳中==================================

  /**
   * 計算拖曳modal元件的位移
   * @param e 滑鼠事件
   * @returns
   */
  private calcMouseDisplacement = (e: MouseEvent): void => {
    if (!this.isDragging) return //添加状态检查

    //1.查詢當前拖曳中的modal，及modal當前的初始位置
    const { container, boxElement } = this.currentModal
    const { initialMouseX, initialMouseY, initialModalX, initialModalY } = this.initPosition

    //2.計算滑鼠移動距離
    const deltaX = e.clientX - initialMouseX
    const deltaY = e.clientY - initialMouseY

    //3.計算新位置:元素初始位置+滑鼠移動距離
    let axisX = initialModalX + deltaX
    let axisY = initialModalY + deltaY

    //4.抓取目前容器與modal邊界
    const targetRect = boxElement.getBoundingClientRect()
    const modalRect = container.getBoundingClientRect()

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
    container.style.left = `${relativeX}px`
    container.style.top = `${relativeY}px`
    container.style.transform = 'none'

    // 9.發出拖拽事件
    this.emitDragEvent(relativeX, relativeY)
  }

  //==================================拖曳結束==================================

  /**
   * 停止拖曳
   */
  private stopDrag = (): void => {
    if (!this.isDragging) return

    const { container } = this.currentModal

    //1.重置拖拽状态
    this.isDragging = false

    //2.解除綁定modal元件的滑鼠事件
    document.removeEventListener('mousemove', this.calcMouseDisplacement)
    document.removeEventListener('mouseup', this.stopDrag)

    //3.移除拖拽样式
    container.classList.remove('modal-dragging')

    // 4.發出拖拽結束事件
    const rect = container.getBoundingClientRect()
    const boxRect = this.currentModal.boxElement.getBoundingClientRect()
    const finalX = rect.left - boxRect.left
    const finalY = rect.top - boxRect.top
    this.emitDragEndEvent(finalX, finalY)
  }

  /**
   * 強制停止拖曳
   */
  private forceStopDrag(): void {
    this.isDragging = false
    document.removeEventListener('mousemove', this.calcMouseDisplacement)
    document.removeEventListener('mouseup', this.stopDrag)
  }

  //==================================發送事件==================================

  /**
   * 發送拖拽事件
   * @param x 當前X坐標
   * @param y 當前Y坐標
   */
  private emitDragEvent(x: number, y: number): void {
    const event = new CustomEvent('modal-drag', {
      detail: {
        modalId: this.currentModal.id,
        x,
        y,
      },
    })
    this.currentModal.container.dispatchEvent(event)
  }

  /**
   * 發送拖拽結束事件
   * @param x 最終X坐標
   * @param y 最終Y坐標
   */
  private emitDragEndEvent(x: number, y: number): void {
    const event = new CustomEvent('modal-drag-end', {
      detail: {
        modalId: this.currentModal.id,
        x,
        y,
      },
    })
    this.currentModal.container.dispatchEvent(event)
  }

  //==================================銷毀物件==================================

  /**
   * 銷毀物件
   */
  public destroy(): void {
    this.unbindDrag()
    this.forceStopDrag()
  }
}
