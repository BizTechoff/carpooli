import { Injectable } from '@angular/core'
import { remult } from 'remult'
import { Parent } from '../../shared/users/parent.entity'
import { Child } from '../../shared/users/child.entity'
import { AuthController } from '../../shared/users/auth.controller'

@Injectable({ providedIn: 'root' })
export class UsersService {
  signIn(mobile: string) {
    return AuthController.signInByMobile({ mobile })
  }

  signOut() {
    return AuthController.signOut()
  }

  parents() {
    return remult.repo(Parent).find({ orderBy: { fullName: 'asc' } })
  }

  children() {
    return remult.repo(Child).find({ orderBy: { fullName: 'asc' } })
  }
}
