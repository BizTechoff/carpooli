import { Allow, BackendMethod, Controller, ControllerBase, repo } from 'remult'
import { EventEnrollment } from '../events/event-enrollment.entity'
import { EventOccurrence } from '../events/event-occurrence.entity'
import { Child } from '../users/child.entity'
import { Parent } from '../users/parent.entity'
import { AttendanceConfirmation } from '../attendance/attendance-confirmation.entity'
import { AttendanceStatus } from '../attendance/attendance-status.enum'
import { DriveAssignment } from './drive-assignment.entity'
import { DriveDirection } from './drive-direction.enum'
import { AssignmentStatus } from './assignment-status.enum'
import { AssignmentPolicy } from './assignment-policy.entity'
import { AbsentDriverRule } from './absent-driver-rule.enum'
import { FairnessReportResponse } from './type/fairness-report.response.type'
import { SwapDriverRequest } from './type/swap-driver.request.type'

interface DriveStat {
  count: number
  last: number
}

/**
 * מנוע הסבב — הלב של המערכת.
 * בוחר את הנהג ההוגן (מספר נסיעות נמוך ביותר), מתחשב בקיבולת, וביישום כלל ההיעדרות.
 * ההוגנות מחושבת לכל אירוע בנפרד (מעגל-סבב = הורי הילדים שברוסטר האירוע).
 */
