import { Allow, Entity, Fields, IdEntity, Relations } from 'remult'
import { terms } from '../common/terms'
import { Event } from './event.entity'
import { Child } from '../users/child.entity'
import { Group } from '../groups/group.entity'

/** רוסטר: אילו ילדים נכללים בסבב ההסעות של האירוע (רבים-לרבים אירוע↔ילד) */
@Entity<EventEnrollment>('eventEnrollments', {
  allowApiCrud: Allow.authenticated
})
export class EventEnrollment extends IdEntity {
  @Fields.string({ caption: terms.group })
  groupId = ''

  @Relations.toOne(() => Group, { field: 'groupId' })
  group?: Group

  @Fields.string({ caption: terms.event })
  eventId = ''

  @Relations.toOne(() => Event, { field: 'eventId' })
  event?: Event

  @Fields.string({ caption: terms.child })
  childId = ''

  @Relations.toOne(() => Child, { field: 'childId' })
  child?: Child
}
