import { ValueListFieldType } from 'remult'

@ValueListFieldType()
export class DriveDirection {
  static toEvent = new DriveDirection('to', 'הלוך')
  static fromEvent = new DriveDirection('from', 'חזור')
  constructor(public id: string, public caption: string) {}
}
