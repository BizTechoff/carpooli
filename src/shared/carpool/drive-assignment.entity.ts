import { Allow, Entity, Field, Fields, IdEntity, Relations } from 'remult'
import { terms } from '../common/terms'
import { DriveDirection } from './drive-direction.enum'
import { AssignmentStatus } from './assignment-status.enum'
import { EventOccurrence } from '../events/event-occurrence.entity'
import { Parent } from '../users/parent.entity'
import { Group } from '../groups/group.entity'

@Entity<DriveAssignment>('driveAssignments', {
  allowApiCrud: Allow.authenticated
})
export class DriveAssignment extends IdEntity {
  @Fields.string({ caption: terms.group })
  groupId = ''

  @Relations.toOne(() => Group, { field: 'groupId' })
  group?: Group

  @Fields.string({ caption: terms.occurrence })
  occurrenceId = ''

  @Relations.toOne(() => EventOccurrence, { field: 'occurrenceId' })
  occurrence?: EventOccurrence

  @Field(() => DriveDirection, { caption: terms.direction })
  direction = DriveDirection.toEvent

  @Fields.string({ caption: terms.assignedParent })
  assignedParentId = ''

  @Relations.toOne(() => Parent, { field: 'assignedParentId' })
  assignedParent?: Parent

  @Field(() => AssignmentStatus, { caption: terms.assignmentStatus })
  status = AssignmentStatus.proposed

  // הילדים שבפועל נוסעים במופע/כיוון הזה
  @Fields.object<DriveAssignment, string[]>({ caption: terms.passengers })
  passengerChildIds: string[] = []

  @Fields.boolean()
  isAutoAssigned = true

  @Fields.string({ caption: terms.notes })
  notes = ''
}
