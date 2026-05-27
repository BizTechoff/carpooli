/**
 * נקודת הכניסה של השרת.
 */
import { createServer } from './server'

const app = createServer()
const port = process.env['PORT'] || 3002

app.listen(port, () => {
  console.info(`bar-ilan server listening on port ${port}`)
})
