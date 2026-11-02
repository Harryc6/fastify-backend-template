import Fastify from "fastify"
import fastifyHttpErrorsEnhanced from "fastify-http-errors-enhanced"
import fastifyCors from "@fastify/cors"
import { registerCatalogue } from "@routes/catalogue.routes.js"
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import Config from "@config/config.js"

export async function buildApp() {
	const app = Fastify({ logger: true })

	// Plugins
	// Enhanced HTTP error handling.
	await app.register(fastifyHttpErrorsEnhanced)
	// CORS — tighten the origin allowlist for the deployed frontend.
	await app.register(fastifyCors, { origin: Config.nodeEnv === "production" ? [] : true })
	// Interface for viewing, interacting with, and testing the API documentation.
	await app.register(fastifySwagger, {
		openapi: {
			openapi: "3.0.0",
			info: {
				title: Config.appName,
				description: "API documentation",
				version: "0.1.0",
			},
			servers: [
				{
					url: "http://localhost:" + Config.port,
					description: `${Config.appName} server`,
				},
			],
			tags: [{ name: "Catalogue", description: "Get catalogue items" }],
			externalDocs: {
				url: "https://swagger.io",
				description: "Find more info here",
			},
		},
	})

	await app.register(fastifySwaggerUi, { routePrefix: "/documentation" })

	// Liveness probe (container/orchestrator health checks)
	app.get("/health", { schema: { tags: ["Health"], response: { 200: { type: "object", properties: { status: { type: "string" } } } } } }, () => ({ status: "ok" }))

	// Register Routes
	registerCatalogue(app)

	await app.ready()

	return app
}
