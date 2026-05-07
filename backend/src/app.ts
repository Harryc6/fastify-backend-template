import Fastify from "fastify"
import fastifyHttpErrorsEnhanced from "fastify-http-errors-enhanced"
import { registerCatalogue } from "@routes/catalogue.routes.js"
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import Config from "@config/config.js"

export async function buildApp() {
	const app = Fastify({ logger: true })

	// Plugins
	// Enhanced HTTP error handling.
	await app.register(fastifyHttpErrorsEnhanced)
	// Interface for viewing, interacting with, and testing the API documentation.
	await app.register(fastifySwagger, {
		openapi: {
			openapi: "3.0.0",
			info: {
				title: "Dentstock Test Swagger",
				description: "Testing the Fastify swagger API",
				version: "0.1.0",
			},
			servers: [
				{
					url: "http://localhost:" + Config.port,
					description: "Dentstock server",
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

	// Register Routes
	registerCatalogue(app)

	await app.ready()

	return app
}

const app = await buildApp()

export default app
