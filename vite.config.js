import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	test: {
		include: ['tests/*.{test,spec}.{js,ts}'],

		// Enable "document" and etc in unit tests, enabled via 'jsdom' package and initialized into global scope via
		// this config directive for us with Vite.
		globals: true,
		environment: 'jsdom',
	}
});
