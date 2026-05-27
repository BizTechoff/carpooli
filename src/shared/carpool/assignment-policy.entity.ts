import { Allow, Entity, Field, Fields, IdEntity, Relations } from 'remult'
import { terms } from '../common/terms'
import { AbsentDriverRule } from './absent-driver-rule.enum'
import { Group } from '../groups/group.entity'
import { Event } from '../events/event.entity'

/** מדיניות הסבב — לכל אירוע (או ברירת מחדל גלובלית). שומר את כללי ההחלטה כך שניתן לשנותם בלי קוד. */
@Entity<AssignmentPolicy>('assignmentPolicies', {
  allowApiCrud: Allow.authenticated
})
export class AssignmentPolicy extends IdEntity {
  @Fields.string({ caption: terms.group })
  groupId = ''

  @Relations.toOne(() => Group, { field: 'groupId' })
  group?: Group

  @Fields.string({ caption: terms.event })
  eventId = ''

  @Relations.toOne(() => Event, { field: 'eventId' })
  event?: Event

  @Field(() => AbsentDriverRule, { caption: terms.whenDriverChildAbsent })
  whenDriverChildAbsent = AbsentDriverRule.passToNext

  @Fields.boolean({ caption: terms.countDriveWhenOwnChildAbsent })
  countDriveWhenOwnChildAbsent = true

  @Fields.boolean({ caption: terms.separateToAndFrom })
  separateToAndFrom = true

  @Fields.boolean({ caption: terms.respectSeats })
  respectSeats = true
}
