# vue3-modal-manager

一個完整的、類型安全的 Vue.js modal管理系統，提供靈活的modal創建、管理和交互功能。

## ✨ 主要特性

- **雙模式支援**: 固定modal (fixed) 和可拖拽modal (draggable)
- **類型安全**: 完整的 TypeScript 支援，方法重載確保類型安全
- **Vue.js 整合**: 無縫的 Vue.js 插件整合，支援組件動態載入
- **拖拽功能**: 拖拽移動
- **調整大小**: 8方向調整大小功能
- **層級管理**: z-index 管理和置頂功能
- **容器支援**: 支援在指定容器中打開modal
- **事件系統**: 完整的自訂事件支援
- **邊界計算**: 自動計算邊界限制，防止超出容器範圍

## 📁 專案結構

```
lib/
├── core/
│   └── ModalManager.ts        # 核心管理器
├── features/
│   ├── ModalResize.ts         # 調整大小功能
│   └── ModalDrag.ts           # 拖拽功能
├── types/
│   ├── modal.params.ts        # 核心類型定義
│   ├── modal.resize.ts        # 調整大小類型
│   ├── modal.drag.ts          # 拖拽類型
│   └── index.ts               # 類型統一匯出
└── index.ts                   # 主要入口檔案
```

## 🚀 快速開始

### 安裝和初始化

```typescript
// main.ts
import { createApp } from 'vue'
import { createModalManager } from './lib'
import App from './App.vue'

// 創建modal管理器
const modalManager = createModalManager([
  {
    name: 'LoginModal',
    component: () => import('./components/LoginModal.vue'),
  },
  {
    name: 'SettingsModal',
    component: () => import('./components/SettingsModal.vue'),
  },
])

const app = createApp(App)

// 安裝插件
app.use(modalManager)

app.mount('#app')
```

### 基本使用

```typescript
// 在組件中使用
import { useModalManager } from './lib'

export default {
  setup() {
    const modalManager = useModalManager()

    // 打開固定modal
    const openFixedModal = async () => {
      const result = await modalManager.openModal('LoginModal', 'fixed', {
        direction: 'center',
        props: {
          title: '登入',
          message: '請輸入您的憑證',
        },
        events: {
          confirm: (data) => console.log('登入成功', data),
          cancel: () => console.log('取消登入'),
        },
      })

      if (result.success) {
        console.log('modal已開啟:', result.modalId)
      }
    }

    // 打開可拖拽modal
    const openDraggableModal = async () => {
      await modalManager.openModal('SettingsModal', 'draggable', {
        drag: true,
        resize: true,
        position: {
          top: '100px',
          left: '200px',
        },
        props: {
          title: '設定',
          data: { theme: 'dark' },
        },
      })
    }

    return {
      openFixedModal,
      openDraggableModal,
    }
  },
}
```

## 📖 API 文檔

### ModalManager

#### `openModal(name, mode, params)`

打開modal的主要方法，支援方法重載確保類型安全。

**固定modal**

```typescript
await modalManager.openModal('LoginModal', 'fixed', {
  direction?: 'center' | 'top' | 'bottom' | 'left' | 'right',
  id?: string,              // 目標容器ID
  props?: Record<string, any>,
  events?: Record<string, Function>
})
```

**可拖拽modal**

```typescript
await modalManager.openModal('SettingsModal', 'draggable', {
  drag?: boolean,           // 啟用拖拽功能
  resize?: boolean,         // 啟用調整大小功能
  position?: {              // 自訂位置
    top?: string,
    left?: string,
    right?: string,
    bottom?: string
  },
  id?: string,              // 目標容器ID
  props?: Record<string, any>,
  events?: Record<string, Function>
})
```

#### 其他方法

```typescript
// 關閉指定modal
modalManager.closeModal(modalId: string): boolean

// 關閉所有modal
modalManager.removeAllModal(): number

// 移動modal到指定容器
modalManager.moveToLayers(modalId: string, targetId: string): boolean

// 獲取所有開啟的modal
modalManager.getOpenModals(): modalInfo[]

// 檢查modal是否存在
modalManager.hasModal(modalId: string): boolean

// 根據名稱查找modal
modalManager.findModalsByName(name: string): modalInfo[]

// 獲取modal數量
modalManager.getModalCount(): number
```

## 🎨 modal組件範例

