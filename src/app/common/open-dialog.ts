import { MatDialog } from '@angular/material/dialog'

export const dialogConfigMember = Symbol('dialogConfigMember')

let _matDialog: MatDialog

export function setMatDialog(dialog: MatDialog) {
  _matDialog = dialog
}

/**
 * פתיחת דיאלוג גנרית — מעבירה פרמטרים ומחזירה ערך. בסיס ל-UIToolsService.
 */
export async function openDialog<T, C>(
  component: { new (...args: any[]): C },
  setParameters?: (it: C) => void,
  returnAValue?: (it: C) => T
): Promise<T> {
  const ref = _matDialog.open<C>(component, (component as any)[dialogConfigMember])
  const instance = ref.componentInstance as C
  if (setParameters) setParameters(instance)
  ;(instance as unknown as WantsToCloseDialog).closeDialog = () => ref.close()
  const r = await ref.beforeClosed().toPromise()
  if (returnAValue) return returnAValue(instance)
  return r as T
}

export interface WantsToCloseDialog {
  closeDialog: VoidFunction
}
