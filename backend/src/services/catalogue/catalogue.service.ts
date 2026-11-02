import { CatalogueProductResponse } from "@models/catalogue.types.js"
import { loadCatalogueCsv } from "@services/catalogue/catalogue.loader.js"
import path from "node:path"
import { enrichCatalogueWithMatches } from "@services/catalogue/catalogue.matching.js"
import config from "@config/config.js"

// Replace this list with your own data files / suppliers.
const sources: { file: string; supplier: string }[] = [
	{ file: "novadent_catalogue.csv", supplier: "Novadent" },
	{ file: "primecare_catalogue.csv", supplier: "PrimeCare" },
]

export async function getCatalogue(): Promise<CatalogueProductResponse[]> {
	const catalogue = (
		await Promise.all(
			sources.map((source) => loadCatalogueCsv(path.join(config.dataDir, source.file), source.supplier)),
		)
	).flat()

	return enrichCatalogueWithMatches(catalogue)
}
