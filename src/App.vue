<template>
  <div class="app-container">
    <!-- 頁面標題 -->
    <header class="header">
      <div class="container">
        <h1 class="title">
          <span class="icon">🚀</span>
          Modal Manager Demo
        </h1>
        <p class="subtitle">Vue3 + TypeScript modal管理系統</p>
      </div>
    </header>

    <!-- 主要內容容器 (帶有 overflow) -->
    <div class="content-wrapper">
      <main class="main-content">
        <div class="container">
          <!-- 控制面板 -->
          <div class="control-panel">
            <div class="panel-section">
              <h3 class="section-title">📌 固定modal (Fixed Modal)</h3>
              <p class="section-description">固定在指定位置顯示，帶有遮罩層</p>
              <div class="button-group">
                <button
                  v-for="position in fixedPositions"
                  :key="position.value"
                  @click="openFixedModal(position.value)"
                  class="btn btn-primary"
                >
                  {{ position.label }}
                </button>
              </div>
            </div>

            <div class="panel-section">
              <h3 class="section-title">🎯 可拖拽modal (Draggable Modal)</h3>
              <p class="section-description">提供靈活的交互體驗，支援拖拽移動和調整大小</p>
              <div class="button-group">
                <button @click="openDraggableModal()" class="btn btn-success"> 基礎modal </button>
                <button @click="openDraggableModal({ drag: true })" class="btn btn-success">
                  啟用拖拽
                </button>
                <button @click="openDraggableModal({ resize: true })" class="btn btn-success">
                  啟用調整大小
                </button>
                <button
                  @click="openDraggableModal({ drag: true, resize: true })"
                  class="btn btn-success"
                >
                  拖拽 + 調整大小
                </button>
              </div>
            </div>

            <div class="panel-section">
              <h3 class="section-title">⚙️ 進階功能</h3>
              <p class="section-description">展示更多高級功能和自定義選項</p>
              <div class="button-group">
                <button @click="openCustomPositionModal()" class="btn btn-warning">
                  自訂位置
                </button>
                <button @click="openModalWithEvents()" class="btn btn-warning"> 自訂事件 </button>
                <button @click="openModalInContainer()" class="btn btn-warning"> 指定容器 </button>
                <button @click="openMultipleModals()" class="btn btn-info"> 開啟多個modal </button>
              </div>
            </div>

            <div class="panel-section">
              <h3 class="section-title">🛠️ 管理操作</h3>
              <p class="section-description">modal的管理和監控功能</p>
              <div class="button-group">
                <button @click="showModalList()" class="btn btn-secondary"> 查看所有modal </button>
                <button @click="closeAllModals()" class="btn btn-danger"> 關閉所有modal </button>
              </div>
            </div>
          </div>

          <!-- 指定容器示例 -->
          <div class="demo-container-section">
            <h3 class="container-title">📦 自訂容器示範</h3>
            <p class="container-description">modal可以在下方容器中開啟，展示容器內的modal功能</p>
            <div id="custom-container" class="custom-container">
              <div class="container-content">
                <h4 class="content-title">🎯 目標容器</h4>
                <p class="content-text">點擊上方「指定容器」按鈕，modal將在此容器中開啟</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useModalManager } from '../lib'
import type { modalDirection, draggableModalParams } from '../lib'

// modal管理器
const modalManager = useModalManager()

// 固定modal位置選項
const fixedPositions = [
  { label: '居中', value: 'center' as modalDirection },
  { label: '頂部', value: 'top' as modalDirection },
  { label: '底部', value: 'bottom' as modalDirection },
  { label: '左側', value: 'left' as modalDirection },
  { label: '右側', value: 'right' as modalDirection },
]

// 開啟固定modal
const openFixedModal = async (direction: modalDirection) => {
  try {
    const result = await modalManager.openModal('test', 'fixed', {
      direction,
      props: {
        title: `固定modal - ${getDirectionName(direction)}`,
        content: `這是一個 ${getDirectionName(direction)} 位置的固定modal示範`,
        type: 'fixed',
        position: direction,
      },
      events: {
        confirm: () => {
          console.log(`固定modal (${direction}) 確認事件觸發`)
        },
      },
    })

    if (result.success) {
      console.log(`成功開啟固定modal: ${result.modalId}`)
    } else {
      console.error(`開啟固定modal失敗: ${result.msg}`)
    }
  } catch (error) {
    console.error(`開啟固定modal異常: ${error}`)
  }
}

