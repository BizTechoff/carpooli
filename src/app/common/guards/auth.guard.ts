import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router'
import { Allowed, Remult } from 'remult'
import { RouteHelperService } from '../route-helper.service'
import { Roles } from '../../../shared/users/roles'

export declare type AngularComponent = { new (...args: any[]): any }

@Injectable({ providedIn: 'root' })
export class AuthenticatedGuard implements CanActivate {
  constructor(
    protected remult: Remult,
    private router: Router,
    private helper: RouteHelperService
  ) {}

  isAllowed(): Allowed {
    return true
  }

  static componentToNavigateIfNotAllowed: AngularComponent

  canActivate(route: ActivatedRouteSnapshot) {
    if (this.remult.authenticated() && this.remult.isAllowed(this.isAllowed())) {
      return true
    }
    if (!(route instanceof DummyRoute)) {
      const x = AuthenticatedGuard.componentToNavigateIfNotAllowed
      if (x) this.helper.navigateToComponent(x)
      else this.router.navigate(['/'])
    }
    return false
  }
}

@Injectable({ providedIn: 'root' })
export class NotAuthenticatedGuard implements CanActivate {
  constructor(private remult: Remult) {}
  canActivate() {
    return !this.remult.authenticated()
  }
}

/** route מדומה לבדיקת guards בעת בניית התפריט */
export class DummyRoute extends ActivatedRouteSnapshot {
  constructor() {
    super()
  }
  override routeConfig: any
}

@Injectable({ providedIn: 'root' })
export class AdminGuard extends AuthenticatedGuard {
  override isAllowed() {
    return Roles.admin
  }
}

@Injectable({ providedIn: 'root' })
export class ParentGuard extends AuthenticatedGuard {
  override isAllowed() {
    return Roles.parent
  }
}
