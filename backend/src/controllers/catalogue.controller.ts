import type { FastifyReply, FastifyRequest } from "fastify"
import { getCatalogue } from "@services/catalogue/catalogue.service.js"

export async function getCatalogueController(_req: FastifyRequest, res: FastifyReply) {
	const items = await getCatalogue()
	return res.send(items)
}
