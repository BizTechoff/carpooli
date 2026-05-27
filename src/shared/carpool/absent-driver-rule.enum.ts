import { ValueListFieldType } from 'remult'

/** מה לעשות כשהילד של הנהג-המיועד לא מגיע באותו יום */
@ValueListFieldType()
export class AbsentDriverRule {
  /** התור עובר להורה הבא (ברירת מחדל) */
  static passToNext = new AbsentDriverRule('passToNext', 'התור עובר להורה הבא')
  /** הנהג עדיין נוהג */
  static stillDrives = new AbsentDriverRule('stillDrives', 'ההורה עדיין נוהג')
  /** בחירה לפי הוגנות בלבד */
  static byFairness = new AbsentDriverRule('byFairness', 'לפי הוגנות בלבד')
  constructor(public id: string, public caption: string) {}
}
