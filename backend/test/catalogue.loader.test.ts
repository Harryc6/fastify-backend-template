import { describe, expect, it, vi, beforeEach } from "vitest"
import { loadCatalogueCsv } from "../src/services/catalogue/catalogue.loader.js"

const { readFileMock } = vi.hoisted(() => ({
	readFileMock: vi.fn(),
}))

vi.mock("node:fs/promises", () => ({
	default: {
		readFile: readFileMock,
	},
}))

describe("loadCatalogueCsv", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("parses rows and normalises numeric fields", async () => {
		readFileMock.mockResolvedValue(`supplier_ref,product_description,brand,manufacturer_code,pack_size,unit_price_gbp,vat_rate
ND-001,Nitrile Examination Gloves Extra Small,NovaDent ProTouch,MED-NIT-XS-100,box/100,7.80,0%
ND-002,Surface Wipes Lemon,Novadent Clean,SUR-WIPE-01,pack/200,3.50,20%
`)

		const result = await loadCatalogueCsv("/fake/catalogue.csv", "Novadent")

		expect(result).toEqual([
			{
				supplier: "Novadent",
				supplierRef: "ND-001",
				name: "Nitrile Examination Gloves Extra Small",
				brand: "NovaDent ProTouch",
				manufacturerCode: "MED-NIT-XS-100",
				packSize: "box/100",
				unitPriceGbp: 7.8,
				vatRate: 0,
				matches: [],
			},
			{
				supplier: "Novadent",
				supplierRef: "ND-002",
				name: "Surface Wipes Lemon",
				brand: "Novadent Clean",
				manufacturerCode: "SUR-WIPE-01",
				packSize: "pack/200",
				unitPriceGbp: 3.5,
				vatRate: 0.2,
				matches: [],
			},
		])

		expect(readFileMock).toHaveBeenCalledWith("/fake/catalogue.csv", "utf-8")
	})

	it("ignores empty lines", async () => {
		readFileMock.mockResolvedValue(`supplier_ref,product_description,brand,manufacturer_code,pack_size,unit_price_gbp,vat_rate

ND-001,Nitrile Examination Gloves Extra Small,NovaDent ProTouch,MED-NIT-XS-100,box/100,7.80,0%

`)

		const result = await loadCatalogueCsv("/fake/catalogue.csv", "Novadent")

		expect(result).toHaveLength(1)
		expect(result[0].supplierRef).toBe("ND-001")
	})
})
