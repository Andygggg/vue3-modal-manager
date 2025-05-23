import { createModalManager } from '../lib'

const modalRouter = createModalManager([
  {
    name: 'test',
    component: () => import('@/components/testModal.vue'),
  },
])

export default modalRouter
