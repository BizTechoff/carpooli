/**
 * בניית אפליקציית Express: session (שנה), אבטחה, דחיסה, Remult API, והגשת ה-Angular dist.
 */
import express from 'express'
import sslRedirect from 'heroku-ssl-redirect'
import helmet from 'helmet'
import compression from 'compression'
import session from 'cookie-session'
import path from 'path'
import fs from 'fs'
import { api } from './remult-api'

export function createServer() {
  const app = express()

  app.use(sslRedirect())

  // session מבוסס cookie — נשמר לשנה (עונה על "החיבור נשמר לפחות לשנה")
  app.use(
    '/api',
    session({
      secret:
        process.env['NODE_ENV'] === 'production'
          ? process.env['SESSION_SECRET']!
          : process.env['SESSION_SECRET_DEV'] || 'bar-ilan-secret-dev-key',
      maxAge: 365 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    })
  )

  app.use(compression())
  app.use(helmet({ contentSecurityPolicy: false }))

  // Remult API
  app.use(api)

  // הגשת ה-Angular build (אם קיים)
  const dist = path.resolve('dist/bar-ilan/browser')
  if (fs.existsSync(dist)) {
    app.use(express.static(dist))
    app.use('/*', async (req, res) => {
      if (req.headers.accept?.includes('json')) {
        res.status(404).json('missing route: ' + req.originalUrl)
        return
      }
      try {
        res.sendFile(path.join(dist, 'index.html'))
      } catch {
        res.sendStatus(500)
      }
    })
  }

  return app
}
