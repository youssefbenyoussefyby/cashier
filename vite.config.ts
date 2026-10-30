import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue()
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: true,
  // 2. tauri expects a fixed port, fail if that port is not available
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        additional: 'splashscreen.html',
        anotherpage:'bl.html',
        invoicepage:'invoice.html',
        loginpage:'login.html',
        singuppage:'singup.html',
        
         // Add other entry points here
      }
    }
  },
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
