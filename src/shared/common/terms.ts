/**
 * מילון מחרוזות — עברית (ברירת מחדל). מקור-אמת יחיד למחרוזות ולתוויות שדות (captions),
 * משמש גם את ה-entities (shared) וגם את הקליינט (app). תרגום לשפות נוספות: ראו app/common/i18n.
 * אין מחרוזות קשיחות בקוד או ב-HTML — הכל עובר דרך terms.
 */
export const terms = {
  // כללי / UI
  appTitle: 'הסעות בר-אילן',
  rtl: true,
  yes: 'כן',
  no: 'לא',
  ok: 'אישור',
  cancel: 'ביטול',
  close: 'סגור',
  save: 'שמירה',
  add: 'הוספה',
  edit: 'עריכה',
  delete: 'מחיקה',
  search: 'חיפוש',
  loading: 'טוען...',
  requiredField: 'שדה חובה',
  unauthorizedOperation: 'אין הרשאה לבצע פעולה זו',
  areYouSure: 'האם אתה בטוח?',

  // ניווט / מסכים
  today: 'היום',
  schedule: 'סידור',
  group: 'קבוצה',
  events: 'אירועים',
  fairness: 'הוגנות',
  attendance: 'אישורי הגעה',

  // התחברות
  signIn: 'כניסה',
  signOut: 'יציאה',
  invalidSignIn: 'פרטי התחברות שגויים',
  enterMobile: 'הזן מספר נייד',
  hello: 'שלום',

  // קבוצה
  groupName: 'שם הקבוצה',
  groupOwner: 'בעל הקבוצה',
  plan: 'תוכנית',
  members: 'חברי הקבוצה',
  roleInGroup: 'תפקיד בקבוצה',
  upgradeToPro: 'שדרוג ל-PRO',
  proRequiredForMultipleGroups: 'יצירת קבוצה נוספת דורשת תוכנית PRO',

  // הורה
  fullName: 'שם מלא',
  mobile: 'נייד',
  email: 'אימייל',
  seats: 'מקומות ברכב',
  canDrive: 'משתתף בנהיגה',
  isActive: 'פעיל',
  role: 'תפקיד',
  notes: 'הערות',
  parent: 'הורה',
  parents: 'הורים',

  // ילד
  child: 'ילד',
  children: 'ילדים',
  pickupAddress: 'כתובת איסוף',
  parentId: 'הורה אחראי',

  // אירוע
  event: 'אירוע',
  eventType: 'סוג אירוע',
  eventTypeId: 'סוג אירוע',
  eventName: 'שם האירוע',
  location: 'מיקום',
  isRecurring: 'אירוע חוזר',
  dayOfWeek: 'יום בשבוע',
  date: 'תאריך',
  startTime: 'שעת התחלה',
  durationMinutes: 'משך (דקות)',
  enrolledChildren: 'ילדים בסבב',

  // מופע
  occurrence: 'מופע',
  occurrences: 'מופעים',
  occurrenceStatus: 'סטטוס מופע',
  endTime: 'שעת סיום',

  // אישור הגעה
  attendanceStatus: 'סטטוס הגעה',
  needsRideTo: 'הסעה הלוך',
  needsRideFrom: 'הסעה חזור',
  respondedAt: 'מועד תגובה',
  respondedBy: 'אושר ע"י',
  coming: 'מגיע',
  notComing: 'לא מגיע',

  // שיבוץ נסיעה / סבב
  driveAssignment: 'שיבוץ נסיעה',
  direction: 'כיוון',
  to: 'הלוך',
  from: 'חזור',
  assignedParent: 'נהג משובץ',
  assignmentStatus: 'סטטוס שיבוץ',
  passengers: 'נוסעים',
  yourTurnToDrive: 'היום התור שלך להסיע',
  whoDrivesToday: 'מי מסיע היום',
  swapDriver: 'בקש החלפת נהג',
  driveCount: 'מספר נסיעות',
  nextTurn: 'התור הבא',

  // מדיניות סבב
  assignmentPolicy: 'מדיניות סבב',
  whenDriverChildAbsent: 'כשהילד של הנהג לא מגיע',
  countDriveWhenOwnChildAbsent: 'ספירת נסיעה כשהילד שלי לא בא',
  separateToAndFrom: 'סבב נפרד להלוך/חזור',
  respectSeats: 'התחשבות בקיבולת רכב',

  createDate: 'תאריך יצירה'
}

export type Terms = typeof terms
