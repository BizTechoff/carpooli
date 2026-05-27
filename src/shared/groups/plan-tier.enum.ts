import { ValueListFieldType } from 'remult'

@ValueListFieldType()
export class PlanTier {
  static free = new PlanTier('free', 'חינם')
  static pro = new PlanTier('pro', 'PRO')
  constructor(public id: string, public caption: string) {}
}
