import { Allow, Entity, Field, Fields, IdEntity, Relations } from 'remult'
import { terms } from '../common/terms'
import { AttendanceStatus } from './attendance-status.enum'
import { EventOccurrence } from '../events/event-occurrence.entity'
import { Child } from '../users/child.entity'
import { Group } from '../groups/group.entity'
import { Parent } from '../users/parent.entity'

@Entity<AttendanceConfirmation>('attendanceConfirmations', {
  allowApiCrud: Allow.authenticated
})
export class AttendanceConfirmation extends IdEntity {
  @Fields.string({ caption: terms.group })
  groupId = ''

  @Relations.toOne(() => Group, { field: 'groupId' })
  group?: Group

  @Fields.string({ caption: terms.occurrence })
  occurrenceId = ''

  @Relations.toOne(() => EventOccurrence, { field: 'occurrenceId' })
  occurrence?: EventOccurrence

  @Fields.string({ caption: terms.child })
  childId = ''

  @Relations.toOne(() => Child, { field: 'childId' })
  child?: Child

  @Field(() => AttendanceStatus, { caption: terms.attendanceStatus })
  status = AttendanceStatus.pending

  @Fields.boolean({ caption: terms.needsRideTo })
  needsRideTo = true

  @Fields.boolean({ caption: terms.needsRideFrom })
  needsRideFrom = true

  @Fields.date({ caption: terms.respondedAt, allowNull: true })
  respondedAt: Date | null = null

  @Fields.string({ caption: terms.respondedBy })
  respondedById = ''

  @Relations.toOne(() => Parent, { field: 'respondedById' })
  respondedByParent?: Parent
}
