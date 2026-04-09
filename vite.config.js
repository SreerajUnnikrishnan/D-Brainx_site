import { defineConfig } from 'vite';

export default defineConfig({
    css: {
        postcss: {
            // Empty object prevents Vite from searching for postcss.config.js in parent directories
        }
    }
});
