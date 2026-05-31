/**
 * הגדרת remultExpress — רישום כל ה-entities וה-controllers, חיבור Postgres, ו-getUser.
 * זהו הציר המרכזי: Remult חושף את הכל typesafe לקליינט.
 */
import { remultApi } from 'remult/remult-express'
import { createPostgresDataProvider } from 'remult/postgres'
import { getUser } from './jwt'
import type express from 'express'

// הזרקת request לתוך remult.context (לא נעשה אוטומטית ב-remult 3 כפי שהיה ב-0.27)
declare module 'remult' {
  interface RemultContext {
    request?: express.Request
  }
}

// ---- Entities (לפי דומיין) ----
import { Group } from '../shared/groups/group.entity'
import { GroupMembership } from '../shared/groups/group-membership.entity'
import { Parent } from '../shared/users/parent.entity'
import { Child } from '../shared/users/child.entity'
import { EventType } from '../shared/events/event-type.entity'
import { Event } from '../shared/events/event.entity'
import { EventOccurrence } from '../shared/events/event-occurrence.entity'
import { EventEnrollment } from '../shared/events/event-enrollment.entity'
import { AttendanceConfirmation } from '../shared/attendance/attendance-confirmation.entity'
import { DriveAssignment } from '../shared/carpool/drive-assignment.entity'
import { AssignmentPolicy } from '../shared/carpool/assignment-policy.entity'

// ---- Controllers (לפי דומיין) ----
import { AuthController } from '../shared/users/auth.controller'
import { GroupsController } from '../shared/groups/groups.controller'
import { EventsController } from '../shared/events/events.controller'
import { AttendanceController } from '../shared/attendance/attendance.controller'
import { RotationController } from '../shared/carpool/rotation.controller'
import { ScheduleController } from '../shared/carpool/schedule.controller'

const connectionString = process.env['DATABASE_URL']

export const api = remultApi({
  entities: [
    Group,
    GroupMembership,
    Parent,
    Child,
    EventType,
    Event,
    EventOccurrence,
    EventEnrollment,
    AttendanceConfirmation,
    DriveAssignment,
    AssignmentPolicy
  ],
  controllers: [
    AuthController,
    GroupsController,
    EventsController,
    AttendanceController,
    RotationController,
    ScheduleController
  ],
  getUser,
  // קריטי: שמירת ה-express request תחת remult.context כדי שגישה ל-session תעבוד
  // (setSessionUser ב-AuthController ניגש דרך remult.context.request.session).
  initRequest: async (request, options) => {
    options.remult.context.request = request
    const hasSession = !!(request as any).session
    console.info(
      `[initRequest] url=${request.originalUrl} hasSession=${hasSession} sessionUser=${JSON.stringify((request as any).session?.user)}`
    )
  },
  // Postgres אם הוגדר DATABASE_URL; אחרת ברירת מחדל (קובצי JSON מקומיים) לפיתוח מהיר.
  dataProvider: connectionString
    ? createPostgresDataProvider({ connectionString })
    : undefined
})
