import { defineConfig } from "vitest/config"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
	test: {
		environment: "node",
		include: ["test/**/*.test.ts"],
		clearMocks: true,
		restoreMocks: true,
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"@config": fileURLToPath(new URL("./src/config", import.meta.url)),
			"@controllers": fileURLToPath(new URL("./src/controllers", import.meta.url)),
			"@models": fileURLToPath(new URL("./src/models", import.meta.url)),
			"@routes": fileURLToPath(new URL("./src/routes", import.meta.url)),
			"@services": fileURLToPath(new URL("./src/services", import.meta.url)),
			"@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
		},
	},
})
