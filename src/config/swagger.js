import fs from 'fs/promises'
import swaggerUi from 'swagger-ui-express'

const swaggerDocument = JSON.parse(await fs.readFile('./src/config/api-spec.json', 'utf-8')
)

/**
 *
 * @param app
 */
export default (app) => {
  app.use('/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}
