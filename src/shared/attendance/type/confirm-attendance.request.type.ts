export interface ConfirmAttendanceRequest {
  occurrenceId: string
  childId: string
  /** id של AttendanceStatus: 'confirmed' | 'declined' | 'pending' */
  statusId: string
  needsRideTo: boolean
  needsRideFrom: boolean
}
