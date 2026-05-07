export type CatalogueProductResponse = {
	supplier: string
	supplierRef: string
	name: string
	brand: string
	manufacturerCode: string
	packSize: string
	unitPriceGbp: number
	vatRate: number
	matches: ProductMatchSummary[]
}

export type ProductMatchSummary = {
	supplier: string
	supplierRef: string
	name: string
	brand: string
	manufacturerCode: string
	packSize: string
	unitPriceGbp: number
	vatRate: number
	matchType: "identical" | "similar"
	confidence: number
	reason: string
	priceDifferenceGbp: number
}
