import { ValueListFieldType } from 'remult'

@ValueListFieldType()
export class AttendanceStatus {
  static pending = new AttendanceStatus('pending', 'ממתין')
  static confirmed = new AttendanceStatus('confirmed', 'מגיע')
  static declined = new AttendanceStatus('declined', 'לא מגיע')
  constructor(public id: string, public caption: string) {}
}