### 基本modal組件

```vue
<template>
  <div class="modal-content">
    <!-- 拖拽把手 (可選) -->
    <div v-if="showDragHandle" :modalDraggableArea="modalId" class="modal-header drag-handle">
      <h3>{{ title }}</h3>
      <button @click="$emit('closed')">×</button>
    </div>

    <!-- modal內容 -->
    <div class="modal-body">
      <p>{{ content }}</p>
    </div>

    <!-- modal底部 -->
    <div class="modal-footer">
      <button @click="handleConfirm" class="btn-primary"> 確認 </button>
      <button @click="$emit('closed')" class="btn-secondary"> 取消 </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modalId: string
  title?: string
  content?: string
  showDragHandle?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  closed: []
  confirm: [data: any]
}>()

const handleConfirm = () => {
  emit('confirm', { message: '確認操作' })
  emit('closed')
}
</script>
```

## 🎪 事件系統

### 拖拽事件

```typescript
// 監聽拖拽事件
modalInfo.container.addEventListener('modal-drag', (e) => {
  console.log('拖拽中:', e.detail.x, e.detail.y)
})

modalInfo.container.addEventListener('modal-drag-end', (e) => {
  console.log('拖拽結束:', e.detail.x, e.detail.y)
})
```

### 調整大小事件

```typescript
// 監聽調整大小事件
modalInfo.container.addEventListener('modal-resize', (e) => {
  console.log('調整中:', e.detail.width, e.detail.height)
})

modalInfo.container.addEventListener('modal-resize-end', (e) => {
  console.log('調整完成:', e.detail.width, e.detail.height)
})
```

## 🎯 進階使用

### 在指定容器中打開modal

```typescript
// HTML
<div id="custom-container" style="position: relative;">
  <!-- modal將在這個容器中打開 -->
</div>

// JavaScript
await modalManager.openModal('MyModal', 'draggable', {
  id: 'custom-container',
  drag: true
})
```

### 自訂事件處理

```typescript
await modalManager.openModal('DataModal', 'draggable', {
  props: {
    data: { id: 1, name: 'Test' },
  },
  events: {
    save: (data) => {
      console.log('儲存資料:', data)
      // 處理儲存邏輯
    },
    delete: () => {
      console.log('刪除資料')
      // 處理刪除邏輯
    },
    export: (format) => {
      console.log('匯出格式:', format)
      // 處理匯出邏輯
    },
  },
})
```

### 多modal管理

```typescript
// 打開多個modal
const modals = await Promise.all([
  modalManager.openModal('Modal1', 'draggable', { drag: true }),
  modalManager.openModal('Modal2', 'draggable', { resize: true }),
  modalManager.openModal('Modal3', 'fixed', { direction: 'top' }),
])

// 查看所有開啟的modal
const openModals = modalManager.getOpenModals()
console.log(`目前有 ${openModals.length} 個modal開啟`)

// 關閉所有modal
const closedCount = modalManager.removeAllModal()
console.log(`關閉了 ${closedCount} 個modal`)
```

## 🔧 類型定義

### 核心類型

```typescript
// modal模式
type modalMode = 'fixed' | 'draggable'

// 固定modal參數
interface fixedModalParams {
  direction?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  id?: string
  props?: Record<string, any>
  events?: Record<string, Function>
}

// 可拖拽模modal參數
interface draggableModalParams {
  drag?: boolean
  resize?: boolean
  position?: {
    top?: string
    left?: string
    right?: string
    bottom?: string
  }
  id?: string
  props?: Record<string, any>
  events?: Record<string, Function>
}

// modal資訊
interface modalInfo {
  id: string
  name: string
  container: HTMLElement
  boxElement: HTMLElement
  resize?: ModalResize | null
  drag?: ModalDrag | null
}
```

## 📋 瀏覽器支援

- **Chrome** 87+ (支援 CSS inset 屬性)
- **Firefox** 66+
- **Safari** 14.1+
- **Edge** 87+

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

---

## 📝 更新日誌

### v2.0.0

- 🔧 修復初始位置跳躍問題
- ✨ 重構架構，提升類型安全性
- 🚀 改進 handles 位置更新機制
- 💡 優化程式碼結構和可維護性
- 📦 完整的功能模組化

### v1.0.0

- 🎉 初始版本發布
- ✨ 基礎modal管理功能