// 開啟可拖拽modal
const openDraggableModal = async (options: Partial<draggableModalParams> = {}) => {
  try {
    const result = await modalManager.openModal('test', 'draggable', {
      drag: options.drag || false,
      resize: options.resize || false,
      props: {
        title: '可拖拽modal',
        content: `拖拽: ${options.drag ? '啟用' : '禁用'}, 調整大小: ${options.resize ? '啟用' : '禁用'}`,
        type: 'draggable',
        showDragHandle: options.drag,
        showResizeHandle: options.resize,
      },
      events: {
        confirm: () => {
          console.log('可拖拽modal確認事件觸發')
        },
        cancel: () => {
          console.log('可拖拽modal取消事件觸發')
        },
      },
    })

    if (result.success) {
      console.log(`成功開啟可拖拽modal: ${result.modalId}`)
    } else {
      console.error(`開啟可拖拽modal失敗: ${result.msg}`)
    }
  } catch (error) {
    console.error(`開啟可拖拽modal異常: ${error}`)
  }
}

// 開啟自訂位置modal
const openCustomPositionModal = async () => {
  try {
    const result = await modalManager.openModal('test', 'draggable', {
      position: {
        top: '100px',
        left: '100px',
      },
      props: {
        title: '自訂位置modal',
        content: '這個modal在自訂位置 (top: 100px, left: 100px)',
        type: 'custom',
      },
    })

    if (result.success) {
      console.log(`成功開啟自訂位置modal: ${result.modalId}`)
    }
  } catch (error) {
    console.error(`開啟自訂位置modal異常: ${error}`)
  }
}

// 開啟帶自訂事件的modal
const openModalWithEvents = async () => {
  try {
    const result = await modalManager.openModal('test', 'draggable', {
      drag: true,
      props: {
        title: '自訂事件modal',
        content: '這個modal有自訂事件處理功能',
        type: 'events',
        showDragHandle: true,
      },
      events: {
        save: (data: any) => {
          console.log(`儲存事件觸發，資料: ${JSON.stringify(data)}`)
        },
        delete: () => {
          console.log('刪除事件觸發')
        },
        export: (format: string) => {
          console.log(`匯出事件觸發，格式: ${format}`)
        },
      },
    })

    if (result.success) {
      console.log(`成功開啟自訂事件modal: ${result.modalId}`)
    }
  } catch (error) {
    console.error(`開啟自訂事件modal異常: ${error}`)
  }
}

// 在指定容器中開啟modal
const openModalInContainer = async () => {
  try {
    const result = await modalManager.openModal('test', 'draggable', {
      id: 'custom-container',
      drag: true,
      props: {
        title: '容器內modal',
        content: '這個modal在自訂容器中開啟',
        type: 'container',
        showDragHandle: true,
      },
    })

    if (result.success) {
      console.log(`成功在容器中開啟modal: ${result.modalId}`)
    }
  } catch (error) {
    console.error(`在容器中開啟modal異常: ${error}`)
  }
}

// 開啟多個modal
const openMultipleModals = async () => {
  try {
    const promises = []

    // 開啟3個不同的modal
    for (let i = 1; i <= 3; i++) {
      promises.push(
        modalManager.openModal('test', 'draggable', {
          drag: true,
          resize: i === 3,
          position: {
            top: `${50 + i * 60}px`,
            left: `${50 + i * 60}px`,
          },
          props: {
            title: `modal ${i}`,
            content: `這是第 ${i} 個modal${i === 3 ? '，支援調整大小' : ''}`,
            type: 'multiple',
            index: i,
            showDragHandle: true,
            showResizeHandle: i === 3,
          },
        }),
      )
    }

    const results = await Promise.all(promises)
    const successCount = results.filter((r) => r.success).length

    console.log(`成功開啟 ${successCount} 個modal`)
  } catch (error) {
    console.error(`開啟多個modal異常: ${error}`)
  }
}

