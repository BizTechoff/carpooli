import { Injectable } from '@angular/core'
import { remult } from 'remult'
import { Group } from '../../shared/groups/group.entity'
import { GroupsController } from '../../shared/groups/groups.controller'
import { CreateGroupRequest } from '../../shared/groups/type/create-group.request.type'

@Injectable({ providedIn: 'root' })
export class GroupsService {
  createGroup(req: CreateGroupRequest) {
    return GroupsController.createGroup(req)
  }

  groups() {
    return remult.repo(Group).find({ where: { isActive: true } })
  }
}
