import { Injectable } from '@angular/core'
import { terms } from '../../../shared/common/terms'
import { termsEn } from './terms.en'

export type Lang = 'he' | 'en'

/**
 * ניהול שפה. ברירת מחדל: עברית (RTL).
 * הערה: מילון ה-terms הוא מקור-אמת יחיד (shared). מתודת translate ממזגת אנגלית פנימה.
 * תרגום מלא דו-כיווני בזמן ריצה (כולל captions של שדות) הוא שיפור לפאזה הבאה.
 */
@Injectable({ providedIn: 'root' })
export class LangService {
  current: Lang = 'he'
  private heSnapshot = { ...terms }

  init() {
    this.apply()
  }

  setLang(lang: Lang) {
    this.current = lang
    if (lang === 'en') {
      Object.assign(terms, termsEn)
    } else {
      Object.assign(terms, this.heSnapshot)
    }
    this.apply()
  }

  private apply() {
    document.documentElement.lang = this.current
    document.documentElement.dir = terms.rtl ? 'rtl' : 'ltr'
  }
}
