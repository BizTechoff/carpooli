import { MatDialogConfig } from '@angular/material/dialog'
import { dialogConfigMember } from './open-dialog'

/** דקורטור להגדרת תצורת דיאלוג על קומפוננטה (רוחב, panelClass וכו') */
export function DialogConfig(config: MatDialogConfig) {
  return (target: any) => {
    target[dialogConfigMember] = config
  }
}
