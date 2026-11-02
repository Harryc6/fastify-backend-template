import dotenv from "dotenv"
import path from "node:path"

dotenv.config()

type Config = {
	appName: string
	port: number
	nodeEnv: string
	dataDir: string
}

const config: Config = {
	appName: process.env.APP_NAME || "Backend API",
	port: Number(process.env.PORT) || 3000,
	nodeEnv: process.env.NODE_ENV || "development",
	// Resolve relative data dirs against the backend package root, not the shell cwd.
	dataDir: path.resolve(process.env.DATA_DIR || "../data"),
}

if (!Number.isInteger(config.port) || config.port < 0 || config.port > 65535) {
	throw new Error(`Invalid PORT: ${process.env.PORT}`)
}

export default config
