import { EventOccurrence } from '../../events/event-occurrence.entity'
import { DriveAssignment } from '../drive-assignment.entity'
import { AttendanceConfirmation } from '../../attendance/attendance-confirmation.entity'

export interface OccurrenceWithAssignments {
  occurrence: EventOccurrence
  toAssignment: DriveAssignment | null
  fromAssignment: DriveAssignment | null
  attendances: AttendanceConfirmation[]
}

export interface ScheduleResponse {
  occurrences: OccurrenceWithAssignments[]
}
