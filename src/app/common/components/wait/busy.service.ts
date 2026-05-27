import { Injectable } from '@angular/core'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { WaitComponent } from './wait.component'

/**
 * Loader גלובלי אחד. מאחר שכמעט כל הלוגיקה רצה בצד-שרת כ-BackendMethod בודד,
 * לרוב מדובר בקריאת רשת אחת — ולכן ה-loader פשוט ויעיל.
 */
@Injectable({ providedIn: 'root' })
export class BusyService {
  private waitRef?: MatDialogRef<WaitComponent>
  private numOfWaits = 0
  private disableWait = 0

  constructor(private dialog: MatDialog) {}

  /** מריץ פעולה בלי loader */
  async donotWait<T>(what: () => Promise<T>): Promise<T> {
    this.disableWait++
    try {
      return await what()
    } finally {
      this.disableWait--
    }
  }

  /** עוטף פעולה אסינכרונית ב-loader */
  async doWhileShowingBusy<T>(what: () => Promise<T>): Promise<T> {
    const close = this.showBusy()
    try {
      return await what()
    } finally {
      close()
    }
  }

  private showBusy(): VoidFunction {
    if (this.disableWait) return () => {}
    if (this.numOfWaits === 0) {
      setTimeout(() => {
        if (this.numOfWaits > 0 && !this.waitRef) {
          this.waitRef = this.dialog.open(WaitComponent, {
            disableClose: true,
            panelClass: 'wait-dialog',
            autoFocus: false,
            restoreFocus: false
          })
        }
      }, 250)
    }
    this.numOfWaits++
    return () => {
      this.numOfWaits--
      if (this.numOfWaits === 0 && this.waitRef) {
        this.waitRef.close()
        this.waitRef = undefined
      }
    }
  }
}
