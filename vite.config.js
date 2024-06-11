import { defineConfig } from 'vite';




export default defineConfig(() => {
    return  {
        build: {
            target: 'es2017',
            sourcemap: true
        },
        plugins: [],
        modernPolyfills: true
    };
});
