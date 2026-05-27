import { Injectable, Injector } from '@angular/core'
import { CanActivate, Route, Router } from '@angular/router'
import { DummyRoute } from './guards/auth.guard'

/**
 * עזר ניתוב: ניווט לפי קומפוננטה, ובדיקה האם המשתמש רשאי לראות route מסוים —
 * משמש לבניית עץ התפריט הצידי מתוך תצורת ה-routing.
 */
@Injectable({ providedIn: 'root' })
export class RouteHelperService {
  constructor(private router: Router, private injector: Injector) {}

  navigateToComponent(toComponent: { new (...args: any[]): any }) {
    let done = false
    this.router.config.forEach((path) => {
      if (done) return
      if (path.component === toComponent) {
        done = true
        this.router.navigate(['/' + path.path])
      }
    })
  }

  canNavigateToRoute(route: Route): boolean {
    if (!route.canActivate) return true
    for (const guard of route.canActivate) {
      try {
        const g = this.injector.get<CanActivate>(guard as any)
        if (g && g.canActivate) {
          const r = new DummyRoute()
          r.routeConfig = route
          const can = g.canActivate(r, undefined!)
          if (!can) return false
        }
      } catch {
        return true
      }
    }
    return true
  }
}
