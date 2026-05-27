import { Allow, Entity, Field, Fields, IdEntity, Relations, Validators } from 'remult'
import { terms } from '../common/terms'
import { DayOfWeek } from './day-of-week.enum'
import { EventType } from './event-type.entity'
import { Group } from '../groups/group.entity'

@Entity<Event>('events', {
  allowApiCrud: Allow.authenticated,
  defaultOrderBy: { name: 'asc' }
})
export class Event extends IdEntity {
  @Fields.string({ caption: terms.group })
  groupId = ''

  @Relations.toOne(() => Group, { field: 'groupId' })
  group?: Group

  @Fields.string({
    caption: terms.eventName,
    validate: [Validators.required(terms.requiredField)]
  })
  name = ''

  @Fields.string({ caption: terms.eventTypeId })
  eventTypeId = ''

  @Relations.toOne(() => EventType, { field: 'eventTypeId' })
  eventType?: EventType

  @Fields.string({ caption: terms.location })
  location = ''

  @Fields.boolean({ caption: terms.isRecurring })
  isRecurring = true

  // לאירוע חוזר — היום הקבוע בשבוע
  @Field(() => DayOfWeek, { caption: terms.dayOfWeek, allowNull: true })
  dayOfWeek: DayOfWeek | null = null

  // לאירוע חד-פעמי — התאריך
  @Fields.dateOnly({ caption: terms.date, allowNull: true })
  date: Date | null = null

  @Fields.string({ caption: terms.startTime })
  startTime = '17:15'

  @Fields.integer({ caption: terms.durationMinutes })
  durationMinutes = 90

  @Fields.boolean({ caption: terms.isActive })
  isActive = true
}
