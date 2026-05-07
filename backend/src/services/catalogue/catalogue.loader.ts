import fs from "node:fs/promises"
import { parse } from "csv-parse/sync"
import type { CatalogueProductResponse } from "@models/catalogue.types.js"

type RawCatalogueRow = {
	supplier_ref: string
	product_description: string
	brand: string
	manufacturer_code: string
	pack_size: string
	unit_price_gbp: string
	vat_rate: string
}

export async function loadCatalogueCsv(filePath: string, supplier: string): Promise<CatalogueProductResponse[]> {
	const csv = await fs.readFile(filePath, "utf-8")

	const rows: RawCatalogueRow[] = parse(csv, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
	})

	// Map files to the standard format, converting types as needed
	return rows.map((row) => ({
		supplier,
		supplierRef: row.supplier_ref,
		name: row.product_description,
		brand: row.brand,
		manufacturerCode: row.manufacturer_code,
		packSize: row.pack_size,
		unitPriceGbp: Number(row.unit_price_gbp),
		vatRate: Number(row.vat_rate.replace("%", "").trim()) / 100,
		matches: [],
	}))
}
