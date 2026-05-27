import { Injectable } from '@angular/core'
import { remult } from 'remult'
import { Event } from '../../shared/events/event.entity'
import { EventType } from '../../shared/events/event-type.entity'
import { EventsController } from '../../shared/events/events.controller'

@Injectable({ providedIn: 'root' })
export class EventsService {
  events() {
    return remult.repo(Event).find({ where: { isActive: true }, orderBy: { name: 'asc' } })
  }

  eventTypes() {
    return remult.repo(EventType).find({ where: { isActive: true } })
  }

  generateOccurrences(eventId: string, fromDate: string, toDate: string) {
    return EventsController.generateOccurrences(eventId, fromDate, toDate)
  }
}
