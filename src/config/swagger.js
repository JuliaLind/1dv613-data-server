import fs from 'fs/promises'

export const swaggerDocument = JSON.parse(await fs.readFile('./src/config/api-spec.json', 'utf-8')
)
