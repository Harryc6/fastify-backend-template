import { CatalogueProductResponse } from "@models/catalogue.types.js"
import { loadCatalogueCsv } from "@services/catalogue/catalogue.loader.js"
import path from "node:path"
import { enrichCatalogueWithMatches } from "@services/catalogue/catalogue.matching.js"

export async function getCatalogue(): Promise<CatalogueProductResponse[]> {
	const novadentPath = path.resolve("../data/novadent_catalogue.csv")
	const primecarePath = path.resolve("../data/primecare_catalogue.csv")

	const [novadent, primecare] = await Promise.all([
		loadCatalogueCsv(novadentPath, "Novadent"),
		loadCatalogueCsv(primecarePath, "PrimeCare"),
	])

	const catalogue = [...novadent, ...primecare]
	return enrichCatalogueWithMatches(catalogue)
}
