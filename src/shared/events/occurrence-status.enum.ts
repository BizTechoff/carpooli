import { ValueListFieldType } from 'remult'

@ValueListFieldType()
export class OccurrenceStatus {
  static scheduled = new OccurrenceStatus('scheduled', 'מתוכנן')
  static cancelled = new OccurrenceStatus('cancelled', 'בוטל')
  static done = new OccurrenceStatus('done', 'התקיים')
  constructor(public id: string, public caption: string) {}
}
