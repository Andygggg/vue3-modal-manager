<template>
  <div class="demo-container">
    <header class="demo-header">
      <h1>Modal Manager Demo</h1>
      <p>Vue3 + TypeScript</p>
    </header>

    <div class="demo-content">
      <!-- 1. 固定式 Modal -->
      <section class="demo-section">
        <div class="section-header">
          <h2>1. 固定式 Modal</h2>
          <p>居中顯示，固定位置</p>
        </div>

        <div class="demo-controls">
          <button class="btn btn-primary" @click="openFixedModal"> 開啟固定式 Modal </button>
        </div>

        <div class="code-example">
          <h4>程式碼用法：</h4>
          <pre><code>// 開啟固定式 Modal
const openFixedModal = async () => {
  const result = await modalManager.openModal('test', {
    props: { title: '固定式 Modal', content: '這是一個固定位置的視窗' }
  })
  console.log('Modal 開啟結果:', result)
}</code></pre>
        </div>
      </section>

      <!-- 2. 拖曳式 Modal (基礎功能) -->
      <section class="demo-section">
        <div class="section-header">
          <h2>2. 拖曳式 Modal (基礎功能)</h2>
          <p>懸浮視窗，可配置拖曳和縮放功能</p>
        </div>

        <div class="demo-controls">
          <div class="checkbox-group">
            <label> <input type="checkbox" v-model="dragOptions.drag" /> 啟用拖曳 </label>
            <label> <input type="checkbox" v-model="dragOptions.resize" /> 啟用縮放 </label>
          </div>
          <button class="btn btn-success" @click="openDraggableModal"> 開啟拖曳式 Modal </button>
        </div>

        <div class="code-example">
          <h4>程式碼用法：</h4>
          <pre><code>// 開啟可拖曳的 Modal
const openDraggableModal = async () => {
  const result = await modalManager.openPopover('test', {
    props: { 
      title: '拖曳式 Modal', 
      content: '這是一個可拖曳的視窗',
      showDragHandle: true 
    },
    drag: {{ dragOptions.drag }},
    resize: {{ dragOptions.resize }}
  })
}</code></pre>
        </div>
      </section>

      <!-- 3. 拖曳綁定/解除 -->
      <section class="demo-section">
        <div class="section-header">
          <h2>3. 動態拖曳控制</h2>
          <p>動態綁定和解除拖曳功能</p>
        </div>

        <div class="demo-controls">
          <button class="btn btn-warning" @click="openModalWithDragControl">
            開啟可控制拖曳的 Modal
          </button>
          <div class="control-buttons" v-if="currentDragModalId">
            <button class="btn btn-sm btn-success" @click="bindDrag"> 綁定拖曳 </button>
            <button class="btn btn-sm btn-danger" @click="unbindDrag"> 解除拖曳 </button>
          </div>
        </div>

        <div class="code-example">
          <h4>程式碼用法：</h4>
          <pre><code>// 動態綁定拖曳
const bindDrag = () => {
  modalManager.bindDrag(currentDragModalId.value)
}

// 動態解除拖曳
const unbindDrag = () => {
  modalManager.unbindDrag(currentDragModalId.value)
}</code></pre>
        </div>
      </section>

      <!-- 4. 移動圖層 -->
      <section class="demo-section">
        <div class="section-header">
          <h2>4. 移動圖層功能</h2>
          <p>將 Modal 移動到指定的容器中</p>
        </div>

        <div class="demo-controls">
          <button class="btn btn-info" @click="openModalForLayerMove">
            開啟 Modal (準備移動)
          </button>
          <div class="control-buttons" v-if="layerMoveModalId">
            <button class="btn btn-sm btn-primary" @click="moveToContainer1"> 移動到容器1 </button>
            <button class="btn btn-sm btn-secondary" @click="moveToContainer2">
              移動到容器2
            </button>
          </div>
        </div>

        <div class="layer-containers">
          <div id="container1" class="layer-container">
            <h4>容器 1</h4>
            <p>Modal 可以移動到這裡</p>
          </div>
          <div id="container2" class="layer-container">
            <h4>容器 2</h4>
            <p>或者移動到這裡</p>
          </div>
        </div>

        <div class="code-example">
          <h4>程式碼用法：</h4>
          <pre><code>// 移動 Modal 到指定容器
