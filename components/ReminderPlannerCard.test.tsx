import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { ReminderPlannerCard } from './ReminderPlannerCard';
import { getThemeColors } from '../utils/theme';

const t = {
  reminderTitle: 'ÜBUNGSERINNERUNG',
  reminderSubtitle: 'Erstellt einen wiederkehrenden Kalendereintrag.',
  reminderTimeLabel: 'Uhrzeit',
  reminderCadenceLabel: 'Wie oft?',
  reminderCadenceDaily: 'Täglich',
  reminderCadenceEveryTwoDays: 'Alle 2 Tage',
  reminderCadenceWeekend: 'Nur am Wochenende',
  reminderCreateButton: 'Kalendereintrag erstellen',
  reminderEventTitle: 'Übe dein 1×1!',
  reminderEventDescription: 'Eine kurze Runde 1x1 Trainer genügt.',
};

describe('ReminderPlannerCard', () => {
  beforeEach(() => {
    // jsdom has no Blob URL support; the web download path only needs the call to succeed.
    window.URL.createObjectURL = jest.fn(() => 'blob:mock'); // platform-safe
    window.URL.revokeObjectURL = jest.fn(); // platform-safe
  });

  it('renders time presets and cadence options', () => {
    const colors = getThemeColors(false);
    const { getByText } = render(
      <ReminderPlannerCard colors={colors} profileId="profile-1" t={t} />
    );

    expect(getByText('18:00')).toBeTruthy();
    expect(getByText(t.reminderCadenceDaily)).toBeTruthy();
    expect(getByText(t.reminderCadenceEveryTwoDays)).toBeTruthy();
    expect(getByText(t.reminderCadenceWeekend)).toBeTruthy();
    expect(getByText(t.reminderCreateButton)).toBeTruthy();
  });

  it('lets a parent pick a different time and cadence before creating the entry', () => {
    const colors = getThemeColors(false);
    const { getByText } = render(
      <ReminderPlannerCard colors={colors} profileId="profile-1" t={t} />
    );

    fireEvent.click(getByText('20:00'));
    fireEvent.click(getByText(t.reminderCadenceWeekend));

    // Web download path runs synchronously without throwing.
    expect(() => fireEvent.click(getByText(t.reminderCreateButton))).not.toThrow();
  });
});
