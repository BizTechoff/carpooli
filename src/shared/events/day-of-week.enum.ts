import { ValueListFieldType } from 'remult'

@ValueListFieldType()
export class DayOfWeek {
  static sunday = new DayOfWeek('0', 'ראשון')
  static monday = new DayOfWeek('1', 'שני')
  static tuesday = new DayOfWeek('2', 'שלישי')
  static wednesday = new DayOfWeek('3', 'רביעי')
  static thursday = new DayOfWeek('4', 'חמישי')
  static friday = new DayOfWeek('5', 'שישי')
  static saturday = new DayOfWeek('6', 'שבת')
  constructor(public id: string, public caption: string) {}

  /** מספר היום (0=ראשון) לחישובי תאריך */
  get dayNumber(): number {
    return Number(this.id)
  }
}
