import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: '/react_app/', // Make sure this matches the path in your WAMP server
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {}
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.29.184:5000', // Your backend server URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
