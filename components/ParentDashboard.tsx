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
import {
  ThemeColors,
  SessionRecord,
  Operation,
  DifficultyMode,
  StreakData,
  TaskStat,
} from '../types/game';
import {
  getSessionRecords,
  getStreakData,
  getTaskStats,
  getWeakTasks,
  FOUR_WEEKS_MS,
} from '../utils/storage';
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
    parentCurrentStreak: string;
    parentLongestStreak: string;
    parentStreakDays: string;
    parentWeakTasks: string;
    parentWeakTasksEmpty: string;
    chartSessions: string;
    chartErrorRate: string;
    ok: string;
  };
}

interface DayChartData {
  label: string;
  sessions: number;
  avgErrorRate: number | null;
}

function getLast14Days(records: SessionRecord[]): DayChartData[] {
  const result: DayChartData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 13; i >= 0; i--) {
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const dayRecords = records.filter(
      (r) => r.timestamp >= dayStart.getTime() && r.timestamp < dayEnd.getTime()
    );

    result.push({
      label: dayStart.getDate().toString(),
      sessions: dayRecords.length,
      avgErrorRate:
        dayRecords.length > 0
          ? dayRecords.reduce((s, r) => s + r.errorRate, 0) / dayRecords.length
          : null,
    });
  }

  return result;
}

