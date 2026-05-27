import { Allow, Entity, Fields, IdEntity, Relations } from 'remult'
import { terms } from '../common/terms'
import { Parent } from '../users/parent.entity'

@Entity<Group>('groups', {
  allowApiCrud: Allow.authenticated,
  defaultOrderBy: { name: 'asc' }
})
export class Group extends IdEntity {
  @Fields.string({ caption: terms.groupName })
  name = ''

  @Fields.string({ caption: terms.groupOwner })
  ownerId = ''

  @Relations.toOne(() => Parent, { field: 'ownerId' })
  owner?: Parent

  @Fields.boolean({ caption: terms.isActive })
  isActive = true

  @Fields.date({ allowApiUpdate: false, caption: terms.createDate })
  createDate = new Date()
}
