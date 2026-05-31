import { Component, OnInit } from '@angular/core'
import { UsersService } from '../../users/users.service'
import { EventsService } from '../../events/events.service'
import { UIToolsService } from '../../common/ui-tools.service'
import { Parent } from '../../../shared/users/parent.entity'
import { Child } from '../../../shared/users/child.entity'
import { Event } from '../../../shared/events/event.entity'
import { Group } from '../../../shared/groups/group.entity'
import { remult } from 'remult'
import { terms } from '../../../shared/common/terms'

@Component({
  selector: 'app-group',
  standalone: false,
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  terms = terms
  parents: Parent[] = []
  children: Child[] = []
  events: Event[] = []
  currentGroup: Group | null = null

  constructor(
    private usersSvc: UsersService,
    private eventsSvc: EventsService,
    private ui: UIToolsService
  ) {}

  async ngOnInit() {
    await this.reload()
  }

  async reload() {
    try {
      // ודא שקיימת קבוצה (יצירה אוטומטית בכניסה הראשונה)
      let groups = await remult.repo(Group).find({ where: { isActive: true } })
      if (groups.length === 0 && remult.user?.id) {
        const ng = await remult.repo(Group).insert({
          name: 'הקבוצה שלי',
          ownerId: remult.user.id
        })
        groups = [ng]
      }
      this.currentGroup = groups[0] || null

      this.parents = await this.usersSvc.parents()
      this.children = await this.usersSvc.children()
      this.events = await this.eventsSvc.events()
    } catch (e) {
      this.ui.error(e)
    }
  }

  async openParent(parentId = '') {
    const changed = await this.ui.openParentDetails(parentId)
    if (changed) await this.reload()
  }

  async openEvent(eventId = '') {
    const changed = await this.ui.openEventDetails(eventId, this.currentGroup?.id || '')
    if (changed) await this.reload()
  }

  childrenOf(parentId: string): string {
    return this.children
      .filter((c) => c.parentId === parentId)
      .map((c) => c.fullName)
      .join(', ')
  }
}
