import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import modalRouter from './modalRouter'

const app = createApp(App)

app.use(modalRouter)
app.mount('#app')
