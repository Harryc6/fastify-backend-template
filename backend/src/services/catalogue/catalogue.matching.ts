import type { CatalogueProductResponse, ProductMatchSummary } from "@models/catalogue.types.js"
import { normaliseText, tokenise } from "@utils/stringUtils.js"

function normaliseManufacturerCode(value: string): string {
	return value.trim().toLowerCase()
}

function normalisePackSize(value: string): string {
	return normaliseText(value)
		.replace(/\bbox of\b/g, "")
		.replace(/\bunits?\b/g, "")
		.replace(/\bpacks?\b/g, "")
		.trim()
}

export function enrichCatalogueWithMatches(products: CatalogueProductResponse[]): CatalogueProductResponse[] {
	return products.map((product) => ({
		...product,
		matches: findMatchesForProduct(product, products),
	}))
}

function findMatchesForProduct(
	product: CatalogueProductResponse,
	allProducts: CatalogueProductResponse[]
): ProductMatchSummary[] {
	const directMatches = allProducts
		.filter((candidate) => candidate !== product)
		.map((candidate) => scoreMatch(product, candidate))
		.filter((match): match is ProductMatchSummary => match !== null)

	// Find identical cross-supplier pivots
	const identicalPivots = directMatches.filter((m) => m.matchType === "identical" && m.supplier !== product.supplier)

	// For each pivot, find its similar matches and fold them in transitively
	const transitiveMatches: ProductMatchSummary[] = []
	for (const pivot of identicalPivots) {
		const pivotProduct = allProducts.find((p) => p.supplier === pivot.supplier && p.supplierRef === pivot.supplierRef)
		if (!pivotProduct) continue

		const pivotMatches = allProducts
			.filter((c) => c !== product && c !== pivotProduct)
			.map((c) => scoreMatch(pivotProduct, c))
			.filter((m): m is ProductMatchSummary => m !== null && m.matchType === "similar")
			// Discount confidence slightly since it's transitive
			.map((m) => ({
				...m,
				confidence: Number((m.confidence * 0.9).toFixed(2)),
				reason: `Via identical pivot (${pivot.supplier}): ${m.reason}`,
			}))

		transitiveMatches.push(...pivotMatches)
	}

	const getMatchKey = (m: ProductMatchSummary) => `${m.supplier}:${m.supplierRef}`

	// Merge: prefer direct matches to transitive, deduplicate by supplierRef
	const seen = new Set(directMatches.map(getMatchKey))
	const merged = [...directMatches]
	for (const t of transitiveMatches) {
		const key = getMatchKey(t)

		if (!seen.has(key)) {
			seen.add(key)
			merged.push(t)
		}
	}

	return merged.sort((a, b) => b.confidence - a.confidence)
}

function scoreMatch(
	product: CatalogueProductResponse,
	candidate: CatalogueProductResponse
): ProductMatchSummary | null {
	const productCode = normaliseManufacturerCode(product.manufacturerCode)
	const candidateCode = normaliseManufacturerCode(candidate.manufacturerCode)

	// If manufacturer codes match exactly, we can be very confident it's a match, even if other details differ
	if (productCode && candidateCode && productCode === candidateCode) {
		return toMatchSummary(product, candidate, {
			matchType: "identical",
			confidence: 1,
			reason: "Manufacturer code matched",
		})
	}

	const nameSimilarity = calculateTokenSimilarity(product.name, candidate.name)
	const brandMatches = normaliseText(product.brand) === normaliseText(candidate.brand)
	const packSizeMatches = normalisePackSize(product.packSize) === normalisePackSize(candidate.packSize)

	let confidence = nameSimilarity

	if (brandMatches) confidence += 0.15
	if (packSizeMatches) confidence += 0.15

	confidence = Math.min(confidence, 0.99)

	if (confidence < 0.65) {
		return null
	}

	const reasons = [`Name similarity ${(nameSimilarity * 100).toFixed(0)}%`]

	if (brandMatches) reasons.push("brand matched")
	if (packSizeMatches) reasons.push("pack size matched")

	return toMatchSummary(product, candidate, {
		matchType: "similar",
		confidence: Number(confidence.toFixed(2)),
		reason: reasons.join(", "),
	})
}

/**
 * Calculates the Jaccard similarity between two strings based on their token sets.
 * Tokenises each string into a set of words, then computes:
 *   |intersection| / |union|
 * Returns a value between 0 (no shared tokens) and 1 (identical token sets).
 */
function calculateTokenSimilarity(a: string, b: string): number {
	const aTokens = new Set(tokenise(a))
	const bTokens = new Set(tokenise(b))

	if (aTokens.size === 0 || bTokens.size === 0) {
		return 0
	}
	const intersection = [...aTokens].filter((token) => bTokens.has(token))
	const union = new Set([...aTokens, ...bTokens])

	return intersection.length / union.size
}

function toMatchSummary(
	source: CatalogueProductResponse,
	match: CatalogueProductResponse,
	options: {
		matchType: "identical" | "similar"
		confidence: number
		reason: string
	}
): ProductMatchSummary {
	return {
		supplier: match.supplier,
		supplierRef: match.supplierRef,
		name: match.name,
		brand: match.brand,
		manufacturerCode: match.manufacturerCode,
		packSize: match.packSize,
		unitPriceGbp: match.unitPriceGbp,
		vatRate: match.vatRate,
		matchType: options.matchType,
		confidence: options.confidence,
		reason: options.reason,
		priceDifferenceGbp: Number((match.unitPriceGbp - source.unitPriceGbp).toFixed(2)),
	}
}
