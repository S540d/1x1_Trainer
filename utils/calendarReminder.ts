/**
 * Kalendereintrags-Generator für die Übungserinnerung (Issue #381).
 * Reine Hilfsfunktionen ohne Seiteneffekte — Linking/Download passiert im UI-Layer.
 */

export type ReminderCadence = 'daily' | 'everyTwoDays' | 'weekend';

export interface ReminderPlanParams {
  hour: number;
  minute: number;
  cadence: ReminderCadence;
  title: string;
  description: string;
  uid: string;
  durationMinutes?: number;
  now?: Date;
}

export interface ReminderPlan {
  icsContent: string;
  googleCalendarUrl: string;
}

function rruleForCadence(cadence: ReminderCadence): string {
  switch (cadence) {
    case 'daily':
      return 'FREQ=DAILY';
    case 'everyTwoDays':
      return 'FREQ=DAILY;INTERVAL=2';
    case 'weekend':
      return 'FREQ=WEEKLY;BYDAY=SA,SU';
  }
}

// Next local occurrence of hour:minute, today if still ahead, otherwise tomorrow.
function nextOccurrence(hour: number, minute: number, now: Date): Date {
  const candidate = new Date(now);
  candidate.setHours(hour, minute, 0, 0);
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate;
}

function formatUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// RFC 5545 §3.3.11: escape backslash, semicolon, comma and newline in TEXT values.
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function buildReminderPlan(params: ReminderPlanParams): ReminderPlan {
  const { hour, minute, cadence, title, description, uid, durationMinutes = 15 } = params;
  const now = params.now ?? new Date();
  const start = nextOccurrence(hour, minute, now);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const rrule = rruleForCadence(cadence);
  const dtStart = formatUtc(start);
  const dtEnd = formatUtc(end);
  const dtStamp = formatUtc(now);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//1x1 Trainer//Reminder//DE',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `RRULE:${rrule}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const googleCalendarUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${dtStart}/${dtEnd}` +
    `&details=${encodeURIComponent(description)}` +
    `&recur=${encodeURIComponent(`RRULE:${rrule}`)}`;

  return { icsContent, googleCalendarUrl };
}
