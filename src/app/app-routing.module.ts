import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomeComponent } from './home/home.component'
import { SignInComponent } from './users/sign-in/sign-in.component'
import { ScheduleComponent } from './carpool/schedule/schedule.component'
import { GroupComponent } from './groups/group/group.component'
import { AuthenticatedGuard, NotAuthenticatedGuard } from './common/guards/auth.guard'

// data.menu = מפתח ב-terms; data.icon = אייקון Material. מהם נבנה התפריט/הטאבים.
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthenticatedGuard],
    data: { menu: 'today', icon: 'home' }
  },
  {
    path: 'schedule',
    component: ScheduleComponent,
    canActivate: [AuthenticatedGuard],
    data: { menu: 'schedule', icon: 'event' }
  },
  {
    path: 'group',
    component: GroupComponent,
    canActivate: [AuthenticatedGuard],
    data: { menu: 'group', icon: 'group' }
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [NotAuthenticatedGuard]
  },
  { path: '**', redirectTo: '' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
