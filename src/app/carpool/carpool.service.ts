import { Injectable } from '@angular/core'
import { ScheduleController } from '../../shared/carpool/schedule.controller'
import { RotationController } from '../../shared/carpool/rotation.controller'
import { GenerateScheduleRequest } from '../../shared/carpool/type/generate-schedule.request.type'
import { SwapDriverRequest } from '../../shared/carpool/type/swap-driver.request.type'

@Injectable({ providedIn: 'root' })
export class CarpoolService {
  generateSchedule(req: GenerateScheduleRequest) {
    return ScheduleController.generateSchedule(req)
  }

  getSchedule(eventId: string, fromDate: string, toDate: string) {
    return ScheduleController.getSchedule(eventId, fromDate, toDate)
  }

  fairness(eventId: string) {
    return RotationController.fairnessReport(eventId)
  }

  swapDriver(req: SwapDriverRequest) {
    return RotationController.swapDriver(req)
  }
}
