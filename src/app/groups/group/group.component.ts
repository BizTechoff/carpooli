import { Component, OnInit } from '@angular/core'
import { UsersService } from '../../users/users.service'
import { EventsService } from '../../events/events.service'
import { UIToolsService } from '../../common/ui-tools.service'
import { Parent } from '../../../shared/users/parent.entity'
import { Child } from '../../../shared/users/child.entity'
import { Event } from '../../../shared/events/event.entity'
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

  constructor(
    private usersSvc: UsersService,
    private eventsSvc: EventsService,
    private ui: UIToolsService
  ) {}

  async ngOnInit() {
    try {
      this.parents = await this.usersSvc.parents()
      this.children = await this.usersSvc.children()
      this.events = await this.eventsSvc.events()
    } catch (e) {
      this.ui.error(e)
    }
  }

  childrenOf(parentId: string): string {
    return this.children
      .filter((c) => c.parentId === parentId)
      .map((c) => c.fullName)
      .join(', ')
  }
}
