import { Allow, BackendMethod, Controller, ControllerBase, remult, repo, UserInfo } from 'remult'
import { Parent } from './parent.entity'
import { UserRole } from './user-role.enum'
import { terms } from '../common/terms'
import { SignInRequest } from './type/sign-in.request.type'

@Controller('auth')
export class AuthController extends ControllerBase {
  /**
   * התחברות לפי מספר נייד (פאזה 1).
   * ההורה הראשון שמתחבר הופך לאדמין. בפאזה 2 יתווסף OTP ב-SMS.
   */
  @BackendMethod({ allowed: true })
  static async signInByMobile(req: SignInRequest): Promise<UserInfo | undefined> {
    const mobile = (req.mobile || '').trim()
    if (!mobile) throw new Error(terms.invalidSignIn)

    const parents = repo(Parent)
    let p = await parents.findFirst({ mobile })
    if (!p) {
      if ((await parents.count()) === 0) {
        p = await parents.insert({ mobile, fullName: mobile, role: UserRole.admin })
      }
    }
    if (!p || !p.isActive) throw new Error(terms.invalidSignIn)
    return setSessionUser(p)
  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async signOut(): Promise<void> {
    setSessionUser(undefined)
  }

  @BackendMethod({ allowed: true })
  static async currentUser(): Promise<UserInfo | undefined> {
    return remult.user
  }
}

/** שומר/מנקה את המשתמש ב-session (server↔client). גישה ל-session דרך cast כדי לא לתלות את shared ב-express. */
export function setSessionUser(parent?: Parent): UserInfo | undefined {
  const ctx: any = remult.context
  const session = ctx?.request?.session
  console.info(`[setSessionUser] hasContext=${!!ctx} hasRequest=${!!ctx?.request} hasSession=${!!session} parent=${parent?.fullName}`)
  if (!parent) {
    if (session) session['user'] = undefined
    return undefined
  }
  const info: UserInfo = { id: parent.id, name: parent.fullName, roles: [parent.role.id] }
  if (session) {
    session['user'] = info
    console.info(`[setSessionUser] wrote session user: ${JSON.stringify(info)}`)
  } else {
    console.warn(`[setSessionUser] NO SESSION — cookie לא ייכתב`)
  }
  return info
}
