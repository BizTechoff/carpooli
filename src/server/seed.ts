/**
 * זריעת נתוני דמו (אופציונלי). הרצה: npm run seed  (דורש DATABASE_URL).
 * יוצר קבוצה אחת, 4 הורים + ילדים, סוג אירוע "חוג", אירוע חוזר, ומדיניות סבב.
 */
import { remult } from 'remult'
import { createPostgresDataProvider } from 'remult/postgres'
import { Group } from '../shared/groups/group.entity'
import { Parent } from '../shared/users/parent.entity'
import { Child } from '../shared/users/child.entity'
import { GroupMembership } from '../shared/groups/group-membership.entity'
import { EventType } from '../shared/events/event-type.entity'
import { Event } from '../shared/events/event.entity'
import { EventEnrollment } from '../shared/events/event-enrollment.entity'
import { AssignmentPolicy } from '../shared/carpool/assignment-policy.entity'
import { UserRole } from '../shared/users/user-role.enum'
import { DayOfWeek } from '../shared/events/day-of-week.enum'

async function seed() {
  const connectionString = process.env['DATABASE_URL']
  if (!connectionString) {
    console.error('DATABASE_URL required for seed')
    process.exit(1)
  }
  remult.dataProvider = await createPostgresDataProvider({ connectionString })

  const group = await remult.repo(Group).insert({ name: 'משפחות בר-אילן' })

  const parentsData = [
    { fullName: 'משה', mobile: '0501111111', role: UserRole.admin, seats: 4 },
    { fullName: 'שרה', mobile: '0502222222', role: UserRole.parent, seats: 5 },
    { fullName: 'דוד', mobile: '0503333333', role: UserRole.parent, seats: 4 },
    { fullName: 'רוני', mobile: '0504444444', role: UserRole.parent, seats: 4, canDrive: false }
  ]
  const childNames = ['דניאל', 'יעל', 'נועם', 'איתי']

  const eventType = await remult.repo(EventType).insert({ name: 'חוג' })
  const event = await remult.repo(Event).insert({
    groupId: group.id,
    name: 'חוג בבר-אילן',
    eventTypeId: eventType.id,
    location: 'אוניברסיטת בר-אילן',
    isRecurring: true,
    dayOfWeek: DayOfWeek.sunday,
    startTime: '17:15',
    durationMinutes: 90
  })

  for (let i = 0; i < parentsData.length; i++) {
    const p = await remult.repo(Parent).insert(parentsData[i])
    await remult.repo(GroupMembership).insert({
      groupId: group.id,
      parentId: p.id,
      roleInGroup: p.role
    })
    const child = await remult.repo(Child).insert({ fullName: childNames[i], parentId: p.id })
    await remult.repo(EventEnrollment).insert({ groupId: group.id, eventId: event.id, childId: child.id })
  }

  await remult.repo(AssignmentPolicy).insert({ groupId: group.id, eventId: event.id })

  console.info('Seed completed.')
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
