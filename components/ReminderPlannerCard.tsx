import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Linking } from 'react-native';
import { ThemeColors } from '../types/game';
import { DESIGN_TOKENS } from '../utils/constants';
import { buildReminderPlan, ReminderCadence } from '../utils/calendarReminder';
import { Chip } from './Chip';

const TIME_PRESETS = [16, 17, 18, 19, 20];
const CADENCES: ReminderCadence[] = ['daily', 'everyTwoDays', 'weekend'];

interface ReminderPlannerCardProps {
  colors: ThemeColors;
  // Deliberately the profile's creation timestamp, not its id: the id is
  // generated with Math.random() (utils/storage.ts#generateId), which
  // CodeQL flags as insecure randomness once it reaches an identifier used
  // in a shareable calendar entry. createdAt is equally stable per profile
  // without that flow.
  profileCreatedAt?: string;
  t: {
    reminderTitle: string;
    reminderSubtitle: string;
    reminderTimeLabel: string;
    reminderCadenceLabel: string;
    reminderCadenceDaily: string;
    reminderCadenceEveryTwoDays: string;
    reminderCadenceWeekend: string;
    reminderCreateButton: string;
    reminderEventTitle: string;
    reminderEventDescription: string;
  };
}

function downloadIcs(icsContent: string) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob); // platform-safe
  const link = document.createElement('a');
  link.href = url;
  link.download = '1x1-trainer-erinnerung.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url); // platform-safe
}

export function ReminderPlannerCard({ colors, profileCreatedAt, t }: ReminderPlannerCardProps) {
  const [hour, setHour] = useState(18);
  const [cadence, setCadence] = useState<ReminderCadence>('daily');

  const cadenceLabel: Record<ReminderCadence, string> = {
    daily: t.reminderCadenceDaily,
    everyTwoDays: t.reminderCadenceEveryTwoDays,
    weekend: t.reminderCadenceWeekend,
  };

  const handleCreate = () => {
    const plan = buildReminderPlan({
      hour,
      minute: 0,
      cadence,
      title: t.reminderEventTitle,
      description: t.reminderEventDescription,
      uid: `1x1trainer-reminder-${profileCreatedAt ?? 'default'}@1x1trainer`,
    });

    if (Platform.OS === 'web') {
      downloadIcs(plan.icsContent);
    } else {
      Linking.openURL(plan.googleCalendarUrl).catch(() => {});
    }
  };

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{t.reminderTitle}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t.reminderSubtitle}</Text>

      <Text style={[styles.label, { color: colors.text }]}>{t.reminderTimeLabel}</Text>
      <View style={styles.row}>
        {TIME_PRESETS.map((h) => (
          <Chip
            key={h}
            label={`${h.toString().padStart(2, '0')}:00`}
            active={hour === h}
            onPress={() => setHour(h)}
            colors={colors}
            size="sm"
          />
        ))}
      </View>

      <Text style={[styles.label, styles.labelSpaced, { color: colors.text }]}>
        {t.reminderCadenceLabel}
      </Text>
      <View style={styles.row}>
        {CADENCES.map((c) => (
          <Chip
            key={c}
            label={cadenceLabel[c]}
            active={cadence === c}
            onPress={() => setCadence(c)}
            colors={colors}
            size="sm"
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.gradientPrimary[0] }]}
        onPress={handleCreate}
      >
        <Text style={styles.createButtonText}>{t.reminderCreateButton}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  title: {
    fontSize: 10,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    marginBottom: 6,
  },
  labelSpaced: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  createButton: {
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
});
