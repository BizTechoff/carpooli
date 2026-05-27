/**
 * פענוח גוף בקשה (JSON).
 * Remult מטפל בעצמו בגוף הבקשות שלו; middleware זה זמין ל-routes מותאמים אישית
 * (למשל webhooks עתידיים של ספק SMS).
 */
import express from 'express'

export const jsonBody = express.json({ limit: '10mb' })
