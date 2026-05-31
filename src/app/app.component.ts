import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { NavigationEnd, Router } from '@angular/router'
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
  isAuthRoute = false

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

    // מעקב אחר ה-route הנוכחי כדי להסתיר את המעטפת (טולבר/טאבים) במסך הכניסה
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.isAuthRoute = e.urlAfterRedirects.startsWith('/sign-in')
      }
    })
  }

  async ngOnInit() {
    // initUser כבר רץ ב-APP_INITIALIZER לפני bootstrap, אז כאן רק לוודא ניקוי שפויל
    if (!this.remult.user?.id) {
      this.remult.user = undefined
    }
    this.buildTabs()
    this.ready = true
  }

  private buildTabs() {
    // לטאבים הראשיים: כל route עם data.menu שאינו דורש תפקיד מיוחד.
    // ה-*ngIf="remult.authenticated()" ב-template כבר מטפל בדרישת ההתחברות,
    // אז אין צורך בבדיקת guards נוספת (שעלולה להחזיר false ולהסתיר את כל הטאבים).
    this.tabs = routes
      .filter((r) => r.data && r.data['menu'])
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
      // ניקוי מפורש בצד-הקליינט (לא להסתמך רק על initUser)
      this.remult.user = undefined
      try {
        await this.remult.initUser()
      } catch {
        /* ignore */
      }
    })
    this.router.navigate(['/sign-in'])
  }
}
