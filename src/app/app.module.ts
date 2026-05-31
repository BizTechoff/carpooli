import { APP_INITIALIZER, NgModule, isDevMode } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule } from '@angular/forms'
import { ServiceWorkerModule } from '@angular/service-worker'
import { Remult, remult } from 'remult'

/**
 * חוסם את אתחול האפליקציה עד ש-initUser מסיים — קריטי כדי שהראוטר/Guards
 * יראו remult.user מוכן כבר במאזין הראשון של ה-navigation.
 */
export function initUserFactory(r: Remult): () => Promise<void> {
  return async () => {
    try {
      await r.initUser()
    } catch {
      /* ignore */
    }
  }
}

import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatDialogModule } from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatCardModule } from '@angular/material/card'
import { MatListModule } from '@angular/material/list'
import { MatChipsModule } from '@angular/material/chips'
import { MatCheckboxModule } from '@angular/material/checkbox'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { HomeComponent } from './home/home.component'
import { SignInComponent } from './users/sign-in/sign-in.component'
import { ScheduleComponent } from './carpool/schedule/schedule.component'
import { GroupComponent } from './groups/group/group.component'
import { WaitComponent } from './common/components/wait/wait.component'
import { YesNoQuestionComponent } from './common/components/yes-no-question/yes-no-question.component'
import { ParentDetailsComponent } from './users/parent-details/parent-details.component'
import { EventDetailsComponent } from './events/event-details/event-details.component'
import { SwapDriverComponent } from './carpool/swap-driver/swap-driver.component'

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SignInComponent,
    ScheduleComponent,
    GroupComponent,
    WaitComponent,
    YesNoQuestionComponent,
    ParentDetailsComponent,
    EventDetailsComponent,
    SwapDriverComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    MatChipsModule,
    MatCheckboxModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    { provide: Remult, useValue: remult },
    {
      provide: APP_INITIALIZER,
      useFactory: initUserFactory,
      deps: [Remult],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
