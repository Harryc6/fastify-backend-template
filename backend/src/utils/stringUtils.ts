export function normaliseText(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
}

export function tokenise(value: string): string[] {
	return normaliseText(value)
		.split(" ")
		.filter((token) => token.length > 1)
}
