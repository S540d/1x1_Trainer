import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ThemeColors, SessionRecord, Operation, DifficultyMode, TaskStat } from '../types/game';
import { getSessionRecords, getWeakTasks, FOUR_WEEKS_MS } from '../utils/storage';
import { DESIGN_TOKENS } from '../utils/constants';
import { modalStyles } from '../styles/modalStyles';

const OP_SYMBOL: Record<Operation, string> = {
  [Operation.ADDITION]: '+',
  [Operation.SUBTRACTION]: '−',
  [Operation.MULTIPLICATION]: '×',
  [Operation.DIVISION]: '÷',
};

interface ParentDashboardProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  t: {
    parentDashboard: string;
    parentDashboardSubtitle: string;
    parentNoData: string;
    parentSessions: string;
    parentAvgError: string;
    parentToday: string;
    parentYesterday: string;
    parentCorrect: string;
    parentErrors: string;
    parentWeakTasksTitle: string;
    parentWeakTasksEmpty: string;
    ok: string;
  };
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

function isSameDay(ts: number, reference: Date): boolean {
  const d = new Date(ts);
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth() &&
    d.getDate() === reference.getDate()
  );
}

function groupByDay(records: SessionRecord[]): { label: string; entries: SessionRecord[] }[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const map = new Map<string, SessionRecord[]>();

  for (const r of [...records].sort((a, b) => b.timestamp - a.timestamp)) {
    let key: string;
    if (isSameDay(r.timestamp, today)) {
      key = '__today__';
    } else if (isSameDay(r.timestamp, yesterday)) {
      key = '__yesterday__';
    } else {
      key = formatDate(r.timestamp);
    }
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }

  return Array.from(map.entries()).map(([label, entries]) => ({ label, entries }));
}

function errorRateColor(rate: number): string {
  if (rate <= 0.1) return '#10B981';
  if (rate <= 0.3) return '#F59E0B';
  return '#EF4444';
}

export function ParentDashboard({ visible, onClose, colors, t }: ParentDashboardProps) {
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [weakTasks, setWeakTasks] = useState<TaskStat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      Promise.all([getSessionRecords(), getWeakTasks()]).then(([data, weak]) => {
        setRecords(data);
        setWeakTasks(weak.slice(0, 5));
        setLoading(false);
      });
    }
  }, [visible]);

  const grouped = groupByDay(records);

  const recentRecords = records.filter(r => Date.now() - r.timestamp < FOUR_WEEKS_MS);
  const avgErrorRate =
    recentRecords.length > 0
      ? recentRecords.reduce((sum, r) => sum + r.errorRate, 0) / recentRecords.length
      : null;

  const getDayLabel = (key: string) => {
    if (key === '__today__') return t.parentToday;
    if (key === '__yesterday__') return t.parentYesterday;
    return key;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.settingsMenu }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: colors.text }]}>{t.parentDashboard}</Text>
                <View style={styles.betaBadge}>
                  <Text style={styles.betaText}>BETA</Text>
                </View>
              </View>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t.parentDashboardSubtitle}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Summary bar */}
          {records.length > 0 && (
            <View style={[styles.summaryBar, { borderColor: colors.border }]}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{recentRecords.length}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t.parentSessions}</Text>
              </View>
              {avgErrorRate !== null && (
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              )}
              {avgErrorRate !== null && (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: errorRateColor(avgErrorRate) }]}>
                    {Math.round(avgErrorRate * 100)}%
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t.parentAvgError}</Text>
                </View>
              )}
            </View>
          )}

          {/* Content */}
          {loading ? (
            <ActivityIndicator style={styles.loader} color={DESIGN_TOKENS.GRADIENT_PRIMARY[0]} />
          ) : records.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t.parentNoData}</Text>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {grouped.map(({ label, entries }) => (
                <View key={label}>
                  <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>{getDayLabel(label)}</Text>
                  {entries.map((r) => (
                    <View key={r.id} style={[styles.row, { borderColor: colors.border }]}>
                      <Text style={[styles.rowTime, { color: colors.textSecondary }]}>{formatTime(r.timestamp)}</Text>
                      <Text style={[styles.rowOps, { color: colors.text }]}>
                        {r.operations.map(op => OP_SYMBOL[op]).join(' ')}
                      </Text>
                      <Text style={[styles.rowScore, { color: colors.text }]}>
                        {r.correctTasks}/{r.totalTasks}
                      </Text>
                      <View style={[styles.errorBadge, { backgroundColor: errorRateColor(r.errorRate) + '22' }]}>
                        <Text style={[styles.errorBadgeText, { color: errorRateColor(r.errorRate) }]}>
                          {Math.round(r.errorRate * 100)}%
                        </Text>
                      </View>
                      {r.difficultyMode === DifficultyMode.CHALLENGE && (
                        <Text style={styles.challengeBadge}>⚡</Text>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}

          {/* Weak tasks section */}
          {!loading && (
            <View style={[styles.weakSection, { borderColor: colors.border }]}>
              <Text style={[styles.weakTitle, { color: colors.text }]}>{t.parentWeakTasksTitle}</Text>
              {weakTasks.length === 0 ? (
                <Text style={[styles.weakEmpty, { color: colors.textSecondary }]}>{t.parentWeakTasksEmpty}</Text>
              ) : (
                weakTasks.map((s, i) => {
                  const total = s.correctCount + s.errorCount;
                  const rate = s.errorCount / total;
                  const label = `${s.num1} ${OP_SYMBOL[s.operation]} ${s.num2}`;
                  return (
                    <View key={i} style={styles.weakRow}>
                      <Text style={[styles.weakTask, { color: colors.text }]}>{label}</Text>
                      <View style={[styles.errorBadge, { backgroundColor: errorRateColor(rate) + '22' }]}>
                        <Text style={[styles.errorBadgeText, { color: errorRateColor(rate) }]}>
                          {Math.round(rate * 100)}%
                        </Text>
                      </View>
                      <Text style={[styles.weakAttempts, { color: colors.textSecondary }]}>
                        {s.errorCount}/{total}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>{t.ok}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const ACTIVE_COLOR = DESIGN_TOKENS.GRADIENT_PRIMARY[0];

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    width: '90%',
    maxWidth: 420,
    maxHeight: '85%',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  betaBadge: {
    backgroundColor: '#F59E0B22',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  betaText: {
    fontSize: 10,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  summaryBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryDivider: {
    width: 1,
  },
  summaryValue: {
    fontSize: 22,
    fontFamily: DESIGN_TOKENS.FONT_NUMBER,
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    marginTop: 2,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 32,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    marginVertical: 32,
  },
  list: {
    maxHeight: 340,
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    gap: 8,
  },
  rowTime: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    width: 38,
  },
  rowOps: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_NUMBER,
    flex: 1,
    letterSpacing: 2,
  },
  rowScore: {
    fontSize: 13,
    fontFamily: DESIGN_TOKENS.FONT_NUMBER,
    minWidth: 36,
    textAlign: 'right',
  },
  errorBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    minWidth: 42,
    alignItems: 'center',
  },
  errorBadgeText: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  challengeBadge: {
    fontSize: 13,
  },
  weakSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  weakTitle: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  weakEmpty: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    paddingVertical: 4,
  },
  weakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  weakTask: {
    fontSize: 15,
    fontFamily: DESIGN_TOKENS.FONT_NUMBER,
    flex: 1,
  },
  weakAttempts: {
    fontSize: 11,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    minWidth: 32,
    textAlign: 'right',
  },
  closeBtn: {
    backgroundColor: ACTIVE_COLOR,
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
});
