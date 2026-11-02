import { FastifyInstance } from "fastify"
import { getCatalogueController } from "@controllers/catalogue.controller.js"

export function registerCatalogue(app: FastifyInstance) {
	// Add required schemas
	app.addSchema({
		$id: "CatalogueItem",
		type: "object",
		required: [
			"supplier",
			"supplierRef",
			"name",
			"brand",
			"manufacturerCode",
			"packSize",
			"unitPriceGbp",
			"vatRate",
			"matches",
		],
		properties: {
			supplier: { type: "string" },
			supplierRef: { type: "string" },
			name: { type: "string" },
			brand: { type: "string" },
			manufacturerCode: { type: "string" },
			packSize: { type: "string" },
			unitPriceGbp: { type: "number" },
			vatRate: { type: "number" },
			matches: { type: "array", items: { $ref: "CatalogueMatchItem#" } },
		},
	})
	app.addSchema({
		$id: "CatalogueMatchItem",
		type: "object",
		required: [
			"supplier",
			"supplierRef",
			"name",
			"brand",
			"manufacturerCode",
			"packSize",
			"unitPriceGbp",
			"vatRate",
			"matchType",
			"confidence",
			"priceDifferenceGbp",
			"reason",
		],
		properties: {
			supplier: { type: "string" },
			supplierRef: { type: "string" },
			name: { type: "string" },
			brand: { type: "string" },
			manufacturerCode: { type: "string" },
			packSize: { type: "string" },
			unitPriceGbp: { type: "number" },
			vatRate: { type: "number" },
			matchType: { type: "string", enum: ["identical", "similar"] },
			confidence: { type: "number" },
			priceDifferenceGbp: { type: "number" },
			reason: { type: "string" },
		},
	})
	// Add resources
	app.get(
		"/catalogue",
		{
			schema: {
				tags: ["Catalogue"],
				description: "Get catalogue items enriched with matched products",
				response: {
					200: {
						type: "array",
						items: { $ref: "CatalogueItem" },
					},
				},
			},
		},
		getCatalogueController
	)
}
