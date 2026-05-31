/**
 * אימות מבוסס-session (לא JWT).
 * שם הקובץ נשמר כ-jwt.ts לפי מבנה הפרויקט, אך המנגנון הוא session (cookie-session).
 * כאן יושבת קריאת המשתמש המחובר מתוך ה-session, המשמשת את remultExpress.getUser.
 */
import type express from 'express'
import { repo, UserInfo } from 'remult'
import { Parent } from '../shared/users/parent.entity'

// הרחבת טיפוס הבקשה של Express כך שיכיל session (צד-שרת בלבד)
declare module 'express-serve-static-core' {
  interface Request {
    session?: any
  }
}

/** ממיר רשומת הורה ל-UserInfo של Remult (id, name, roles) */
export function parentToUserInfo(parent: Parent): UserInfo {
  return {
    id: parent.id,
    name: parent.fullName,
    roles: [parent.role.id]
  }
}

/** נקרא ע"י remultExpress בכל בקשה — מחזיר את המשתמש המחובר מה-session */
export async function getUser(req: express.Request): Promise<UserInfo | undefined> {
  const sessionUser = (req as any).session?.['user'] as UserInfo | undefined
  console.info(`[getUser] cookie=${!!req.headers.cookie} sessionUser=${JSON.stringify(sessionUser)}`)
  if (!sessionUser?.id) return undefined
  const parent = await repo(Parent).findFirst({ id: sessionUser.id, isActive: true })
  if (!parent) {
    console.warn(`[getUser] sessionUser.id=${sessionUser.id} not found in DB`)
    return undefined
  }
  return parentToUserInfo(parent)
}
