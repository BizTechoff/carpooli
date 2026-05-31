import { Component, OnInit } from '@angular/core'
import { Remult, remult } from 'remult'
import { Event } from '../../shared/events/event.entity'
import { EventOccurrence } from '../../shared/events/event-occurrence.entity'
import { EventEnrollment } from '../../shared/events/event-enrollment.entity'
import { DriveAssignment } from '../../shared/carpool/drive-assignment.entity'
import { Child } from '../../shared/users/child.entity'
import { Parent } from '../../shared/users/parent.entity'
import { DriveDirection } from '../../shared/carpool/drive-direction.enum'
import { terms } from '../../shared/common/terms'

interface TodayItem {
  occurrenceId: string
  eventName: string
  location: string
  startTime: string
  endTime: string
  toDriverName: string
  fromDriverName: string
  iDriveTo: boolean
  iDriveFrom: boolean
  myChildName: string
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  terms = terms
  items: TodayItem[] = []
  loading = true

  constructor(public remult: Remult) {}

  async ngOnInit() {
    try {
      await this.load()
    } finally {
      this.loading = false
    }
  }

  private async load() {
    const userId = this.remult.user?.id
    if (!userId) return

    // היום (range יום בודד)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const occurrences = await remult.repo(EventOccurrence).find({
      where: { date: { $gte: today, $lt: tomorrow } },
      orderBy: { startTime: 'asc' }
    })
    if (occurrences.length === 0) return

    // הילדים שלי
    const myChildren = await remult.repo(Child).find({
      where: { parentId: userId, isActive: true }
    })
    const myChildIds = new Set(myChildren.map((c) => c.id))

    // מטעין פעם אחת ב-bulk את כל הקשורים
    const eventIds = [...new Set(occurrences.map((o) => o.eventId))]
    const occIds = occurrences.map((o) => o.id)

    const events = await remult.repo(Event).find({ where: { id: eventIds } })
    const eventById = new Map(events.map((e) => [e.id, e]))

    const enrollments = await remult.repo(EventEnrollment).find({
      where: { eventId: eventIds }
    })
    const childByEvent = new Map<string, string[]>()
    for (const e of enrollments) {
      const arr = childByEvent.get(e.eventId) || []
      arr.push(e.childId)
      childByEvent.set(e.eventId, arr)
    }

    const assignments = await remult.repo(DriveAssignment).find({
      where: { occurrenceId: occIds }
    })
    const driverIds = [
      ...new Set(assignments.map((a) => a.assignedParentId).filter(Boolean))
    ]
    const drivers = driverIds.length
      ? await remult.repo(Parent).find({ where: { id: driverIds } })
      : []
    const driverNameById = new Map(drivers.map((d) => [d.id, d.fullName]))

    const childNameById = new Map(myChildren.map((c) => [c.id, c.fullName]))

    for (const occ of occurrences) {
      const event = eventById.get(occ.eventId)
      if (!event) continue

      const enrolledIds = childByEvent.get(event.id) || []
      const myEnrolled = enrolledIds.find((id) => myChildIds.has(id))
      const toA = assignments.find(
        (a) => a.occurrenceId === occ.id && a.direction.id === DriveDirection.toEvent.id
      )
      const fromA = assignments.find(
        (a) => a.occurrenceId === occ.id && a.direction.id === DriveDirection.fromEvent.id
      )

      // הצג רק אם זה רלוונטי לי: יש לי ילד באירוע, או שאני נוהג
      const iDriveTo = toA?.assignedParentId === userId
      const iDriveFrom = fromA?.assignedParentId === userId
      const relevant = myEnrolled || iDriveTo || iDriveFrom
      if (!relevant) continue

      this.items.push({
        occurrenceId: occ.id,
        eventName: event.name,
        location: event.location,
        startTime: occ.startTime,
        endTime: occ.endTime,
        toDriverName: toA?.assignedParentId
          ? driverNameById.get(toA.assignedParentId) || '—'
          : '—',
        fromDriverName: fromA?.assignedParentId
          ? driverNameById.get(fromA.assignedParentId) || '—'
          : '—',
        iDriveTo,
        iDriveFrom,
        myChildName: myEnrolled ? childNameById.get(myEnrolled) || '' : ''
      })
    }
  }

  iAmDrivingToday(it: TodayItem): boolean {
    return it.iDriveTo || it.iDriveFrom
  }
}
