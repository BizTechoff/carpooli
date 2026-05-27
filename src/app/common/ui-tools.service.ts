import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { openDialog } from './open-dialog'
import { YesNoQuestionComponent } from './components/yes-no-question/yes-no-question.component'
import { BusyService } from './components/wait/busy.service'
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
}
