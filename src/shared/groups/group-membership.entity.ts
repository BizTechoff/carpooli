import { Allow, Entity, Field, Fields, IdEntity, Relations } from 'remult'
import { terms } from '../common/terms'
import { UserRole } from '../users/user-role.enum'
import { Group } from './group.entity'
import { Parent } from '../users/parent.entity'

@Entity<GroupMembership>('groupMemberships', {
  allowApiCrud: Allow.authenticated
})
export class GroupMembership extends IdEntity {
  @Fields.string({ caption: terms.group })
  groupId = ''

  @Relations.toOne(() => Group, { field: 'groupId' })
  group?: Group

  @Fields.string({ caption: terms.parent })
  parentId = ''

  @Relations.toOne(() => Parent, { field: 'parentId' })
  parent?: Parent

  @Field(() => UserRole, { caption: terms.roleInGroup })
  roleInGroup = UserRole.parent
}
