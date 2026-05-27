import { Allow, Entity, Fields, IdEntity, Validators } from 'remult'
import { terms } from '../common/terms'

@Entity<EventType>('eventTypes', {
  allowApiCrud: Allow.authenticated,
  defaultOrderBy: { name: 'asc' }
})
export class EventType extends IdEntity {
  @Fields.string({
    caption: terms.eventType,
    validate: [Validators.required(terms.requiredField)]
  })
  name = ''

  @Fields.boolean({ caption: terms.isActive })
  isActive = true
}
