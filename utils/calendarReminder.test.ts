import { buildReminderPlan } from './calendarReminder';

describe('buildReminderPlan', () => {
  const baseParams = {
    hour: 18,
    minute: 0,
    title: 'Übe dein 1x1!',
    description: 'Eine Runde 1x1 Trainer genügt.',
    uid: 'reminder-profile-123',
  };

  it('schedules the next occurrence today when the time is still ahead', () => {
    const now = new Date('2026-09-16T10:00:00');
    const plan = buildReminderPlan({ ...baseParams, cadence: 'daily', now });

    const dtStartLine = plan.icsContent.split('\r\n').find((l) => l.startsWith('DTSTART:'));
    const localStart = new Date(now);
    localStart.setHours(18, 0, 0, 0);
    const expectedUtc = localStart.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    expect(dtStartLine).toBe(`DTSTART:${expectedUtc}`);
    expect(plan.icsContent).toContain('RRULE:FREQ=DAILY');
    expect(plan.icsContent).toContain('UID:reminder-profile-123');
  });

  it('schedules for tomorrow when the time has already passed today', () => {
    const now = new Date('2026-09-16T19:00:00');
    const plan = buildReminderPlan({ ...baseParams, cadence: 'daily', now });

    const dtStartLine = plan.icsContent.split('\r\n').find((l) => l.startsWith('DTSTART:'));
    expect(dtStartLine).toBeDefined();
    // Local 18:00 the next day, regardless of the runner's timezone offset from UTC.
    const localStart = new Date(now);
    localStart.setDate(localStart.getDate() + 1);
    localStart.setHours(18, 0, 0, 0);
    const expectedUtc = localStart.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    expect(dtStartLine).toBe(`DTSTART:${expectedUtc}`);
  });

  it('maps cadence to the correct RRULE', () => {
    const now = new Date('2026-09-16T10:00:00');
    expect(buildReminderPlan({ ...baseParams, cadence: 'everyTwoDays', now }).icsContent).toContain(
      'RRULE:FREQ=DAILY;INTERVAL=2'
    );
    expect(buildReminderPlan({ ...baseParams, cadence: 'weekend', now }).icsContent).toContain(
      'RRULE:FREQ=WEEKLY;BYDAY=SA,SU'
    );
  });

  it('escapes commas, semicolons and newlines in text fields', () => {
    const now = new Date('2026-09-16T10:00:00');
    const plan = buildReminderPlan({
      ...baseParams,
      cadence: 'daily',
      title: 'Übung, Spaß; los!',
      now,
    });

    expect(plan.icsContent).toContain('SUMMARY:Übung\\, Spaß\\; los!');
  });

  it('builds a Google Calendar quick-add URL with the same recurrence rule', () => {
    const now = new Date('2026-09-16T10:00:00');
    const plan = buildReminderPlan({ ...baseParams, cadence: 'weekend', now });

    expect(plan.googleCalendarUrl).toContain('https://calendar.google.com/calendar/render');
    expect(plan.googleCalendarUrl).toContain('action=TEMPLATE');
    expect(plan.googleCalendarUrl).toContain(encodeURIComponent('RRULE:FREQ=WEEKLY;BYDAY=SA,SU'));
    expect(plan.googleCalendarUrl).toContain(`text=${encodeURIComponent(baseParams.title)}`);
  });
});
