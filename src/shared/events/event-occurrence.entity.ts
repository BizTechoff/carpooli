import { Allow, Entity, Field, Fields, IdEntity, Relations } from 'remult'
import { terms } from '../common/terms'
import { OccurrenceStatus } from './occurrence-status.enum'
import { Event } from './event.entity'
import { Group } from '../groups/group.entity'

@Entity<EventOccurrence>('eventOccurrences', {
  allowApiCrud: Allow.authenticated,
  defaultOrderBy: { date: 'asc' }
})
export class EventOccurrence extends IdEntity {
  @Fields.string({ caption: terms.group })
  groupId = ''

  @Relations.toOne(() => Group, { field: 'groupId' })
  group?: Group

  @Fields.string({ caption: terms.event })
  eventId = ''

  @Relations.toOne(() => Event, { field: 'eventId' })
  event?: Event

  @Fields.dateOnly({ caption: terms.date })
  date = new Date()

  @Fields.string({ caption: terms.startTime })
  startTime = '17:15'

  @Fields.string({ caption: terms.endTime })
  endTime = '18:45'

  @Field(() => OccurrenceStatus, { caption: terms.occurrenceStatus })
  status = OccurrenceStatus.scheduled

  @Fields.string({ caption: terms.notes })
  notes = ''
}
