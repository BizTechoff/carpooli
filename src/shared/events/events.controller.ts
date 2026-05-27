import { Allow, BackendMethod, Controller, ControllerBase, repo } from 'remult'
import { Event } from './event.entity'
import { EventOccurrence } from './event-occurrence.entity'
import { addMinutes, dateKey } from '../common/time.util'

@Controller('events')
export class EventsController extends ControllerBase {
  /**
   * יצירת מופעים (EventOccurrence) מתוך דפוס האירוע, בטווח תאריכים.
   * אירוע חוזר → מופע לכל יום-בשבוע תואם; אירוע חד-פעמי → מופע יחיד.
   * אידמפוטנטי: לא יוצר כפילויות אם כבר קיים מופע לאותו תאריך.
   */
  @BackendMethod({ allowed: Allow.authenticated })
  static async generateOccurrences(
    eventId: string,
    fromDate: string,
    toDate: string
  ): Promise<EventOccurrence[]> {
    const event = await repo(Event).findId(eventId)
    if (!event) throw new Error('event not found')

    const from = new Date(fromDate)
    const to = new Date(toDate)

    // תאריכים מבוקשים לפי הדפוס
    const wanted: Date[] = []
    if (event.isRecurring && event.dayOfWeek) {
      const target = event.dayOfWeek.dayNumber
      const d = new Date(from)
      while (d <= to) {
        if (d.getDay() === target) wanted.push(new Date(d))
        d.setDate(d.getDate() + 1)
      }
    } else if (event.date) {
      const ed = new Date(event.date)
      if (ed >= from && ed <= to) wanted.push(ed)
    }

    // מופעים קיימים בטווח (למניעת כפילויות)
    const existing = await repo(EventOccurrence).find({
      where: { eventId, date: { $gte: from, $lte: to } }
    })
    const existingKeys = new Set(existing.map((o) => dateKey(o.date)))

    const created: EventOccurrence[] = []
    for (const date of wanted) {
      if (existingKeys.has(dateKey(date))) continue
      const occ = await repo(EventOccurrence).insert({
        groupId: event.groupId,
        eventId,
        date,
        startTime: event.startTime,
        endTime: addMinutes(event.startTime, event.durationMinutes)
      })
      created.push(occ)
    }
    return created
  }
}
