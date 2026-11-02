import { afterEach, describe, expect, it } from "vitest"
import type { FastifyInstance } from "fastify"

describe("GET /health", () => {
	let app: FastifyInstance | undefined

	afterEach(async () => {
		if (app) {
			await app.close()
			app = undefined
		}
	})

	it("reports ok", async () => {
		const { buildApp } = await import("../src/app.js")
		app = await buildApp()

		const response = await app.inject({ method: "GET", url: "/health" })

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({ status: "ok" })
	})
})
