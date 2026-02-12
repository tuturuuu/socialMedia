import './assets/css/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css'
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import {store } from './store'

const app = createApp(App)

app.use(bootstrap)
app.use(router)
app.use(store)

app.mount('#app')
