# vue3-modal-manager[Demo](https://andygggg.github.io/vue3-modal-manager/)

A flexible and extensible modal manager built with Vue 3 and TypeScript. This library allows you to dynamically render custom modals with fully configurable content and styles, making it easy to manage dialogs, popups, and overlay components in your Vue applications.

## Features

- 🎯 TypeScript support
- 🎨 Flexible positioning
- 🖱️ Draggable & Resize modals
- 📦 Multiple modal support
- 🔄 Modal stacking management
- 🎭 Customizable modal component

## Installation

```bash
npm install vue3-modal-manager
# or
yarn add vue3-modal-manager
```

## Usage

1. Create and register your modal routes just like regular Vue routes. Next, import the ModalManager and initialize it inside your main.ts to enable global modal handling:

```typescript
//modalRouter.ts
import { createModalManager } from '../lib'

const modalRouter = createModalManager([
  {
    name: 'test',
    component: () => import('@/components/testModal.vue'),
  },
])
export default modalRouter

//main.ts
import { createApp } from 'vue'
import App from './App.vue'
import modalRouter from './modalRouter'

const app = createApp(App)

app.use(modalRouter)
app.mount('#app')
```

2. Use the modal manager in your components:

```vue
<script setup lang="ts">
import { useModalManager } from 'vue3-modal-manager'

const modalManager = useModalManager()

const openFixedModal = async () => {
  const result = await modalManager.openModal('test', {
    props: {
      title: '固定式 Modal',
      content: '這是一個固定位置的彈窗，會有全屏遮罩效果',
    },
  })
  console.log('Fixed Modal 開啟結果:', result)
}
</script>
```

## API

### ModalManager

- `openModal(name: string, options?: ModalParams)`: Open a fixed position modal
- `openPopover(name: string, options?: ModalParams)`: Open a draggable modal (single instance)
- `openPopovers(name: string, options?: ModalParams)`: Open a draggable modal (multiple instances)
- `closeModal(modalId: string)`: Close a specific modal
- `removeAllModal()`: Remove all modals
- `moveToLayers(modalId: string, targetId: string)`: Move modal to different layer

### Options

```typescript
interface modalParams {
  drag?: boolean
  id?: string
  position?: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
  props?: Record<string, any>
  events?: Record<string, Function>
}
```

## License

MIT
