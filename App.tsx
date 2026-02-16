import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Linking,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Local imports
import { Operation, AnswerMode, DifficultyMode, NumberRange, ThemeColors } from './types/game';
import { translations } from './i18n/translations';
import { APP_VERSION, CHALLENGE_MAX_LIVES } from './utils/constants';
import { useTheme } from './hooks/useTheme';
import { usePreferences } from './hooks/usePreferences';
import { useGameLogic } from './hooks/useGameLogic';
import { PersonalizeModal } from './components/PersonalizeModal';

export default function App() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [personalizeVisible, setPersonalizeVisible] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationScore, setMotivationScore] = useState(0);

  // Use custom hooks
  const preferences = usePreferences();
  const theme = useTheme(preferences.themeMode);
  const game = useGameLogic({
    initialOperation: preferences.operation,
    initialOperations: preferences.operations,
    initialTotalSolvedTasks: preferences.totalSolvedTasks,
    onTotalSolvedTasksChange: preferences.setTotalSolvedTasks,
    onMotivationShow: (score: number) => {
      setMotivationScore(score);
      setShowMotivation(true);
    },
    numberRange: preferences.numberRange,
    challengeHighScore: preferences.challengeHighScore,
    onChallengeHighScoreChange: preferences.setChallengeHighScore,
  });

  const t = translations[preferences.language];
  const { colors, isDarkMode } = theme;

  // Set body background color dynamically on web
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = isDarkMode ? '#0F1419' : '#F0F4FF';
    }
  }, [isDarkMode]);

  // Generate first question on mount
  useEffect(() => {
    if (preferences.isLoaded) {
      game.generateQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.isLoaded]);

  // Sync operation changes to preferences
  useEffect(() => {
    if (preferences.isLoaded && !preferences.operations.includes(game.gameState.operation)) {
      // Update operations array when game operation changes
      const newOps = Array.from(game.gameState.selectedOperations);
      preferences.setOperations(newOps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.gameState.selectedOperations]);

  const getCardColor = () => {
    if (game.gameState.lastAnswerCorrect === true) return colors.cardCorrect;
    if (game.gameState.lastAnswerCorrect === false) return colors.cardIncorrect;
    return colors.card;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {game.gameState.difficultyMode === DifficultyMode.CHALLENGE && game.gameState.challengeState ? (
          <>
            <Text style={[styles.headerScore, { color: colors.text }]}>
              {Array.from({ length: game.gameState.challengeState.lives }, () => '\u2764\uFE0F').join('')}
              {Array.from({ length: CHALLENGE_MAX_LIVES - game.gameState.challengeState.lives }, () => '\uD83E\uDD0D').join('')}
            </Text>
            <Text style={[styles.headerScore, { color: colors.text }]}>
              {t.level} {game.gameState.challengeState.level}
            </Text>
            <Text style={[styles.headerScore, { color: colors.text }]}>
              <Text style={{ fontWeight: 'bold' }}>{game.gameState.score}</Text>
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.headerScore, { color: colors.text }]}>
              {t.task}: {game.gameState.currentTask}/{game.gameState.totalTasks}
            </Text>
            <Text style={[styles.headerScore, { color: colors.text }]}>
              {t.points}: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{game.gameState.score}</Text>
            </Text>
          </>
        )}
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.settingsButton}
          aria-label="Settings"
        >
          <Text style={[styles.settingsButtonText, { color: colors.text }]}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Menu */}
      {menuVisible && (
        <>
          <TouchableOpacity
            style={[styles.settingsOverlay, { backgroundColor: colors.settingsOverlay }]}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />
          <View style={[styles.settingsMenu, { backgroundColor: colors.settingsMenu }]}>
            <View style={[styles.settingsMenuHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.settingsMenuTitle, { color: colors.text }]}>Settings</Text>
              <TouchableOpacity
                style={styles.settingsMenuCloseButton}
                onPress={() => setMenuVisible(false)}
              >
                <Text style={[styles.settingsMenuCloseButtonText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Personalize Button */}
            <View style={styles.settingsSection}>
              <TouchableOpacity
                style={[styles.personalizeButton, { borderColor: colors.border }]}
                onPress={() => {
                  setPersonalizeVisible(true);
                  setMenuVisible(false);
                }}
              >
                <Text style={[styles.personalizeButtonText, { color: colors.text }]}>{t.personalize}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsDivider} />

            {/* Operation Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.operation}</Text>
              <View style={styles.operationGrid}>
                {([
                  { op: Operation.ADDITION, symbol: '+', label: t.addition },
                  { op: Operation.SUBTRACTION, symbol: '−', label: t.subtraction },
                  { op: Operation.MULTIPLICATION, symbol: '×', label: t.multiplication },
                  { op: Operation.DIVISION, symbol: '÷', label: t.division },
                ] as const).map(({ op, symbol, label }) => {
                  const isChallenge = game.gameState.difficultyMode === DifficultyMode.CHALLENGE;
                  const isActive = isChallenge || game.gameState.selectedOperations.has(op);
                  return (
                    <TouchableOpacity
                      key={op}
                      style={[
                        styles.operationButton,
                        { borderColor: colors.border },
                        isActive && styles.operationButtonActive,
                        isChallenge && { opacity: 0.6 },
                      ]}
                      onPress={() => game.toggleOperation(op)}
                      disabled={isChallenge}
                    >
                      <Text
                        style={[
                          styles.operationButtonText,
                          { color: colors.text },
                          isActive && styles.operationButtonTextActive,
                        ]}
                      >
                        {symbol} {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.settingsDivider} />

            {/* Difficulty Mode Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.difficultyMode}</Text>
              <View style={styles.themeToggle}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    { borderColor: colors.border },
                    game.gameState.difficultyMode === DifficultyMode.SIMPLE && styles.themeButtonActive,
                  ]}
                  onPress={() => game.changeDifficultyMode(DifficultyMode.SIMPLE)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      { color: colors.text },
                      game.gameState.difficultyMode === DifficultyMode.SIMPLE && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.simpleMode}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    { borderColor: colors.border },
                    game.gameState.difficultyMode === DifficultyMode.CREATIVE && styles.themeButtonActive,
                  ]}
                  onPress={() => game.changeDifficultyMode(DifficultyMode.CREATIVE)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      { color: colors.text },
                      game.gameState.difficultyMode === DifficultyMode.CREATIVE && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.creativeMode}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    { borderColor: colors.border },
                    game.gameState.difficultyMode === DifficultyMode.CHALLENGE && styles.themeButtonActive,
                  ]}
                  onPress={() => {
                    game.changeDifficultyMode(DifficultyMode.CHALLENGE);
                    setMenuVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      { color: colors.text },
                      game.gameState.difficultyMode === DifficultyMode.CHALLENGE && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.challenge}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.settingsModeInfo, { color: colors.textSecondary }]}>
                {game.gameState.difficultyMode === DifficultyMode.SIMPLE
                  ? t.simpleModeInfo
                  : game.gameState.difficultyMode === DifficultyMode.CREATIVE
                  ? t.creativeModeInfo
                  : t.challengeInfo}
              </Text>
            </View>

            <View style={styles.settingsDivider} />

            {/* Number Range Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.numberRange}</Text>
              <View style={styles.numberRangeGrid}>
                {([
                  { range: NumberRange.RANGE_10, label: t.upTo10 },
                  { range: NumberRange.RANGE_20, label: t.upTo20 },
                  { range: NumberRange.RANGE_50, label: t.upTo50 },
                  { range: NumberRange.RANGE_100, label: t.upTo100 },
                ] as const).map(({ range, label }) => {
                  const isChallengeMode = game.gameState.difficultyMode === DifficultyMode.CHALLENGE;
                  const isActive = isChallengeMode ? range === NumberRange.RANGE_100 : preferences.numberRange === range;
                  return (
                    <TouchableOpacity
                      key={range}
                      style={[
                        styles.rangeButton,
                        { borderColor: colors.border },
                        isActive && styles.rangeButtonActive,
                        isChallengeMode && { opacity: 0.6 },
                      ]}
                      onPress={() => preferences.setNumberRange(range)}
                      disabled={isChallengeMode}
                    >
                      <Text
                        style={[
                          styles.rangeButtonText,
                          { color: colors.text },
                          isActive && styles.rangeButtonTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.settingsDivider} />

            {/* Feedback, Support and About in One Row */}
            <View style={[styles.settingsSection, styles.settingsSectionRow]}>
              <TouchableOpacity
                style={styles.settingsMenuLinkFlex}
                onPress={() => {
                  Linking.openURL('mailto:devsven@posteo.de?subject=1x1 Trainer Feedback');
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.settingsMenuLinkText}>{t.feedback}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsMenuLinkFlex}
                onPress={() => {
                  Linking.openURL('https://ko-fi.com/devsven');
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.settingsMenuLinkText}>{t.support}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsMenuLinkFlex}
                onPress={() => {
                  setAboutVisible(true);
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.settingsMenuLinkText}>{t.about}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      <View style={styles.contentArea}>
        <View style={[styles.questionCard, { backgroundColor: getCardColor() }]}>
          <View style={styles.questionRow}>
            {/* First number or answer box */}
            {game.gameState.questionPart === 0 ? (
              game.gameState.answerMode === AnswerMode.INPUT ? (
                <View style={[styles.answerBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.answerText, { color: colors.text }, game.gameState.userAnswer === '' && styles.answerPlaceholder]}>
                    {game.gameState.userAnswer || '?'}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.questionText, { color: colors.text }]}>?</Text>
              )
            ) : (
              <Text style={[styles.questionText, { color: colors.text }]}>
                {game.gameState.num1}
              </Text>
            )}

            {/* Operator */}
            <Text style={[styles.questionText, { color: colors.text }]}> {game.operatorSymbol} </Text>

            {/* Second number or answer box */}
            {game.gameState.questionPart === 1 ? (
              game.gameState.answerMode === AnswerMode.INPUT ? (
                <View style={[styles.answerBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.answerText, { color: colors.text }, game.gameState.userAnswer === '' && styles.answerPlaceholder]}>
                    {game.gameState.userAnswer || '?'}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.questionText, { color: colors.text }]}>?</Text>
              )
            ) : (
              <Text style={[styles.questionText, { color: colors.text }]}>
                {game.gameState.num2}
              </Text>
            )}

            {/* Equals sign */}
            <Text style={[styles.questionText, { color: colors.text }]}> = </Text>

            {/* Result or answer box */}
            {game.gameState.questionPart === 2 ? (
              game.gameState.answerMode === AnswerMode.INPUT ? (
                <View style={[styles.answerBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.answerText, { color: colors.text }, game.gameState.userAnswer === '' && styles.answerPlaceholder]}>
                    {game.gameState.userAnswer || '?'}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.questionText, { color: colors.text }]}>?</Text>
              )
            ) : (
              <Text style={[styles.questionText, { color: colors.text }]}>
                {game.gameState.operation === Operation.ADDITION
                  ? game.gameState.num1 + game.gameState.num2
                  : game.gameState.operation === Operation.SUBTRACTION
                  ? game.gameState.num1 - game.gameState.num2
                  : game.gameState.operation === Operation.DIVISION
                  ? game.gameState.num1 / game.gameState.num2
                  : game.gameState.num1 * game.gameState.num2}
              </Text>
            )}
          </View>

          {/* Answer Input Area */}
          <View style={styles.answerArea}>
            {game.gameState.answerMode === AnswerMode.INPUT && (
              <Numpad
                onNumberClick={game.handleNumberClick}
                onCheck={game.gameState.isAnswerChecked ? game.nextQuestion : game.checkAnswer}
                userAnswer={game.gameState.userAnswer}
                isAnswerChecked={game.gameState.isAnswerChecked}
                colors={colors}
              />
            )}

            {game.gameState.answerMode === AnswerMode.MULTIPLE_CHOICE && (
              <View style={styles.choicesContainer}>
                {game.multipleChoices.map((choice, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.choiceButton,
                      { borderColor: colors.border },
                      game.gameState.selectedChoice === choice && styles.choiceButtonSelected,
                      game.gameState.isAnswerChecked && choice === game.getCorrectAnswer() && styles.choiceButtonCorrect,
                      game.gameState.isAnswerChecked && game.gameState.selectedChoice === choice && choice !== game.getCorrectAnswer() && styles.choiceButtonIncorrect,
                    ]}
                    onPress={() => game.handleChoiceClick(choice)}
                    disabled={game.gameState.isAnswerChecked}
                  >
                    <Text style={[
                      styles.choiceButtonText,
                      { color: colors.text },
                      game.gameState.selectedChoice === choice && styles.choiceButtonTextSelected,
                    ]}>
                      {choice}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    (game.gameState.selectedChoice === null && !game.gameState.isAnswerChecked) && styles.checkButtonDisabled,
                  ]}
                  onPress={game.gameState.isAnswerChecked ? game.nextQuestion : game.checkAnswer}
                  disabled={game.gameState.selectedChoice === null && !game.gameState.isAnswerChecked}
                >
                  <Text style={styles.checkButtonText}>
                    {game.gameState.isAnswerChecked ? t.nextQuestion : t.check}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {game.gameState.answerMode === AnswerMode.NUMBER_SEQUENCE && (
              <View style={styles.sequenceContainer}>
                <ScrollView style={styles.sequenceScroll}>
                  {game.numberSequence.map((num, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.sequenceButton,
                        { borderColor: colors.border },
                        game.gameState.selectedChoice === num && styles.sequenceButtonSelected,
                        game.gameState.isAnswerChecked && num === game.getCorrectAnswer() && styles.sequenceButtonCorrect,
                        game.gameState.isAnswerChecked && game.gameState.selectedChoice === num && num !== game.getCorrectAnswer() && styles.sequenceButtonIncorrect,
                      ]}
                      onPress={() => game.handleChoiceClick(num)}
                      disabled={game.gameState.isAnswerChecked}
                    >
                      <Text style={[
                        styles.sequenceButtonText,
                        { color: colors.text },
                        game.gameState.selectedChoice === num && styles.sequenceButtonTextSelected,
                      ]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    (game.gameState.selectedChoice === null && !game.gameState.isAnswerChecked) && styles.checkButtonDisabled,
                  ]}
                  onPress={game.gameState.isAnswerChecked ? game.nextQuestion : game.checkAnswer}
                  disabled={game.gameState.selectedChoice === null && !game.gameState.isAnswerChecked}
                >
                  <Text style={styles.checkButtonText}>
                    {game.gameState.isAnswerChecked ? t.nextQuestion : t.check}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      <Modal visible={game.gameState.showResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.settingsMenu }]}>
            {game.gameState.difficultyMode === DifficultyMode.CHALLENGE && game.gameState.challengeState ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t.challengeOver}</Text>
                {game.gameState.challengeState.isNewHighScore && (
                  <Text style={[styles.newHighScoreText, { color: '#F59E0B' }]}>{t.newHighScore}</Text>
                )}
                <Text style={[styles.modalText, { color: colors.text }]}>
                  {t.challengeResult
                    .replace('{level}', String(game.gameState.challengeState.level))
                    .replace('{score}', String(game.gameState.score))}
                </Text>
                {game.gameState.challengeState.highScore > 0 && (
                  <Text style={[styles.highScoreText, { color: colors.textSecondary }]}>
                    {t.highScore}: {game.gameState.challengeState.highScore}
                  </Text>
                )}
                <TouchableOpacity style={styles.restartButton} onPress={game.restartGame}>
                  <Text style={styles.restartButtonText}>{t.tryAgain}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t.great}</Text>
                <Text style={[styles.modalText, { color: colors.text }]}>
                  {t.youSolved} {game.gameState.score} {t.of} {game.gameState.totalTasks} {t.tasksCorrectly}.
                </Text>
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity style={styles.modalButton} onPress={game.restartGame}>
                    <Text style={styles.modalButtonText}>{t.newRound}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButton} onPress={game.continueGame}>
                    <Text style={styles.modalButtonText}>{t.continueGame}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Motivation Modal */}
      <Modal visible={showMotivation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.settingsMenu }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {motivationScore <= 3
                ? t.motivationTitleLowScore
                : motivationScore <= 6
                ? t.motivationTitleMediumScore
                : t.motivationTitleHighScore}
            </Text>
            <Text style={[styles.modalText, { color: colors.text }]}>
              {motivationScore <= 3
                ? t.motivationMessageLowScore
                : motivationScore <= 6
                ? t.motivationMessageMediumScore
                : t.motivationMessageHighScore}
            </Text>
            <TouchableOpacity
              style={styles.restartButton}
              onPress={() => setShowMotivation(false)}
            >
              <Text style={styles.restartButtonText}>{t.motivationButton}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Personalize Modal */}
      <PersonalizeModal
        visible={personalizeVisible}
        onClose={() => setPersonalizeVisible(false)}
        colors={colors}
        language={preferences.language}
        onLanguageChange={preferences.setLanguage}
        themeMode={theme.themeMode}
        onThemeModeChange={preferences.setThemeMode}
      />

      {/* About Modal */}
      <Modal visible={aboutVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.settingsMenu }]}>
            <View style={styles.aboutModalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t.about}</Text>
              <TouchableOpacity
                style={styles.aboutModalCloseButton}
                onPress={() => setAboutVisible(false)}
              >
                <Text style={[styles.aboutModalCloseText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.aboutModalInfoText, { color: colors.text }]}>
              {t.version} {APP_VERSION}
            </Text>
            <Text style={[styles.aboutModalInfoText, { color: colors.textSecondary }]}>
              {t.copyright}
            </Text>
            <Text style={[styles.aboutModalInfoText, { color: colors.textSecondary }]}>
              {t.license}
            </Text>
            <Text style={[styles.aboutModalInfoText, { color: colors.textSecondary }]}>
              {t.contact}
            </Text>
            <TouchableOpacity
              style={styles.restartButton}
              onPress={() => setAboutVisible(false)}
            >
              <Text style={styles.restartButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Numpad({
  onNumberClick,
  onCheck,
  userAnswer,
  isAnswerChecked,
  colors
}: {
  onNumberClick: (num: number) => void;
  onCheck: () => void;
  userAnswer: string;
  isAnswerChecked: boolean;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.numpad}>
      <View style={styles.numpadRow}>
        <NumpadButton text="1" onPress={() => onNumberClick(1)} colors={colors} />
        <NumpadButton text="2" onPress={() => onNumberClick(2)} colors={colors} />
        <NumpadButton text="3" onPress={() => onNumberClick(3)} colors={colors} />
      </View>
      <View style={styles.numpadRow}>
        <NumpadButton text="4" onPress={() => onNumberClick(4)} colors={colors} />
        <NumpadButton text="5" onPress={() => onNumberClick(5)} colors={colors} />
        <NumpadButton text="6" onPress={() => onNumberClick(6)} colors={colors} />
      </View>
      <View style={styles.numpadRow}>
        <NumpadButton text="7" onPress={() => onNumberClick(7)} colors={colors} />
        <NumpadButton text="8" onPress={() => onNumberClick(8)} colors={colors} />
        <NumpadButton text="9" onPress={() => onNumberClick(9)} colors={colors} />
      </View>
      <View style={styles.numpadRow}>
        <NumpadButton text="←" onPress={() => onNumberClick(-1)} isSpecial colors={colors} />
        <NumpadButton text="0" onPress={() => onNumberClick(0)} colors={colors} />
        <TouchableOpacity
          style={[
            styles.numpadButtonCheck,
            userAnswer === '' && !isAnswerChecked && styles.numpadButtonCheckDisabled,
          ]}
          onPress={onCheck}
          disabled={userAnswer === '' && !isAnswerChecked}
        >
          <Text style={styles.numpadButtonCheckText}>
            {isAnswerChecked ? '→' : '✓'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NumpadButton({
  text,
  onPress,
  isSpecial = false,
  colors
}: {
  text: string;
  onPress: () => void;
  isSpecial?: boolean;
  colors: ThemeColors;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.numpadButton, 
        { borderColor: isSpecial ? colors.textSecondary : colors.border },
        isSpecial && styles.numpadButtonSpecial
      ]}
      onPress={onPress}
    >
      <Text style={[styles.numpadButtonText, { color: colors.text }]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerScore: {
    fontSize: 18,
    color: '#000',
  },
  settingsButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#4F46E5',
  },
  settingsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  settingsMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    minWidth: 200,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
    overflow: 'hidden',
  },
  settingsMenuHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingsMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingsMenuCloseButton: {
    padding: 12,
    alignItems: 'flex-end',
  },
  settingsMenuCloseButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  settingsMenuLink: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  settingsMenuLinkFlex: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  settingsMenuLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  personalizeButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    alignItems: 'center',
  },
  personalizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingsSectionRow: {
    flexDirection: 'row',
    paddingHorizontal: 0,
  },
  settingsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingsModeInfo: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  themeToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    alignItems: 'center',
  },
  themeButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  themeButtonTextActive: {
    color: '#fff',
  },
  operationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  operationButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    alignItems: 'center',
  },
  operationButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  operationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  operationButtonTextActive: {
    color: '#fff',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 8,
  },
  settingsAboutText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 4,
  },
  gameModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gameModeSettingsButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    alignItems: 'center',
  },
  gameModeSettingsButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  gameModeSettingsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  gameModeSettingsButtonTextActive: {
    color: '#fff',
  },
  questionCard: {
    flex: 1,
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    // Multi-layer shadow for depth
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  answerBox: {
    width: 120,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerText: {
    fontSize: 24,
  },
  answerPlaceholder: {
    color: '#999',
  },
  answerArea: {
    width: '100%',
    flexShrink: 0,
  },
  numpad: {
    width: '100%',
  },
  numpadRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  numpadButton: {
    flex: 1,
    height: 60,
    backgroundColor: 'transparent',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  numpadButtonSpecial: {
    backgroundColor: 'transparent',
  },
  numpadButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  numpadButtonCheck: {
    flex: 1,
    height: 60,
    backgroundColor: '#10B981',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  numpadButtonCheckDisabled: {
    backgroundColor: '#94A3B8',
  },
  numpadButtonCheckText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  choicesContainer: {
    width: '100%',
    gap: 12,
  },
  choiceButton: {
    width: '100%',
    height: 60,
    backgroundColor: 'transparent',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  choiceButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  choiceButtonCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  choiceButtonIncorrect: {
    backgroundColor: '#FFF1F2',
    borderColor: '#EF4444',
  },
  choiceButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  choiceButtonTextSelected: {
    color: '#4338CA',
  },
  checkButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#10B981',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    flexShrink: 0,
  },
  checkButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  checkButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  sequenceContainer: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
  },
  sequenceScroll: {
    marginBottom: 12,
  },
  sequenceButton: {
    width: '100%',
    height: 60,
    backgroundColor: 'transparent',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
  },
  sequenceButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  sequenceButtonCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  sequenceButtonIncorrect: {
    backgroundColor: '#FFF1F2',
    borderColor: '#EF4444',
  },
  sequenceButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  sequenceButtonTextSelected: {
    color: '#4338CA',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    minWidth: 280,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  restartButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutModalCloseButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutModalCloseText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  aboutModalInfoText: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 1.5,
  },
  numberRangeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rangeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  rangeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rangeButtonTextActive: {
    color: '#fff',
  },
  newHighScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  highScoreText: {
    fontSize: 14,
    marginBottom: 16,
  },
});