const moveToContainer1 = () => {
  modalManager.moveToLayers(layerMoveModalId.value, 'container1')
}

const moveToContainer2 = () => {
  modalManager.moveToLayers(layerMoveModalId.value, 'container2')
}</code></pre>
        </div>
      </section>

      <!-- 5. 多個拖曳式 Modal -->
      <section class="demo-section">
        <div class="section-header">
          <h2>5. 多個拖曳式 Modal</h2>
          <p>同時開啟多個可拖曳的視窗</p>
        </div>

        <div class="demo-controls">
          <button class="btn btn-purple" @click="openMultipleModals"> 開啟多個 Modal </button>
          <button class="btn btn-danger" @click="closeAllModals"> 關閉所有 Modal </button>
        </div>

        <div class="modal-list" v-if="multipleModalIds.length > 0">
          <h4>已開啟的 Modal：</h4>
          <div class="modal-item" v-for="(modalId, index) in multipleModalIds" :key="modalId">
            <span>Modal {{ index + 1 }}: {{ modalId }}</span>
            <button class="btn btn-sm btn-danger" @click="closeSpecificModal(modalId)">
              關閉
            </button>
          </div>
        </div>

        <div class="code-example">
          <h4>程式碼用法：</h4>
          <pre><code>// 開啟多個 Modal
const openMultipleModals = async () => {
  for (let i = 1; i ＜＜= 3; i++) {
    const result = await modalManager.openPopovers('test', {
      props: { 
        title: `Modal ${i}`, 
        content: `這是第 ${i} 個視窗`,
        showDragHandle: true 
      },
      drag: true,
      position: {
        top: `${50 + i * 30}px`,
        left: `${100 + i * 50}px`
      }
    })
    if (result.success) {
      multipleModalIds.value.push(result.modalId)
    }
  }
}

// 關閉所有 Modal
const closeAllModals = () => {
  modalManager.removeAllModal()
  multipleModalIds.value = []
}</code></pre>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useModalManager } from '../lib'

// Modal Manager 實例
const modalManager = useModalManager()

// 響應式數據
const dragOptions = ref({
  drag: true,
  resize: true,
})

const currentDragModalId = ref<string>('')
const layerMoveModalId = ref<string>('')
const multipleModalIds = ref<string[]>([])

// 1. 開啟固定式 Modal
const openFixedModal = async () => {
  const result = await modalManager.openModal('test', {
    fixedPosition: 'right',
    props: {
      title: '固定式 Modal',
      content: '這是一個固定位置的彈窗，會有全屏遮罩效果',
    },
  })
  console.log('Fixed Modal 開啟結果:', result)
}

// 2. 開啟拖曳式 Modal
const openDraggableModal = async () => {
  const result = await modalManager.openPopover('test', {
    props: {
      title: '拖曳式 Modal',
      content: '這是一個可拖曳的彈窗，可以移動位置',
      showDragHandle: true,
    },
    drag: dragOptions.value.drag,
    resize: dragOptions.value.resize,
  })
  console.log('Draggable Modal 開啟結果:', result)
}

// 3. 開啟可控制拖曳的 Modal
const openModalWithDragControl = async () => {
  const result = await modalManager.openPopover('test', {
    props: {
      title: '可控制拖曳的 Modal',
      content: '使用下方按鈕來動態控制拖曳功能',
      showDragHandle: true,
    },
    drag: false, // 初始不啟用拖曳
  })

  if (result.success) {
    currentDragModalId.value = result.modalId
  }
}

// 綁定拖曳
const bindDrag = () => {
  if (currentDragModalId.value) {
    modalManager.bindDrag(currentDragModalId.value)
    console.log('已綁定拖曳功能')
  }
}

