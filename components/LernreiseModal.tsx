import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemeColors, Operation, RowMastery, RowMasteryStatus } from '../types/game';
import { TOTAL_TASKS, DESIGN_TOKENS } from '../utils/constants';
import {
  getRowMastery,
  isRowUnlocked,
  recordRowTestResult,
  recordTaskResult,
  statusForRowScore,
} from '../utils/storage';
import { modalStyles } from '../styles/modalStyles';
import { Numpad } from './Numpad';
import { ProgressBar } from './ProgressBar';

interface LernreiseModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  profileId?: string;
  t: {
    lernreiseTitle: string;
    lernreiseSubtitle: string;
    lernreiseRowLabel: string;
    lernreiseResultScore: string;
    lernreiseResultGold: string;
    lernreiseResultSilver: string;
    lernreiseResultBronze: string;
    lernreiseResultRetry: string;
    lernreiseBackToMap: string;
    check: string;
    nextQuestion: string;
    ok: string;
  };
}

type ViewState = 'map' | 'test' | 'result';

const STATUS_EMOJI: Record<RowMasteryStatus, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
};

function shuffledFactors(): number[] {
  const factors = Array.from({ length: 10 }, (_, i) => i + 1);
  for (let i = factors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [factors[i], factors[j]] = [factors[j], factors[i]];
  }
  return factors;
}

export function LernreiseModal({ visible, onClose, colors, profileId, t }: LernreiseModalProps) {
  const [mastery, setMastery] = useState<RowMastery[]>([]);
  const [view, setView] = useState<ViewState>('map');
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [factors, setFactors] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [answerHistory, setAnswerHistory] = useState<(boolean | null)[]>([]);

  useEffect(() => {
    if (visible) {
      getRowMastery(profileId).then(setMastery);
      setView('map');
    }
  }, [visible, profileId]);

  const startTest = (row: number) => {
    setActiveRow(row);
    setFactors(shuffledFactors());
    setCurrentIndex(0);
    setUserAnswer('');
    setIsAnswerChecked(false);
    setScore(0);
    setAnswerHistory(Array(TOTAL_TASKS).fill(null));
    setView('test');
  };

  const handleNumberClick = (num: number) => {
    if (isAnswerChecked) return;
    if (num === -1) {
      setUserAnswer((prev) => prev.slice(0, -1));
    } else {
      setUserAnswer((prev) => prev + num.toString());
    }
  };

  const handleCheck = () => {
    if (userAnswer === '' || activeRow === null) return;
    const num2 = factors[currentIndex];
    const isCorrect = parseInt(userAnswer, 10) === activeRow * num2;
    recordTaskResult(activeRow, num2, Operation.MULTIPLICATION, isCorrect, profileId);
    setScore((prev) => (isCorrect ? prev + 1 : prev));
    setIsAnswerChecked(true);
    setAnswerHistory((prev) => {
      const next = [...prev];
      next[currentIndex] = isCorrect;
      return next;
    });
  };

  const handleNext = () => {
    if (activeRow === null) return;
    if (currentIndex + 1 >= TOTAL_TASKS) {
      recordRowTestResult(activeRow, score, TOTAL_TASKS, profileId).then((updated) => {
        setMastery(updated);
        setView('result');
      });
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setUserAnswer('');
    setIsAnswerChecked(false);
  };

  const roundStatus = view === 'result' ? statusForRowScore(score, TOTAL_TASKS) : null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.settingsMenu }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>{t.lernreiseTitle}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t.lernreiseSubtitle}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {view === 'map' && (
            <ScrollView style={styles.mapScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.mapGrid}>
                {mastery.map((m) => {
                  const unlocked = isRowUnlocked(mastery, m.row);
                  const icon = !unlocked ? '🔒' : m.status ? STATUS_EMOJI[m.status] : '▶';
                  return (
                    <TouchableOpacity
                      key={m.row}
                      disabled={!unlocked}
                      onPress={() => startTest(m.row)}
                      style={[
                        styles.rowNode,
                        { borderColor: colors.border, backgroundColor: colors.card },
                        !unlocked && styles.rowNodeLocked,
                      ]}
                    >
                      <Text style={styles.rowNodeIcon}>{icon}</Text>
                      <Text
                        style={[
                          styles.rowNodeLabel,
                          { color: unlocked ? colors.text : colors.textSecondary },
                        ]}
                      >
                        {t.lernreiseRowLabel.replace('{row}', m.row.toString())}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}

          {view === 'test' && activeRow !== null && (
            <View style={styles.testContainer}>
              <Text style={[styles.testRowLabel, { color: colors.textSecondary }]}>
                {t.lernreiseRowLabel.replace('{row}', activeRow.toString())}
              </Text>
              <ProgressBar history={answerHistory} />
              <View style={styles.questionRow}>
                <Text style={[styles.questionText, { color: colors.text }]}>
                  {activeRow} × {factors[currentIndex]} =
                </Text>
                <View style={[styles.answerBox, { backgroundColor: colors.buttonInactive }]}>
                  <Text style={[styles.answerText, { color: colors.text }]}>
                    {userAnswer || '?'}
                  </Text>
                </View>
              </View>
              <Numpad
                onNumberClick={handleNumberClick}
                onCheck={isAnswerChecked ? handleNext : handleCheck}
                userAnswer={userAnswer}
                isAnswerChecked={isAnswerChecked}
                checkLabel={t.check}
                nextLabel={t.nextQuestion}
                gradientPrimary={colors.gradientPrimary}
              />
            </View>
          )}

          {view === 'result' && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultEmoji}>
                {roundStatus ? STATUS_EMOJI[roundStatus] : '💪'}
              </Text>
              <Text style={[styles.resultScore, { color: colors.text }]}>
                {t.lernreiseResultScore.replace('{score}', score.toString())}
              </Text>
              <Text style={[styles.resultMessage, { color: colors.textSecondary }]}>
                {roundStatus === 'gold'
                  ? t.lernreiseResultGold
                  : roundStatus === 'silver'
                    ? t.lernreiseResultSilver
                    : roundStatus === 'bronze'
                      ? t.lernreiseResultBronze
                      : t.lernreiseResultRetry}
              </Text>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.gradientPrimary[0] }]}
                onPress={() => setView('map')}
              >
                <Text style={styles.closeBtnText}>{t.lernreiseBackToMap}</Text>
              </TouchableOpacity>
            </View>
          )}

          {view === 'map' && (
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.gradientPrimary[0] }]}
              onPress={onClose}
            >
              <Text style={styles.closeBtnText}>{t.ok}</Text>
            </TouchableOpacity>
          )}
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
  mapScroll: {
    maxHeight: 440,
    marginBottom: 12,
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rowNode: {
    width: '31%',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  rowNodeLocked: {
    opacity: 0.5,
  },
  rowNodeIcon: {
    fontSize: 24,
  },
  rowNodeLabel: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  testContainer: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  testRowLabel: {
    fontSize: 13,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionText: {
    fontSize: 32,
    fontFamily: DESIGN_TOKENS.FONT_NUMBER,
  },
  answerBox: {
    minWidth: 72,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  answerText: {
    fontSize: 26,
    fontFamily: DESIGN_TOKENS.FONT_NUMBER,
  },
  resultContainer: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 24,
  },
  resultEmoji: {
    fontSize: 56,
  },
  resultScore: {
    fontSize: 20,
    fontFamily: DESIGN_TOKENS.FONT_NUMBER,
  },
  resultMessage: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    marginBottom: 8,
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
