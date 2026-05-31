import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { openDialog } from './open-dialog'
import { YesNoQuestionComponent } from './components/yes-no-question/yes-no-question.component'
import { BusyService } from './components/wait/busy.service'
import { ParentDetailsComponent } from '../users/parent-details/parent-details.component'
import { EventDetailsComponent } from '../events/event-details/event-details.component'
import { SwapDriverComponent } from '../carpool/swap-driver/swap-driver.component'
import { terms } from '../../shared/common/terms'

export function extractError(err: any): string {
  if (typeof err === 'string') return err
  if (err?.modelState) {
    if (err.message) return err.message
    for (const key in err.modelState) return key + ': ' + err.modelState[key]
  }
  if (err?.rejection) return extractError(err.rejection)
  if (err?.httpStatusCode === 403) return terms.unauthorizedOperation
  if (err?.message) {
    if (err.error?.message) return err.error.message
    return err.message
  }
  if (err?.error) return extractError(err.error)
  return JSON.stringify(err)
}

/**
 * ToolService מרכזי: פותח דיאלוגים ומעביר אליהם פרמטרים, ומספק snackbar/שאלות/loader.
 * דיאלוגים ספציפיים-דומיין (openEventDetails וכו') ייווספו כאן כשהקומפוננטות נוצרות.
 */
@Injectable({ providedIn: 'root' })
export class UIToolsService {
  private mediaMatcher: MediaQueryList = matchMedia('(max-width: 720px)')

  constructor(
    private snackBar: MatSnackBar,
    public busy: BusyService
  ) {}

  isScreenSmall(): boolean {
    return this.mediaMatcher.matches
  }

  info(message: string): void {
    this.snackBar.open(message, terms.close, { duration: 4000 })
  }

  async error(err: any): Promise<void> {
    const message = extractError(err)
    if (message === 'Network Error') return
    await openDialog(
      YesNoQuestionComponent,
      (d) => (d.args = { message, isQuestion: false })
    )
  }

  async yesNoQuestion(question: string): Promise<boolean> {
    return await openDialog(
      YesNoQuestionComponent,
      (d) => (d.args = { message: question, isQuestion: true }),
      (d) => d.okPressed
    )
  }

  /** דיאלוג פרטי הורה (יצירה/עריכה/מחיקה). מחזיר true אם משהו השתנה. */
  async openParentDetails(parentId = ''): Promise<boolean> {
    return await openDialog(
      ParentDetailsComponent,
      (d) => (d.args = { parentId }),
      (d) => d?.changed || false
    )
  }

  /** דיאלוג פרטי אירוע (יצירה/עריכה/מחיקה + רוסטר ילדים). */
  async openEventDetails(eventId = '', groupId = ''): Promise<boolean> {
    return await openDialog(
      EventDetailsComponent,
      (d) => (d.args = { eventId, groupId }),
      (d) => d?.changed || false
    )
  }

  /** דיאלוג החלפת נהג בשיבוץ קיים. */
  async openSwapDriver(args: {
    assignmentId: string
    currentParentId: string
    directionLabel: string
    seatsNeeded: number
  }): Promise<boolean> {
    return await openDialog(
      SwapDriverComponent,
      (d) => (d.args = args),
      (d) => d?.changed || false
    )
  }
}
