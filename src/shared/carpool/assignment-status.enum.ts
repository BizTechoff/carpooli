import { ValueListFieldType } from 'remult'

@ValueListFieldType()
export class AssignmentStatus {
  static proposed = new AssignmentStatus('proposed', 'מוצע')
  static confirmed = new AssignmentStatus('confirmed', 'מאושר')
  static completed = new AssignmentStatus('completed', 'בוצע')
  static swapped = new AssignmentStatus('swapped', 'הוחלף')
  static cancelled = new AssignmentStatus('cancelled', 'בוטל')
  constructor(public id: string, public caption: string) {}
}
