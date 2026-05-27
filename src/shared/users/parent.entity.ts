import { Allow, Entity, Field, Fields, IdEntity, Validators } from 'remult'
import { terms } from '../common/terms'
import { UserRole } from './user-role.enum'
import { PlanTier } from '../groups/plan-tier.enum'

@Entity<Parent>('parents', {
  allowApiCrud: Allow.authenticated,
  defaultOrderBy: { fullName: 'asc' }
})
export class Parent extends IdEntity {
  @Fields.string({
    caption: terms.fullName,
    validate: [Validators.required(terms.requiredField)]
  })
  fullName = ''

  @Fields.string({
    caption: terms.mobile,
    validate: [Validators.required(terms.requiredField)]
  })
  mobile = ''

  @Fields.string({ caption: terms.email })
  email = ''

  @Fields.boolean({ caption: terms.canDrive })
  canDrive = true

  @Fields.integer({ caption: terms.seats })
  seats = 4

  @Fields.boolean({ caption: terms.isActive })
  isActive = true

  @Field(() => UserRole, { caption: terms.role })
  role = UserRole.parent

  @Field(() => PlanTier, { caption: terms.plan })
  plan = PlanTier.free

  @Fields.string({ caption: terms.notes })
  notes = ''
}
