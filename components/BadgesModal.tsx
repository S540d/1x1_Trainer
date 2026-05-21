import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { ThemeColors, Language } from '../types/game';
import { BADGE_DEFINITIONS, BadgeCategory, DESIGN_TOKENS } from '../utils/constants';
import { BadgeStore } from '../utils/storage';
import { modalStyles } from '../styles/modalStyles';

interface BadgesModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  badges: BadgeStore;
  language: Language;
  t: {
    badges: string;
    badgesSubtitle: string;
    badgeLocked: string;
    badgeUnlockedOn: string;
    badgeCategoryStreak: string;
    badgeCategoryPerformance: string;
    badgeCategoryChallenge: string;
    badgeCategoryExplorer: string;
    badgeStreak3Name: string;
    badgeStreak7Name: string;
    badgeStreak30Name: string;
    badgePerfect1Name: string;
    badgePerfect5Name: string;
    badgeAllOpsName: string;
    badgeChallengeLevel3Name: string;
    badgeChallengeLevel6Name: string;
    badgeChallengeNoErrorsName: string;
    badgeRange100Name: string;
    badgeCreativeModeName: string;
    badgeStreak3Desc: string;
    badgeStreak7Desc: string;
    badgeStreak30Desc: string;
    badgePerfect1Desc: string;
    badgePerfect5Desc: string;
    badgeAllOpsDesc: string;
    badgeChallengeLevel3Desc: string;
    badgeChallengeLevel6Desc: string;
    badgeChallengeNoErrorsDesc: string;
    badgeRange100Desc: string;
    badgeCreativeModeDesc: string;
    ok: string;
  };
}

const CATEGORY_ORDER: BadgeCategory[] = ['streak', 'performance', 'challenge', 'explorer'];

function getBadgeName(id: string, t: BadgesModalProps['t']): string {
  const map: Record<string, string> = {
    streak_3: t.badgeStreak3Name,
    streak_7: t.badgeStreak7Name,
    streak_30: t.badgeStreak30Name,
    perfect_1: t.badgePerfect1Name,
    perfect_5: t.badgePerfect5Name,
    all_operations: t.badgeAllOpsName,
    challenge_level_3: t.badgeChallengeLevel3Name,
    challenge_level_6: t.badgeChallengeLevel6Name,
    challenge_no_errors: t.badgeChallengeNoErrorsName,
    range_100: t.badgeRange100Name,
    creative_mode: t.badgeCreativeModeName,
  };
  return map[id] ?? id;
}

function getBadgeDesc(id: string, t: BadgesModalProps['t']): string {
  const map: Record<string, string> = {
    streak_3: t.badgeStreak3Desc,
    streak_7: t.badgeStreak7Desc,
    streak_30: t.badgeStreak30Desc,
    perfect_1: t.badgePerfect1Desc,
    perfect_5: t.badgePerfect5Desc,
    all_operations: t.badgeAllOpsDesc,
    challenge_level_3: t.badgeChallengeLevel3Desc,
    challenge_level_6: t.badgeChallengeLevel6Desc,
    challenge_no_errors: t.badgeChallengeNoErrorsDesc,
    range_100: t.badgeRange100Desc,
    creative_mode: t.badgeCreativeModeDesc,
  };
  return map[id] ?? '';
}

function getCategoryLabel(cat: BadgeCategory, t: BadgesModalProps['t']): string {
  const map: Record<BadgeCategory, string> = {
    streak: t.badgeCategoryStreak,
    performance: t.badgeCategoryPerformance,
    challenge: t.badgeCategoryChallenge,
    explorer: t.badgeCategoryExplorer,
  };
  return map[cat];
}

function formatUnlockDate(ts: number, language: Language): string {
  try {
    return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(ts));
  } catch {
    const d = new Date(ts);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  }
}

export function BadgesModal({ visible, onClose, colors, badges, language, t }: BadgesModalProps) {
  const unlockedCount = Object.keys(badges).length;
  const totalCount = BADGE_DEFINITIONS.length;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.settingsMenu }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>{t.badges}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {unlockedCount}/{totalCount} · {t.badgesSubtitle}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Badge grid by category */}
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {CATEGORY_ORDER.map(cat => {
              const defs = BADGE_DEFINITIONS.filter(b => b.category === cat);
              return (
                <View key={cat} style={styles.categorySection}>
                  <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                    {getCategoryLabel(cat, t).toUpperCase()}
                  </Text>
                  <View style={styles.grid}>
                    {defs.map(def => {
                      const unlockedAt = badges[def.id];
                      const isUnlocked = Boolean(unlockedAt);
                      return (
                        <View
                          key={def.id}
                          style={[
                            styles.badgeCard,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            isUnlocked && styles.badgeCardUnlocked,
                          ]}
                        >
                          <Text style={[styles.badgeIcon, !isUnlocked && styles.badgeIconLocked]}>
                            {isUnlocked ? def.icon : '🔒'}
                          </Text>
                          <Text
                            style={[
                              styles.badgeName,
                              { color: isUnlocked ? colors.text : colors.textSecondary },
                            ]}
                            numberOfLines={2}
                          >
                            {getBadgeName(def.id, t)}
                          </Text>
                          <Text
                            style={[styles.badgeDesc, { color: colors.textSecondary }]}
                            numberOfLines={2}
                          >
                            {getBadgeDesc(def.id, t)}
                          </Text>
                          {isUnlocked && (
                            <Text style={styles.unlockedDate}>
                              {t.badgeUnlockedOn} {formatUnlockDate(unlockedAt, language)}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>

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
    width: '92%',
    maxWidth: 440,
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
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: DESIGN_TOKENS.FONT_UI,
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
  scroll: {
    maxHeight: 440,
    marginBottom: 12,
  },
  categorySection: {
    marginBottom: 14,
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeCard: {
    width: '48%',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    opacity: 0.5,
  },
  badgeCardUnlocked: {
    opacity: 1,
    borderColor: ACTIVE_COLOR + '55',
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  badgeIconLocked: {
    opacity: 0.4,
  },
  badgeName: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 10,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    lineHeight: 14,
  },
  unlockedDate: {
    fontSize: 9,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: ACTIVE_COLOR,
    marginTop: 4,
    textAlign: 'center',
  },
  closeBtn: {
    backgroundColor: ACTIVE_COLOR,
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
});
