import { Allow, BackendMethod, Controller, ControllerBase, remult, repo } from 'remult'
import { AttendanceConfirmation } from './attendance-confirmation.entity'
import { AttendanceStatus } from './attendance-status.enum'
import { EventOccurrence } from '../events/event-occurrence.entity'
import { EventEnrollment } from '../events/event-enrollment.entity'
import { ConfirmAttendanceRequest } from './type/confirm-attendance.request.type'

function statusFromId(id: string): AttendanceStatus {
  switch (id) {
    case AttendanceStatus.confirmed.id:
      return AttendanceStatus.confirmed
    case AttendanceStatus.declined.id:
      return AttendanceStatus.declined
    default:
      return AttendanceStatus.pending
  }
}

@Controller('attendance')
export class AttendanceController extends ControllerBase {
  /** יוצר אישורי-הגעה במצב "ממתין" לכל ילד ברוסטר של המופע, אם עדיין אין */
  @BackendMethod({ allowed: Allow.authenticated })
  static async ensureConfirmations(occurrenceId: string): Promise<AttendanceConfirmation[]> {
    const occ = await repo(EventOccurrence).findId(occurrenceId)
    if (!occ) throw new Error('occurrence not found')

    const enrollments = await repo(EventEnrollment).find({ where: { eventId: occ.eventId } })
    const existing = await repo(AttendanceConfirmation).find({ where: { occurrenceId } })
    const haveChild = new Set(existing.map((c) => c.childId))

    const created: AttendanceConfirmation[] = []
    for (const e of enrollments) {
      if (haveChild.has(e.childId)) continue
      const c = await repo(AttendanceConfirmation).insert({
        groupId: occ.groupId,
        occurrenceId,
        childId: e.childId,
        status: AttendanceStatus.pending
      })
      created.push(c)
    }
    return [...existing, ...created]
  }

  /** עדכון אישור הגעה של ילד למופע (מגיע/לא מגיע + צורך בהסעה הלוך/חזור) */
  @BackendMethod({ allowed: Allow.authenticated })
  static async confirmAttendance(req: ConfirmAttendanceRequest): Promise<AttendanceConfirmation> {
    const occ = await repo(EventOccurrence).findId(req.occurrenceId)
    if (!occ) throw new Error('occurrence not found')

    let c = await repo(AttendanceConfirmation).findFirst({
      occurrenceId: req.occurrenceId,
      childId: req.childId
    })
    if (!c) {
      c = repo(AttendanceConfirmation).create()
      c.groupId = occ.groupId
      c.occurrenceId = req.occurrenceId
      c.childId = req.childId
    }
    c.status = statusFromId(req.statusId)
    c.needsRideTo = req.needsRideTo
    c.needsRideFrom = req.needsRideFrom
    c.respondedAt = new Date()
    c.respondedById = remult.user?.id || ''
    await c.save()
    return c
  }
}
