import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// Create the app instance
const app = createApp(App);

// Initialize Pinia
const pinia = createPinia();
app.use(pinia);

// Mount the app
app.mount('#app');
