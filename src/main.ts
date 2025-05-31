import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'
import Ripple from 'primevue/ripple'

import App from './App.vue'
import router from './router'

// Import PrimeVue theme and styles
import 'primevue/resources/themes/aura-dark-amber/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

// Import Tailwind CSS
import './assets/main.css'

// Create Vue app
const app = createApp(App)

// Create Pinia store
const pinia = createPinia()

// Configure PrimeVue
app.use(PrimeVue, {
  ripple: true,
  inputStyle: 'filled'
})

// Add PrimeVue services
app.use(ToastService)
app.use(ConfirmationService)

// Add PrimeVue directives
app.directive('tooltip', Tooltip)
app.directive('ripple', Ripple)

// Add Pinia and Router
app.use(pinia)
app.use(router)

// Mount the app
app.mount('#app')
