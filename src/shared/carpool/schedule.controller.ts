import { Allow, BackendMethod, Controller, ControllerBase, repo } from 'remult'
import { EventOccurrence } from '../events/event-occurrence.entity'
import { DriveAssignment } from './drive-assignment.entity'
import { DriveDirection } from './drive-direction.enum'
import { AttendanceConfirmation } from '../attendance/attendance-confirmation.entity'
import { EventsController } from '../events/events.controller'
import { AttendanceController } from '../attendance/attendance.controller'
import { RotationController } from './rotation.controller'
import { GenerateScheduleRequest } from './type/generate-schedule.request.type'
import { ScheduleResponse, OccurrenceWithAssignments } from './type/schedule.response.type'

@Controller('schedule')
export class ScheduleController extends ControllerBase {
  /**
   * סידור נסיעות לטווח: יוצר מופעים מהדפוס, מוודא אישורי-הגעה, ומשבץ נהג הלוך+חזור לכל מופע.
   * מחזיר את הסידור המלא לתצוגה.
   */
  @BackendMethod({ allowed: Allow.authenticated })
  static async generateSchedule(req: GenerateScheduleRequest): Promise<ScheduleResponse> {
    await EventsController.generateOccurrences(req.eventId, req.fromDate, req.toDate)

    const occs = await repo(EventOccurrence).find({
      where: {
        eventId: req.eventId,
        date: { $gte: new Date(req.fromDate), $lte: new Date(req.toDate) }
      },
      orderBy: { date: 'asc' }
    })

    for (const o of occs) {
      await AttendanceController.ensureConfirmations(o.id)
      await RotationController.assignDriver(o.id, DriveDirection.toEvent.id)
      await RotationController.assignDriver(o.id, DriveDirection.fromEvent.id)
    }

    return ScheduleController.getSchedule(req.eventId, req.fromDate, req.toDate)
  }

  /** מחזיר את הסידור (מופעים + שיבוצי הלוך/חזור + אישורי הגעה) לטווח */
  @BackendMethod({ allowed: Allow.authenticated })
  static async getSchedule(
    eventId: string,
    fromDate: string,
    toDate: string
  ): Promise<ScheduleResponse> {
    const occs = await repo(EventOccurrence).find({
      where: {
        eventId,
        date: { $gte: new Date(fromDate), $lte: new Date(toDate) }
      },
      orderBy: { date: 'asc' }
    })

    const occurrences: OccurrenceWithAssignments[] = []
    for (const o of occs) {
      const assigns = await repo(DriveAssignment).find({ where: { occurrenceId: o.id } })
      const attendances = await repo(AttendanceConfirmation).find({ where: { occurrenceId: o.id } })
      occurrences.push({
        occurrence: o,
        toAssignment: assigns.find((a) => a.direction.id === DriveDirection.toEvent.id) ?? null,
        fromAssignment: assigns.find((a) => a.direction.id === DriveDirection.fromEvent.id) ?? null,
        attendances
      })
    }
    return { occurrences }
  }
}
