import { Component, OnInit } from '@angular/core'
import { remult } from 'remult'
import { Parent } from '../../../shared/users/parent.entity'
import { Child } from '../../../shared/users/child.entity'
import { DriveAssignment } from '../../../shared/carpool/drive-assignment.entity'
import { EventOccurrence } from '../../../shared/events/event-occurrence.entity'
import { EventEnrollment } from '../../../shared/events/event-enrollment.entity'
import { CarpoolService } from '../carpool.service'
import { WantsToCloseDialog } from '../../common/open-dialog'
import { DialogConfig } from '../../common/dialog-config'
import { UIToolsService } from '../../common/ui-tools.service'
import { terms } from '../../../shared/common/terms'

@DialogConfig({
  minWidth: '300px',
  maxWidth: '420px',
  width: 'calc(100vw - 32px)',
  panelClass: 'app-dialog',
  autoFocus: false
})
@Component({
  selector: 'app-swap-driver',
  standalone: false,
  templateUrl: './swap-driver.component.html',
  styleUrls: ['./swap-driver.component.scss']
})
export class SwapDriverComponent implements OnInit, WantsToCloseDialog {
  args!: {
    assignmentId: string
    currentParentId: string
    directionLabel: string
    seatsNeeded: number
  }
  terms = terms
  drivers: Parent[] = []
  reason = ''
  changed = false
  closeDialog!: VoidFunction

  constructor(private ui: UIToolsService, private carpool: CarpoolService) {}

  async ngOnInit() {
    // הרשימה חייבת להיות בדיוק מעגל-הסבב של האירוע — הורי הילדים שברוסטר.
    // (אותה לוגיקה כמו ב-RotationController.drivingCircle בשרת.)
    const assignment = await remult.repo(DriveAssignment).findId(this.args.assignmentId)
    if (!assignment) return

    const occ = await remult.repo(EventOccurrence).findId(assignment.occurrenceId)
    if (!occ) return

    const enrollments = await remult.repo(EventEnrollment).find({
      where: { eventId: occ.eventId }
    })
    const childIds = enrollments.map((e) => e.childId)
    if (childIds.length === 0) {
      this.drivers = []
      return
    }

    const children = await remult.repo(Child).find({ where: { id: childIds } })
    const parentIds = [...new Set(children.map((c) => c.parentId))]
    if (parentIds.length === 0) {
      this.drivers = []
      return
    }

    this.drivers = await remult.repo(Parent).find({
      where: { id: parentIds, canDrive: true, isActive: true },
      orderBy: { fullName: 'asc' }
    })
  }

  async pick(driver: Parent) {
    if (driver.id === this.args.currentParentId) {
      this.closeDialog()
      return
    }
    try {
      await this.ui.busy.doWhileShowingBusy(async () => {
        await this.carpool.swapDriver({
          assignmentId: this.args.assignmentId,
          newParentId: driver.id,
          reason: this.reason.trim() || undefined
        })
      })
      this.changed = true
      this.closeDialog()
    } catch (e) {
      this.ui.error(e)
    }
  }

  enoughSeats(d: Parent): boolean {
    return d.seats >= this.args.seatsNeeded
  }
}
