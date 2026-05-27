import { ValueListFieldType } from 'remult'

@ValueListFieldType()
export class UserRole {
  static admin = new UserRole('admin', 'מנהל')
  static parent = new UserRole('parent', 'הורה')
  constructor(public id: string, public caption: string) {}
}
