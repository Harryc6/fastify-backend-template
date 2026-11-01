import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { FastifyInstance } from "fastify"
import type { CatalogueProductResponse } from "../src/models/catalogue.types.js"

const { getCatalogueMock } = vi.hoisted(() => ({
	getCatalogueMock: vi.fn(),
}))

vi.mock("@services/catalogue/catalogue.service.js", () => ({
	getCatalogue: getCatalogueMock,
}))

describe("GET /catalogue", () => {
	let app: FastifyInstance | undefined

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(async () => {
		if (app) {
			await app.close()
			app = undefined
		}
	})

	it("returns enriched catalogue items", async () => {
		const { buildApp } = await import("../src/app.js")
		app = await buildApp()

		getCatalogueMock.mockResolvedValue([
			{
				supplier: "Novadent",
				supplierRef: "ND-001",
				name: "Nitrile Examination Gloves Extra Small",
				brand: "NovaDent ProTouch",
				manufacturerCode: "MED-NIT-XS-100",
				packSize: "box/100",
				unitPriceGbp: 7.8,
				vatRate: 0,
				matches: [
					{
						supplier: "PrimeCare",
						supplierRef: "PC-001",
						name: "Nitrile Exam Gloves X-Small Powder-Free",
						brand: "PrimeCare Essentials",
						manufacturerCode: "MED-NIT-XS-100",
						packSize: "100 pack",
						unitPriceGbp: 8.1,
						vatRate: 0,
						matchType: "identical",
						confidence: 1,
						priceDifferenceGbp: 0.3,
						reason: "Manufacturer code matched",
					},
				],
			},
		])

		const response = await app.inject({
			method: "GET",
			url: "/catalogue",
		})

		expect(response.statusCode).toBe(200)

		const body: CatalogueProductResponse[] = response.json()
		expect(body).toEqual([
			{
				supplier: "Novadent",
				supplierRef: "ND-001",
				name: "Nitrile Examination Gloves Extra Small",
				brand: "NovaDent ProTouch",
				manufacturerCode: "MED-NIT-XS-100",
				packSize: "box/100",
				unitPriceGbp: 7.8,
				vatRate: 0,
				matches: [
					{
						supplier: "PrimeCare",
						supplierRef: "PC-001",
						name: "Nitrile Exam Gloves X-Small Powder-Free",
						brand: "PrimeCare Essentials",
						manufacturerCode: "MED-NIT-XS-100",
						packSize: "100 pack",
						unitPriceGbp: 8.1,
						vatRate: 0,
						matchType: "identical",
						confidence: 1,
						priceDifferenceGbp: 0.3,
						reason: "Manufacturer code matched",
					},
				],
			},
		])

		expect(getCatalogueMock).toHaveBeenCalledTimes(1)
	})

	it("serves swagger UI", async () => {
		const { buildApp } = await import("../src/app.js")
		app = await buildApp()

		const response = await app.inject({
			method: "GET",
			url: "/documentation",
		})

		expect(response.statusCode).toBe(200)
	})
})
