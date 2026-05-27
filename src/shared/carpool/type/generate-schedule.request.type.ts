export interface GenerateScheduleRequest {
  eventId: string
  /** ISO date 'YYYY-MM-DD' */
  fromDate: string
  /** ISO date 'YYYY-MM-DD' */
  toDate: string
}
