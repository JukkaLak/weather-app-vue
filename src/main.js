import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import translations from './translations'

createApp(App)
    .use(translations)
    .mount('#app')
