import { Allow, Entity, Fields, IdEntity, Relations, Validators } from 'remult'
import { terms } from '../common/terms'
import { Parent } from './parent.entity'

@Entity<Child>('children', {
  allowApiCrud: Allow.authenticated,
  defaultOrderBy: { fullName: 'asc' }
})
export class Child extends IdEntity {
  @Fields.string({
    caption: terms.fullName,
    validate: [Validators.required(terms.requiredField)]
  })
  fullName = ''

  @Fields.string({ caption: terms.parentId })
  parentId = ''

  @Relations.toOne(() => Parent, { field: 'parentId' })
  parent?: Parent

  @Fields.string({ caption: terms.pickupAddress })
  pickupAddress = ''

  @Fields.boolean({ caption: terms.isActive })
  isActive = true

  @Fields.string({ caption: terms.notes })
  notes = ''
}