// 解除拖曳
const unbindDrag = () => {
  if (currentDragModalId.value) {
    modalManager.unbindDrag(currentDragModalId.value)
    console.log('已解除拖曳功能')
  }
}

// 4. 開啟用於移動圖層的 Modal
const openModalForLayerMove = async () => {
  const result = await modalManager.openPopover('test', {
    props: {
      title: '圖層移動 Modal',
      content: '這個 Modal 可以移動到不同的容器中',
      showDragHandle: true,
    },
    drag: true,
  })

  if (result.success) {
    layerMoveModalId.value = result.modalId
  }
}

// 移動到容器1
const moveToContainer1 = () => {
  if (layerMoveModalId.value) {
    modalManager.moveToLayers(layerMoveModalId.value, 'container1')
    console.log('Modal 已移動到容器1')
  }
}

// 移動到容器2
const moveToContainer2 = () => {
  if (layerMoveModalId.value) {
    modalManager.moveToLayers(layerMoveModalId.value, 'container2')
    console.log('Modal 已移動到容器2')
  }
}

// 5. 開啟多個 Modal
const openMultipleModals = async () => {
  multipleModalIds.value = [] // 清空之前的記錄

  for (let i = 1; i <= 3; i++) {
    const result = await modalManager.openPopovers('test', {
      props: {
        title: `拖曳式 Modal ${i}`,
        content: `這是第 ${i} 個彈窗，可以拖曳移動`,
        showDragHandle: true,
      },
      drag: true,
      position: {
        top: `${50 + i * 30}px`,
        left: `${100 + i * 50}px`,
      },
    })

    if (result.success) {
      multipleModalIds.value.push(result.modalId)
      console.log(`Modal ${i} 開啟成功:`, result.modalId)
    }
  }
}

// 關閉特定 Modal
const closeSpecificModal = (modalId: string) => {
  modalManager.closeModal(modalId)
  const index = multipleModalIds.value.indexOf(modalId)
  if (index > -1) {
    multipleModalIds.value.splice(index, 1)
  }
}

// 關閉所有 Modal
const closeAllModals = () => {
  modalManager.removeAllModal()
  multipleModalIds.value = []
  currentDragModalId.value = ''
  layerMoveModalId.value = ''
  console.log('所有 Modal 已關閉')
}

onMounted(() => {
  console.log('Modal Manager Demo 頁面已載入')
})
</script>

<style scoped>
.demo-container {
  max-width: 1200px;
  height: 100vh;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;
}

.demo-header {
  width: 100%;
  height: 150px;
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.demo-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.demo-header p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.demo-content {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.section-header p {
  color: #6c757d;
  margin: 0 0 20px 0;
  font-size: 1rem;
}

.demo-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.checkbox-group {
  display: flex;
  gap: 15px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
}

.checkbox-group input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #007bff;
}

.control-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #1e7e34;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #d39e00;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #117a8b;
}

.btn-purple {
  background: #6f42c1;
  color: white;
}

.btn-purple:hover {
  background: #5a32a3;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #bd2130;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.layer-containers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.layer-container {
  height: 500px;
  padding: 20px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  text-align: center;
  background: #f8f9fa;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.layer-container h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.layer-container p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.modal-list {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.modal-list h4 {
  margin: 0 0 15px 0;
  color: #495057;
}

.modal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-item span {
  font-size: 14px;
  color: #495057;
  font-family: 'Courier New', monospace;
}

.code-example {
  background: #f8f9fa;
  border-left: 4px solid #007bff;
  padding: 20px;
  border-radius: 0 8px 8px 0;
}

.code-example h4 {
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 1.1rem;
}

.code-example pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.code-example code {
  font-family: 'Fira Code', 'Courier New', monospace;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .demo-container {
    padding: 15px;
  }

  .demo-header h1 {
    font-size: 2rem;
  }

  .demo-section {
    padding: 20px;
  }

  .layer-containers {
    grid-template-columns: 1fr;
  }

  .demo-controls,
  .control-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    justify-content: center;
  }
}
</style>
