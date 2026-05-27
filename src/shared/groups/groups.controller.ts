import { Allow, BackendMethod, Controller, ControllerBase, remult, repo } from 'remult'
import { Group } from './group.entity'
import { GroupMembership } from './group-membership.entity'
import { PlanTier } from './plan-tier.enum'
import { Parent } from '../users/parent.entity'
import { UserRole } from '../users/user-role.enum'
import { terms } from '../common/terms'
import { CreateGroupRequest } from './type/create-group.request.type'

@Controller('groups')
export class GroupsController extends ControllerBase {
  /**
   * יצירת קבוצה — כולל ה-gating של התמחור:
   * FREE → קבוצה אחת בלבד; ריבוי קבוצות דורש PRO.
   * ה-gating הוא שכבת מדיניות נפרדת — קל לשנות מה נעול בלי לגעת במבנה.
   */
  @BackendMethod({ allowed: Allow.authenticated })
  static async createGroup(req: CreateGroupRequest): Promise<Group> {
    const userId = remult.user?.id
    if (!userId) throw new Error(terms.unauthorizedOperation)

    const parent = await repo(Parent).findId(userId)
    if (!parent) throw new Error(terms.unauthorizedOperation)

    if (parent.plan.id === PlanTier.free.id) {
      const owned = await repo(Group).count({ ownerId: userId, isActive: true })
      if (owned >= 1) throw new Error(terms.proRequiredForMultipleGroups)
    }

    const group = await repo(Group).insert({ name: req.name, ownerId: userId })
    await repo(GroupMembership).insert({
      groupId: group.id,
      parentId: userId,
      roleInGroup: UserRole.admin
    })
    return group
  }
}
