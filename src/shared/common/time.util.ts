/** עזרי זמן/תאריך משותפים */

/** מוסיף דקות לשעה בפורמט "HH:mm" ומחזיר "HH:mm" */
export function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10))
  const total = (h * 60 + m + minutes) % (24 * 60)
  const nh = Math.floor(total / 60)
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

/** מפתח תאריך יציב (YYYY-MM-DD) להשוואה/סינון */
export function dateKey(d: Date): string {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}
