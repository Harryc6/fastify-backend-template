import { describe, expect, it } from "vitest"
import { enrichCatalogueWithMatches } from "../src/services/catalogue/catalogue.matching.js"
import type { CatalogueProductResponse } from "../src/models/catalogue.types.js"

function product(overrides: Partial<CatalogueProductResponse>): CatalogueProductResponse {
	return {
		supplier: "Novadent",
		supplierRef: "DEFAULT",
		name: "Default Product",
		brand: "Default Brand",
		manufacturerCode: "DEFAULT-CODE",
		packSize: "box/100",
		unitPriceGbp: 10,
		vatRate: 0.2,
		matches: [],
		...overrides,
	}
}

describe("enrichCatalogueWithMatches", () => {
	it("creates an identical match when manufacturer codes match", () => {
		const products = [
			product({
				supplier: "Novadent",
				supplierRef: "ND-001",
				name: "Nitrile Examination Gloves Extra Small",
				brand: "NovaDent ProTouch",
				manufacturerCode: "MED-NIT-XS-100",
				packSize: "box/100",
				unitPriceGbp: 7.8,
				vatRate: 0,
			}),
			product({
				supplier: "PrimeCare",
				supplierRef: "PC-001",
				name: "Nitrile Exam Gloves X-Small Powder-Free",
				brand: "PrimeCare Essentials",
				manufacturerCode: "MED-NIT-XS-100",
				packSize: "100 pack",
				unitPriceGbp: 8.1,
				vatRate: 0,
			}),
		]

		const result = enrichCatalogueWithMatches(products)

		expect(result[0].matches).toEqual([
			expect.objectContaining({
				supplier: "PrimeCare",
				supplierRef: "PC-001",
				matchType: "identical",
				confidence: 1,
				reason: "Manufacturer code matched",
				priceDifferenceGbp: 0.3,
			}),
		])

		expect(result[1].matches).toEqual([
			expect.objectContaining({
				supplier: "Novadent",
				supplierRef: "ND-001",
				matchType: "identical",
				confidence: 1,
				reason: "Manufacturer code matched",
				priceDifferenceGbp: -0.3,
			}),
		])
	})

	it("adds a transitive similar match via an identical pivot", () => {
		const source = product({
			supplier: "Novadent",
			supplierRef: "ND-100",
			name: "Blue Bib Clips",
			brand: "NovaDent",
			manufacturerCode: "PIVOT-001",
			packSize: "single",
			unitPriceGbp: 5,
			vatRate: 0.2,
		})

		const pivot = product({
			supplier: "PrimeCare",
			supplierRef: "PC-100",
			name: "Disposable Air Water Syringe Tips Blue",
			brand: "PrimeCare",
			manufacturerCode: "PIVOT-001",
			packSize: "pack of 100",
			unitPriceGbp: 5.2,
			vatRate: 0.2,
		})

		const transitiveCandidate = product({
			supplier: "PrimeCare",
			supplierRef: "PC-101",
			name: "Air Water Syringe Tip Blue",
			brand: "PrimeCare",
			manufacturerCode: "AWS-BLUE-100",
			packSize: "100 pack",
			unitPriceGbp: 4.9,
			vatRate: 0.2,
		})

		const result = enrichCatalogueWithMatches([source, pivot, transitiveCandidate])

		const sourceMatches = result.find((item) => item.supplierRef === "ND-100")!.matches

		expect(sourceMatches).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					supplierRef: "PC-100",
					matchType: "identical",
					confidence: 1,
				}),
				expect.objectContaining({
					supplierRef: "PC-101",
					matchType: "similar",
				}),
			])
		)

		const transitive = sourceMatches.find((match: { supplierRef: string }) => match.supplierRef === "PC-101")
		expect(transitive?.reason).toContain("Via identical pivot")
		expect(transitive?.confidence).toBeLessThan(1)
	})

	it("does not create weak similar matches below the confidence threshold", () => {
		const products = [
			product({
				supplierRef: "ND-001",
				name: "Latex Free Dental Bibs",
				brand: "NovaDent",
				manufacturerCode: "BIB-001",
			}),
			product({
				supplier: "PrimeCare",
				supplierRef: "PC-001",
				name: "Sterile Surgical Mask Ear Loop",
				brand: "PrimeCare",
				manufacturerCode: "MASK-001",
			}),
		]

		const result = enrichCatalogueWithMatches(products)

		expect(result[0].matches).toEqual([])
		expect(result[1].matches).toEqual([])
	})
})