// 顯示modal列表
const showModalList = () => {
  const modals = modalManager.getOpenModals()

  if (modals.length === 0) {
    console.log('目前沒有開啟的modal')
    return
  }

  const modalInfo = modals.map((modal) => ({
    id: modal.id,
    name: modal.name,
    hasDrag: !!modal.drag,
    hasResize: !!modal.resize,
  }))

  console.log(`目前開啟的modal: ${modalInfo.length} 個`)
  console.log('modal詳細資訊:', modalInfo)
}

// 關閉所有modal
const closeAllModals = () => {
  const count = modalManager.removeAllModal()
  console.log(`成功關閉 ${count} 個modal`)
}

// 獲取方向名稱
const getDirectionName = (direction: modalDirection): string => {
  const nameMap = {
    center: '居中',
    top: '頂部',
    bottom: '底部',
    left: '左側',
    right: '右側',
  }
  return nameMap[direction] || direction
}

// 生命週期
onMounted(() => {
  console.log('Modal Manager Demo 已載入')
})

onUnmounted(() => {
  // 清理所有modal
  modalManager.removeAllModal()
})
</script>

<style scoped>
/* 全局樣式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f8f9fa;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 頁面標題 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
  text-align: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.icon {
  font-size: 2.5rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
}

/* 主要內容容器 (帶有 overflow) */
.content-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 主要內容 */
.main-content {
  padding: 40px 0;
  min-height: 100%;
}

/* 控制面板 */
.control-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.panel-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.panel-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.section-title {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.section-description {
  margin: 0 0 20px 0;
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.4;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.btn {
  padding: 12px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 130px;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.btn-info {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

/* 示範容器區域 */
.demo-container-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  border: 1px solid #e9ecef;
}

.container-title {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
}

.container-description {
  margin: 0 0 20px 0;
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.4;
}

.custom-container {
  background: linear-gradient(135deg, #f1f3f4, #e8eaf6);
  border: 2px dashed #9aa0a6;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.container-content {
  position: relative;
  z-index: 1;
}

.content-title {
  margin: 0 0 10px 0;
  color: #5f6368;
  font-size: 1.3rem;
  font-weight: 600;
}

.content-text {
  margin: 0 0 20px 0;
  color: #80868b;
  font-size: 1rem;
  line-height: 1.5;
}

/* 滾動條樣式 */
.content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #c1c1c1, #a8a8a8);
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #a8a8a8, #888);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .control-panel {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .container {
    padding: 0 15px;
  }

  .main-content {
    padding: 20px 0;
  }

  .custom-container {
    min-height: 200px;
    padding: 20px 15px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 10px;
  }

  .icon {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .btn {
    padding: 10px 14px;
    font-size: 13px;
  }
}

/* 動畫效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-section {
  animation: fadeInUp 0.6s ease-out;
}

.panel-section:nth-child(1) {
  animation-delay: 0.1s;
}
.panel-section:nth-child(2) {
  animation-delay: 0.2s;
}
.panel-section:nth-child(3) {
  animation-delay: 0.3s;
}
.panel-section:nth-child(4) {
  animation-delay: 0.4s;
}

.demo-container-section {
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

/* 特殊效果 */
.custom-container::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #667eea, #764ba2, #667eea);
  border-radius: 14px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.custom-container:hover::before {
  opacity: 0.1;
  animation: borderGlow 2s infinite alternate;
}

@keyframes borderGlow {
  0% {
    opacity: 0.1;
  }
  100% {
    opacity: 0.3;
  }
}

/* 深色主題支持 */
@media (prefers-color-scheme: dark) {
  .app-container {
    background: #1a1a1a;
    color: #e9ecef;
  }

  .panel-section,
  .demo-container-section {
    background: #2d2d2d;
    border-color: #404040;
  }

  .section-title,
  .container-title {
    color: #f8f9fa;
  }

  .section-description,
  .container-description {
    color: #adb5bd;
  }

  .custom-container {
    background: linear-gradient(135deg, #3d3d3d, #4a4a4a);
    border-color: #6c757d;
  }

  .content-title {
    color: #f8f9fa;
  }

  .content-text {
    color: #ced4da;
  }
}
</style>
