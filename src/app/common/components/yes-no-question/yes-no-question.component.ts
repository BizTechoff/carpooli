import { Component } from '@angular/core'
import { WantsToCloseDialog } from '../../open-dialog'
import { terms } from '../../../../shared/common/terms'

export interface YesNoArgs {
  message: string
  isQuestion?: boolean
}

@Component({
  selector: 'app-yes-no-question',
  standalone: false,
  templateUrl: './yes-no-question.component.html',
  styleUrls: ['./yes-no-question.component.scss']
})
export class YesNoQuestionComponent implements WantsToCloseDialog {
  args!: YesNoArgs
  okPressed = false
  terms = terms
  closeDialog!: VoidFunction

  confirm() {
    this.okPressed = true
    this.closeDialog()
  }

  cancel() {
    this.okPressed = false
    this.closeDialog()
  }
}
