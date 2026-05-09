import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Глобальные стили (можно импортировать CSS или SCSS)
import './style.css'

// Создаём приложение
const app = createApp(App)

// Подключаем Pinia (хранилище состояний)
const pinia = createPinia()
app.use(pinia)

// Подключаем маршрутизатор
app.use(router)

// Монтируем приложение
app.mount('#app')