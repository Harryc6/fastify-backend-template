import { buildApp } from "@/app.js"
import config from "@config/config.js"

// Start the server
const app = await buildApp()
await app.listen({ port: config.port, host: "0.0.0.0" })
