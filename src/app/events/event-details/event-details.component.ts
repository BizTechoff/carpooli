import { Component, OnInit } from '@angular/core'
import { remult } from 'remult'
import { Event } from '../../../shared/events/event.entity'
import { EventType } from '../../../shared/events/event-type.entity'
import { EventEnrollment } from '../../../shared/events/event-enrollment.entity'
import { Child } from '../../../shared/users/child.entity'
import { Parent } from '../../../shared/users/parent.entity'
import { Group } from '../../../shared/groups/group.entity'
import { DayOfWeek } from '../../../shared/events/day-of-week.enum'
import { WantsToCloseDialog } from '../../common/open-dialog'
import { DialogConfig } from '../../common/dialog-config'
import { UIToolsService } from '../../common/ui-tools.service'
import { terms } from '../../../shared/common/terms'

@DialogConfig({
  minWidth: '300px',
  maxWidth: '480px',
  width: 'calc(100vw - 32px)',
  panelClass: 'app-dialog',
  autoFocus: false
})
@Component({
  selector: 'app-event-details',
  standalone: false,
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit, WantsToCloseDialog {
  args!: { eventId: string; groupId?: string }
  terms = terms
  event!: Event
  typeName = ''
  eventTypes: EventType[] = []
  children: Child[] = []
  parentById: Record<string, string> = {}
  enrolledChildIds = new Set<string>()
  changed = false
  closeDialog!: VoidFunction

  days = [
    DayOfWeek.sunday,
    DayOfWeek.monday,
    DayOfWeek.tuesday,
    DayOfWeek.wednesday,
    DayOfWeek.thursday,
    DayOfWeek.friday,
    DayOfWeek.saturday
  ]

  constructor(private ui: UIToolsService) {}

  async ngOnInit() {
    if (this.args.eventId) {
      const e = await remult.repo(Event).findId(this.args.eventId)
      this.event = e ?? remult.repo(Event).create()
    } else {
      this.event = remult.repo(Event).create()
      this.event.isRecurring = true
      if (this.args.groupId) {
        this.event.groupId = this.args.groupId
      } else {
        const groups = await remult.repo(Group).find({ where: { isActive: true }, limit: 1 })
        if (groups.length > 0) this.event.groupId = groups[0].id
      }
    }

    this.eventTypes = await remult.repo(EventType).find({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    if (this.event.eventTypeId) {
      const t = this.eventTypes.find((x) => x.id === this.event.eventTypeId)
      if (t) this.typeName = t.name
    }

    this.children = await remult.repo(Child).find({
      where: { isActive: true },
      orderBy: { fullName: 'asc' }
    })
    const parents = await remult.repo(Parent).find({ where: { isActive: true } })
    this.parentById = Object.fromEntries(parents.map((p) => [p.id, p.fullName]))

    if (this.event.id) {
      const enrollments = await remult.repo(EventEnrollment).find({
        where: { eventId: this.event.id }
      })
      this.enrolledChildIds = new Set(enrollments.map((e) => e.childId))
    }
  }

  isNew(): boolean {
    return !this.event || !this.event.id
  }

  isDaySelected(d: DayOfWeek): boolean {
    return this.event.daysOfWeek?.includes(d.id) || false
  }

  toggleDay(d: DayOfWeek) {
    if (!this.event.daysOfWeek) this.event.daysOfWeek = []
    const i = this.event.daysOfWeek.indexOf(d.id)
    if (i >= 0) this.event.daysOfWeek.splice(i, 1)
    else this.event.daysOfWeek.push(d.id)
  }

  isEnrolled(id: string): boolean {
    return this.enrolledChildIds.has(id)
  }

  toggleEnrolled(id: string) {
    if (this.enrolledChildIds.has(id)) this.enrolledChildIds.delete(id)
    else this.enrolledChildIds.add(id)
  }

  // המרה בין Date ל-string לאינפוט date
  get dateString(): string {
    if (!this.event?.date) return ''
    const d = new Date(this.event.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  set dateString(v: string) {
    this.event.date = v ? new Date(v) : null
  }

  async save() {
    try {
      await this.ui.busy.doWhileShowingBusy(async () => {
        // לפתור/ליצור סוג אירוע מהשם שהוקלד
        const name = this.typeName.trim()
        if (name) {
          let t = this.eventTypes.find((x) => x.name === name)
          if (!t) {
            t = await remult.repo(EventType).insert({ name })
            this.eventTypes.push(t)
          }
          this.event.eventTypeId = t.id
        }

        await remult.repo(Event).save(this.event)

        // עדכון רוסטר ילדים
        const existing = await remult.repo(EventEnrollment).find({
          where: { eventId: this.event.id }
        })
        const existingIds = new Set(existing.map((x) => x.childId))
        for (const childId of this.enrolledChildIds) {
          if (!existingIds.has(childId)) {
            await remult.repo(EventEnrollment).insert({
              groupId: this.event.groupId,
              eventId: this.event.id,
              childId
            })
          }
        }
        for (const e of existing) {
          if (!this.enrolledChildIds.has(e.childId)) {
            await remult.repo(EventEnrollment).delete(e.id)
          }
        }
      })
      this.changed = true
      this.closeDialog()
    } catch (e) {
      this.ui.error(e)
    }
  }

  async delete() {
    if (this.isNew()) return
    const ok = await this.ui.yesNoQuestion(
      `${terms.areYouSure} ${terms.delete} ${this.event.name}?`
    )
    if (!ok) return
    try {
      await this.ui.busy.doWhileShowingBusy(async () => {
        await remult.repo(Event).delete(this.event.id)
      })
      this.changed = true
      this.closeDialog()
    } catch (e) {
      this.ui.error(e)
    }
  }
}
