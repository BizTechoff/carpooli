import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Remult } from 'remult'
import { UsersService } from '../users.service'
import { UIToolsService } from '../../common/ui-tools.service'
import { terms } from '../../../shared/common/terms'

@Component({
  selector: 'app-sign-in',
  standalone: false,
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  terms = terms
  mobile = ''

  constructor(
    private users: UsersService,
    private remult: Remult,
    private router: Router,
    private ui: UIToolsService
  ) {}

  async signIn() {
    const m = this.mobile.trim()
    if (!m) return
    try {
      await this.ui.busy.doWhileShowingBusy(async () => {
        await this.users.signIn(m)
        await this.remult.initUser()
      })
      if (this.remult.authenticated()) this.router.navigate(['/'])
      else this.ui.info(terms.invalidSignIn)
    } catch (e) {
      this.ui.error(e)
    }
  }
}
