import { Component, OnInit } from '@angular/core'
import { remult } from 'remult'
import { Parent } from '../../../shared/users/parent.entity'
import { Child } from '../../../shared/users/child.entity'
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
  selector: 'app-parent-details',
  standalone: false,
  templateUrl: './parent-details.component.html',
  styleUrls: ['./parent-details.component.scss']
})
export class ParentDetailsComponent implements OnInit, WantsToCloseDialog {
  args!: { parentId: string }
  terms = terms
  parent!: Parent
  children: Child[] = []
  newChildName = ''
  changed = false
  closeDialog!: VoidFunction

  constructor(private ui: UIToolsService) {}

  async ngOnInit() {
    if (this.args.parentId) {
      const p = await remult.repo(Parent).findId(this.args.parentId)
      if (p) this.parent = p
      else this.parent = remult.repo(Parent).create()
    } else {
      this.parent = remult.repo(Parent).create()
    }
    if (this.parent.id) await this.loadChildren()
  }

  isNew(): boolean {
    return !this.parent || !this.parent.id
  }

  private async loadChildren() {
    if (!this.parent.id) return
    this.children = await remult.repo(Child).find({
      where: { parentId: this.parent.id },
      orderBy: { fullName: 'asc' }
    })
  }

  async addChild() {
    const name = this.newChildName.trim()
    if (!name || !this.parent.id) return
    try {
      await this.ui.busy.doWhileShowingBusy(async () => {
        await remult.repo(Child).insert({ fullName: name, parentId: this.parent.id })
      })
      this.newChildName = ''
      this.changed = true
      await this.loadChildren()
    } catch (e) {
      this.ui.error(e)
    }
  }

  async deleteChild(child: Child) {
    const ok = await this.ui.yesNoQuestion(
      `${terms.areYouSure} ${terms.delete} ${child.fullName}?`
    )
    if (!ok) return
    try {
      await this.ui.busy.doWhileShowingBusy(async () => {
        await remult.repo(Child).delete(child.id)
      })
      this.changed = true
      await this.loadChildren()
    } catch (e) {
      this.ui.error(e)
    }
  }

  async save() {
    try {
      await this.ui.busy.doWhileShowingBusy(async () => {
        await remult.repo(Parent).save(this.parent)
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
      `${terms.areYouSure} ${terms.delete} ${this.parent.fullName}?`
    )
    if (!ok) return
    try {
      await this.ui.busy.doWhileShowingBusy(async () => {
        await remult.repo(Parent).delete(this.parent.id)
      })
      this.changed = true
      this.closeDialog()
    } catch (e) {
      this.ui.error(e)
    }
  }
}