function MiniBarChart({
  data,
  valueKey,
  maxValue,
  getBarColor,
  colors,
}: {
  data: DayChartData[];
  valueKey: 'sessions' | 'errorRate';
  maxValue: number;
  getBarColor: (d: DayChartData) => string;
  colors: ThemeColors;
}) {
  const BAR_H = 44;

  return (
    <View>
      <View style={{ flexDirection: 'row', height: BAR_H, alignItems: 'flex-end' }}>
        {data.map((d, i) => {
          const raw =
            valueKey === 'sessions'
              ? d.sessions
              : d.avgErrorRate !== null
                ? d.avgErrorRate * 100
                : 0;
          const hasData = valueKey === 'sessions' ? d.sessions > 0 : d.avgErrorRate !== null;
          const barH = maxValue > 0 ? Math.round((raw / maxValue) * BAR_H) : 0;

          return (
            <View
              key={i}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: BAR_H }}
            >
              <View
                style={{
                  width: '60%',
                  height: hasData ? (barH > 0 ? Math.max(3, barH) : 2) : 0,
                  backgroundColor: hasData ? getBarColor(d) : 'transparent',
                  borderRadius: 3,
                }}
              />
            </View>
          );
        })}
      </View>
      {/* X-axis labels: show 1st, middle (7th), last (14th) */}
      <View style={{ flexDirection: 'row', marginTop: 3 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            {(i === 0 || i === 6 || i === 13) && (
              <Text style={[chartStyles.axisLabel, { color: colors.textSecondary }]}>
                {d.label}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  axisLabel: {
    fontSize: 9,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
});

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
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    lastPlayedDate: '',
    longestStreak: 0,
  });
  const [weakTasks, setWeakTasks] = useState<TaskStat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      Promise.all([getSessionRecords(), getStreakData(), getTaskStats()]).then(
        ([data, streakData, stats]) => {
          setRecords(data);
          setStreak(streakData);
          setWeakTasks(getWeakTasks(stats).slice(0, 5));
          setLoading(false);
        }
      );
    }
  }, [visible]);

  const grouped = groupByDay(records);
  const chartData = getLast14Days(records);
  const hasChartData = chartData.some((d) => d.sessions > 0);
  const maxSessions = Math.max(1, ...chartData.map((d) => d.sessions));

  const recentRecords = records.filter((r) => Date.now() - r.timestamp < FOUR_WEEKS_MS);
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
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t.parentDashboardSubtitle}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Summary bar */}
          {(records.length > 0 || streak.currentStreak > 0 || streak.longestStreak > 0) && (
            <View style={[styles.summaryBar, { borderColor: colors.border }]}>
              {records.length > 0 && (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {recentRecords.length}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t.parentSessions}
                  </Text>
                </View>
              )}
              {records.length > 0 && avgErrorRate !== null && (
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              )}
              {avgErrorRate !== null && (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: errorRateColor(avgErrorRate) }]}>
                    {Math.round(avgErrorRate * 100)}%
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t.parentAvgError}
                  </Text>
                </View>
              )}
              {streak.currentStreak > 0 && records.length > 0 && (
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              )}
              {streak.currentStreak > 0 && (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
                    🔥 {streak.currentStreak}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t.parentCurrentStreak}
                  </Text>
                </View>
              )}
              {streak.longestStreak > 0 && (records.length > 0 || streak.currentStreak > 0) && (
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              )}
              {streak.longestStreak > 0 && (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {streak.longestStreak}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t.parentLongestStreak}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Content */}
          {loading ? (
            <ActivityIndicator style={styles.loader} color={colors.gradientPrimary[0]} />
          ) : records.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t.parentNoData}
            </Text>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {/* Charts */}
              {hasChartData && (
                <View style={[styles.chartsSection, { borderColor: colors.border }]}>
                  <Text style={[styles.chartTitle, { color: colors.textSecondary }]}>
                    {t.chartSessions}
                  </Text>
                  <MiniBarChart
                    data={chartData}
                    valueKey="sessions"
                    maxValue={maxSessions}
                    getBarColor={() => colors.gradientPrimary[0]}
                    colors={colors}
                  />
                  <Text
                    style={[
                      styles.chartTitle,
                      styles.chartTitleSpaced,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t.chartErrorRate}
                  </Text>
                  <MiniBarChart
                    data={chartData}
                    valueKey="errorRate"
                    maxValue={100}
                    getBarColor={(d) =>
                      d.avgErrorRate !== null ? errorRateColor(d.avgErrorRate) : 'transparent'
                    }
                    colors={colors}
                  />
                </View>
              )}

              {/* Weak tasks */}
              {weakTasks.length > 0 && (
                <View style={[styles.weakSection, { borderColor: colors.border }]}>
                  <Text style={[styles.weakTitle, { color: colors.textSecondary }]}>
                    {t.parentWeakTasks}
                  </Text>
                  {weakTasks.map((s, i) => {
                    const total = s.correctCount + s.errorCount;
                    const rate = total > 0 ? s.errorCount / total : 0;
                    return (
                      <View key={`${s.num1}-${s.num2}-${s.operation}-${i}`} style={styles.weakRow}>
                        <Text style={[styles.weakTask, { color: colors.text }]}>
                          {s.num1} {OP_SYMBOL[s.operation]} {s.num2}
                        </Text>
                        <View
                          style={[
                            styles.errorBadge,
                            { backgroundColor: errorRateColor(rate) + '22' },
                          ]}
                        >
                          <Text style={[styles.errorBadgeText, { color: errorRateColor(rate) }]}>
                            {Math.round(rate * 100)}%
                          </Text>
                        </View>
                        <Text style={[styles.weakAttempts, { color: colors.textSecondary }]}>
                          {total}×
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Session log */}
              {grouped.map(({ label, entries }) => (
                <View key={label}>
                  <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                    {getDayLabel(label)}
                  </Text>
                  {entries.map((r) => (
                    <View key={r.id} style={[styles.row, { borderColor: colors.border }]}>
                      <Text style={[styles.rowTime, { color: colors.textSecondary }]}>
                        {formatTime(r.timestamp)}
                      </Text>
                      <Text style={[styles.rowOps, { color: colors.text }]}>
                        {r.operations.map((op) => OP_SYMBOL[op]).join(' ')}
                      </Text>
                      <Text style={[styles.rowScore, { color: colors.text }]}>
                        {r.correctTasks}/{r.totalTasks}
                      </Text>
                      <View
                        style={[
                          styles.errorBadge,
                          { backgroundColor: errorRateColor(r.errorRate) + '22' },
                        ]}
                      >
                        <Text
                          style={[styles.errorBadgeText, { color: errorRateColor(r.errorRate) }]}
                        >
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

          {/* Close button */}
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.gradientPrimary[0] }]}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>{t.ok}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    width: '90%',
    maxWidth: 420,
    maxHeight: '88%',
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
    flex: 1,
    marginBottom: 12,
  },
  chartsSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 10,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chartTitleSpaced: {
    marginTop: 14,
  },
  weakSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  weakTitle: {
    fontSize: 10,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  weakEmpty: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    fontStyle: 'italic',
  },
  weakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  weakTask: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_NUMBER,
    flex: 1,
  },
  weakAttempts: {
    fontSize: 11,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    minWidth: 28,
    textAlign: 'right',
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
  closeBtn: {
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
