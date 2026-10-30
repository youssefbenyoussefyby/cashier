import { createApp } from "vue";
import App from "./invoice.vue";
import "./assets/style.css"
import ToastService from 'primevue/toastservice';

const app = createApp(App);
app.use(ToastService);
app.mount("#app");