import { Component, OnInit } from '@angular/core'
import { EventsService } from '../../events/events.service'
import { UsersService } from '../../users/users.service'
import { CarpoolService } from '../carpool.service'
import { UIToolsService } from '../../common/ui-tools.service'
import { Event } from '../../../shared/events/event.entity'
import { OccurrenceWithAssignments } from '../../../shared/carpool/type/schedule.response.type'
import { AttendanceStatus } from '../../../shared/attendance/attendance-status.enum'
import { dateKey } from '../../../shared/common/time.util'
import { terms } from '../../../shared/common/terms'

@Component({
  selector: 'app-schedule',
  standalone: false,
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  terms = terms
  events: Event[] = []
  selectedEventId = ''
  occurrences: OccurrenceWithAssignments[] = []
  parentName: Record<string, string> = {}

  constructor(
    private eventsSvc: EventsService,
    private usersSvc: UsersService,
    private carpool: CarpoolService,
    private ui: UIToolsService
  ) {}

  async ngOnInit() {
    try {
      this.events = await this.eventsSvc.events()
      const parents = await this.usersSvc.parents()
      this.parentName = Object.fromEntries(parents.map((p) => [p.id, p.fullName]))
      if (this.events.length) {
        this.selectedEventId = this.events[0].id
        await this.load()
      }
    } catch (e) {
      this.ui.error(e)
    }
  }

  private range() {
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + 30)
    return { from: dateKey(from), to: dateKey(to) }
  }

  async load() {
    if (!this.selectedEventId) return
    const { from, to } = this.range()
    try {
      this.occurrences = (await this.carpool.getSchedule(this.selectedEventId, from, to)).occurrences
    } catch (e) {
      this.ui.error(e)
    }
  }

  async generate() {
    if (!this.selectedEventId) return
    const { from, to } = this.range()
    try {
      await this.ui.busy.doWhileShowingBusy(async () => {
        this.occurrences = (
          await this.carpool.generateSchedule({ eventId: this.selectedEventId, fromDate: from, toDate: to })
        ).occurrences
      })
    } catch (e) {
      this.ui.error(e)
    }
  }

  attendingCount(o: OccurrenceWithAssignments): number {
    return o.attendances.filter((a) => a.status.id !== AttendanceStatus.declined.id).length
  }

  driverName(id?: string | null): string {
    return id ? this.parentName[id] || '—' : '—'
  }

  async swap(o: OccurrenceWithAssignments, leg: 'to' | 'from') {
    const assignment = leg === 'to' ? o.toAssignment : o.fromAssignment
    if (!assignment) return
    const changed = await this.ui.openSwapDriver({
      assignmentId: assignment.id,
      currentParentId: assignment.assignedParentId,
      directionLabel: leg === 'to' ? terms.to : terms.from,
      seatsNeeded: assignment.passengerChildIds?.length || 0
    })
    if (changed) await this.load()
  }
}
