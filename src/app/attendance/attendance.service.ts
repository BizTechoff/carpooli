import { Injectable } from '@angular/core'
import { AttendanceController } from '../../shared/attendance/attendance.controller'
import { ConfirmAttendanceRequest } from '../../shared/attendance/type/confirm-attendance.request.type'

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  confirm(req: ConfirmAttendanceRequest) {
    return AttendanceController.confirmAttendance(req)
  }

  ensure(occurrenceId: string) {
    return AttendanceController.ensureConfirmations(occurrenceId)
  }
}