@Controller('rotation')
export class RotationController extends ControllerBase {
  @BackendMethod({ allowed: Allow.authenticated })
  static async assignDriver(
    occurrenceId: string,
    directionId: string
  ): Promise<DriveAssignment | null> {
    const occurrence = await repo(EventOccurrence).findId(occurrenceId)
    if (!occurrence) throw new Error('occurrence not found')

    const direction =
      directionId === DriveDirection.fromEvent.id ? DriveDirection.fromEvent : DriveDirection.toEvent
    const eventId = occurrence.eventId
    const policy = await RotationController.getPolicy(occurrence.groupId, eventId)

    const passengers = await RotationController.attendingChildIds(occurrenceId, direction)

    let assignment = await repo(DriveAssignment).findFirst({ occurrenceId, direction })

    // אין נוסעים → אין צורך בשיבוץ
    if (passengers.childIds.length === 0) {
      if (assignment && assignment.status.id === AssignmentStatus.proposed.id) {
        assignment.passengerChildIds = []
        await assignment.save()
      }
      return assignment ?? null
    }

    // לא דורסים שיבוץ שאושר/הוחלף ידנית
    if (
      assignment &&
      (assignment.status.id === AssignmentStatus.confirmed.id ||
        assignment.status.id === AssignmentStatus.swapped.id)
    ) {
      return assignment
    }

    const circle = await RotationController.drivingCircle(eventId)
    const stats = await RotationController.driveStats(eventId, occurrenceId)

    const ranked = circle
      .filter((p) => !policy.respectSeats || p.seats >= passengers.childIds.length)
      .sort((a, b) => {
        const sa = stats.get(a.id) ?? { count: 0, last: 0 }
        const sb = stats.get(b.id) ?? { count: 0, last: 0 }
        if (sa.count !== sb.count) return sa.count - sb.count
        if (sa.last !== sb.last) return sa.last - sb.last
        return a.id.localeCompare(b.id)
      })

    if (ranked.length === 0) return assignment ?? null

    const chosen = RotationController.applyAbsentRule(ranked, passengers.attendingParentIds, policy)
    if (!chosen) return assignment ?? null

    if (!assignment) {
      assignment = repo(DriveAssignment).create()
      assignment.groupId = occurrence.groupId
      assignment.occurrenceId = occurrenceId
      assignment.direction = direction
    }
    assignment.assignedParentId = chosen.id
    assignment.passengerChildIds = passengers.childIds
    assignment.isAutoAssigned = true
    assignment.status = AssignmentStatus.proposed
    await assignment.save()
    return assignment
  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async fairnessReport(eventId: string): Promise<FairnessReportResponse> {
    const circle = await RotationController.drivingCircle(eventId)
    const stats = await RotationController.driveStats(eventId)
    const perParent = circle
      .map((p) => {
        const s = stats.get(p.id)
        return {
          parentId: p.id,
          parentName: p.fullName,
          driveCount: s?.count ?? 0,
          lastDroveAt: s?.last ? new Date(s.last) : null
        }
      })
      .sort((a, b) => a.driveCount - b.driveCount)
    return { perParent }
  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async swapDriver(req: SwapDriverRequest): Promise<DriveAssignment> {
    const a = await repo(DriveAssignment).findId(req.assignmentId)
    if (!a) throw new Error('assignment not found')
    a.assignedParentId = req.newParentId
    a.status = AssignmentStatus.swapped
    a.isAutoAssigned = false
    if (req.reason) a.notes = req.reason
    await a.save()
    return a
  }

  // ---- מנוע פנימי (רץ בצד שרת בלבד) ----

  private static applyAbsentRule(
    ranked: Parent[],
    attendingParentIds: Set<string>,
    policy: AssignmentPolicy
  ): Parent | undefined {
    if (policy.whenDriverChildAbsent.id === AbsentDriverRule.passToNext.id) {
      // התור עובר להורה הבא שילדו כן מגיע; אם לאיש אין ילד מגיע — הראשון בדירוג
      return ranked.find((p) => attendingParentIds.has(p.id)) ?? ranked[0]
    }
    // stillDrives / byFairness → ההוגן ביותר
    return ranked[0]
  }

  private static async drivingCircle(eventId: string): Promise<Parent[]> {
    const enrollments = await repo(EventEnrollment).find({ where: { eventId } })
    const childIds = enrollments.map((e) => e.childId)
    if (childIds.length === 0) return []
    const children = await repo(Child).find({ where: { id: childIds } })
    const parentIds = [...new Set(children.map((c) => c.parentId))]
    if (parentIds.length === 0) return []
    return await repo(Parent).find({ where: { id: parentIds, canDrive: true, isActive: true } })
  }

  private static async attendingChildIds(
    occurrenceId: string,
    direction: DriveDirection
  ): Promise<{ childIds: string[]; attendingParentIds: Set<string> }> {
    const occ = await repo(EventOccurrence).findId(occurrenceId)
    if (!occ) return { childIds: [], attendingParentIds: new Set() }

    const enrollments = await repo(EventEnrollment).find({ where: { eventId: occ.eventId } })
    const confs = await repo(AttendanceConfirmation).find({ where: { occurrenceId } })
    const confByChild = new Map(confs.map((c) => [c.childId, c]))
    const isTo = direction.id === DriveDirection.toEvent.id

    const childIds: string[] = []
    for (const e of enrollments) {
      const c = confByChild.get(e.childId)
      if (!c) {
        childIds.push(e.childId) // ללא אישור → ברירת מחדל "מגיע"
        continue
      }
      if (c.status.id === AttendanceStatus.declined.id) continue
      if (isTo ? !c.needsRideTo : !c.needsRideFrom) continue
      childIds.push(e.childId)
    }

    const children = childIds.length ? await repo(Child).find({ where: { id: childIds } }) : []
    const attendingParentIds = new Set(children.map((c) => c.parentId))
    return { childIds, attendingParentIds }
  }

  /** מספר נסיעות ותאריך-נהיגה-אחרון לכל הורה באירוע. excludeOccurrenceId — לא לספור את המופע הנוכחי */
  private static async driveStats(
    eventId: string,
    excludeOccurrenceId?: string
  ): Promise<Map<string, DriveStat>> {
    const map = new Map<string, DriveStat>()
    const occs = await repo(EventOccurrence).find({ where: { eventId } })
    const occIds = occs.map((o) => o.id).filter((id) => id !== excludeOccurrenceId)
    if (occIds.length === 0) return map

    const occTime = new Map(occs.map((o) => [o.id, new Date(o.date).getTime()]))
    const assigns = await repo(DriveAssignment).find({ where: { occurrenceId: occIds } })
    for (const a of assigns) {
      if (a.status.id === AssignmentStatus.cancelled.id) continue
      if (!a.assignedParentId) continue
      const cur = map.get(a.assignedParentId) ?? { count: 0, last: 0 }
      cur.count++
      const t = occTime.get(a.occurrenceId) ?? 0
      if (t > cur.last) cur.last = t
      map.set(a.assignedParentId, cur)
    }
    return map
  }

  private static async getPolicy(groupId: string, eventId: string): Promise<AssignmentPolicy> {
    const existing = await repo(AssignmentPolicy).findFirst({ eventId })
    if (existing) return existing
    const def = repo(AssignmentPolicy).create()
    def.groupId = groupId
    def.eventId = eventId
    return def
  }
}
