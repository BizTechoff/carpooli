import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { Remult } from 'remult'
import { setMatDialog } from './common/open-dialog'
import { RouteHelperService } from './common/route-helper.service'
import { AuthenticatedGuard } from './common/guards/auth.guard'
import { LangService } from './common/i18n/lang.service'
import { UIToolsService } from './common/ui-tools.service'
import { AuthController } from '../shared/users/auth.controller'
import { SignInComponent } from './users/sign-in/sign-in.component'
import { routes } from './app-routing.module'
import { terms } from '../shared/common/terms'

interface Tab {
  path: string
  label: string
  icon: string
}

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  terms = terms
  ready = false
  tabs: Tab[] = []

  constructor(
    public remult: Remult,
    dialog: MatDialog,
    private router: Router,
    private routeHelper: RouteHelperService,
    private lang: LangService,
    public ui: UIToolsService
  ) {
    setMatDialog(dialog)
    AuthenticatedGuard.componentToNavigateIfNotAllowed = SignInComponent
    this.lang.init()
  }

  async ngOnInit() {
    try {
      await this.remult.initUser()
    } catch {
      /* ignore */
    }
    this.buildTabs()
    this.ready = true
    if (!this.remult.authenticated()) {
      this.router.navigate(['/sign-in'])
    }
  }

  private buildTabs() {
    this.tabs = routes
      .filter((r) => r.data && r.data['menu'] && this.routeHelper.canNavigateToRoute(r))
      .map((r) => ({
        path: '/' + (r.path || ''),
        label: (terms as any)[r.data!['menu']] || r.data!['menu'],
        icon: r.data!['icon']
      }))
  }

  isExact(path: string): boolean {
    return path === '/'
  }

  async signOut() {
    await this.ui.busy.doWhileShowingBusy(async () => {
      await AuthController.signOut()
      await this.remult.initUser()
    })
    this.router.navigate(['/sign-in'])
  }
}
