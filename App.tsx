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
import { Operation, AnswerMode, DifficultyMode } from './types/game';
import { translations } from './i18n/translations';
import { APP_VERSION } from './utils/constants';
import { useTheme } from './hooks/useTheme';
import { usePreferences } from './hooks/usePreferences';
import { useGameLogic } from './hooks/useGameLogic';

export default function App() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);

  // Use custom hooks
  const preferences = usePreferences();
  const theme = useTheme(preferences.themeMode);
  const game = useGameLogic({
    initialOperation: preferences.operation,
    initialTotalSolvedTasks: preferences.totalSolvedTasks,
    onTotalSolvedTasksChange: preferences.setTotalSolvedTasks,
    onMotivationShow: () => setShowMotivation(true),
  });

  const t = translations[preferences.language];
  const { colors, isDarkMode } = theme;

  // Set body background color dynamically on web
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = isDarkMode ? '#0A0A0A' : '#FAFAFA';
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
    if (preferences.isLoaded && game.gameState.operation !== preferences.operation) {
      preferences.setOperation(game.gameState.operation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.gameState.operation]);

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
        <Text style={[styles.headerScore, { color: colors.text }]}>
          {t.task}: {game.gameState.currentTask}/{game.gameState.totalTasks}
        </Text>
        <Text style={[styles.headerScore, { color: colors.text }]}>
          {t.points}: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{game.gameState.score}</Text>
        </Text>
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

            {/* Appearance Settings - Light/Dark/System */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.appearance}</Text>
              <View style={styles.themeToggle}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    theme.themeMode === 'light' && styles.themeButtonActive,
                  ]}
                  onPress={() => preferences.setThemeMode('light')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      theme.themeMode === 'light' && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.light}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    theme.themeMode === 'dark' && styles.themeButtonActive,
                  ]}
                  onPress={() => preferences.setThemeMode('dark')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      theme.themeMode === 'dark' && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.dark}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    theme.themeMode === 'system' && styles.themeButtonActive,
                  ]}
                  onPress={() => preferences.setThemeMode('system')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      theme.themeMode === 'system' && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.system}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingsDivider} />

            {/* Language Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.language}</Text>
              <View style={styles.themeToggle}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    preferences.language === 'en' && styles.themeButtonActive,
                  ]}
                  onPress={() => preferences.setLanguage('en')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      preferences.language === 'en' && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.english}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    preferences.language === 'de' && styles.themeButtonActive,
                  ]}
                  onPress={() => preferences.setLanguage('de')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      preferences.language === 'de' && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.german}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingsDivider} />

            {/* Operation Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.operation}</Text>
              <View style={styles.themeToggle}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    game.gameState.operation === Operation.ADDITION && styles.themeButtonActive,
                  ]}
                  onPress={() => game.changeOperation(Operation.ADDITION)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      game.gameState.operation === Operation.ADDITION && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.addition}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    game.gameState.operation === Operation.MULTIPLICATION && styles.themeButtonActive,
                  ]}
                  onPress={() => game.changeOperation(Operation.MULTIPLICATION)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      game.gameState.operation === Operation.MULTIPLICATION && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.multiplication}
                  </Text>
                </TouchableOpacity>
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
                    game.gameState.difficultyMode === DifficultyMode.SIMPLE && styles.themeButtonActive,
                  ]}
                  onPress={() => game.changeDifficultyMode(DifficultyMode.SIMPLE)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      game.gameState.difficultyMode === DifficultyMode.SIMPLE && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.simpleMode}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    game.gameState.difficultyMode === DifficultyMode.CREATIVE && styles.themeButtonActive,
                  ]}
                  onPress={() => game.changeDifficultyMode(DifficultyMode.CREATIVE)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      game.gameState.difficultyMode === DifficultyMode.CREATIVE && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.creativeMode}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.settingsModeInfo, { color: colors.textSecondary }]}>
                {game.gameState.difficultyMode === DifficultyMode.SIMPLE ? t.simpleModeInfo : t.creativeModeInfo}
              </Text>
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
              />
            )}

            {game.gameState.answerMode === AnswerMode.MULTIPLE_CHOICE && (
              <View style={styles.choicesContainer}>
                {game.multipleChoices.map((choice, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.choiceButton,
                      game.gameState.selectedChoice === choice && styles.choiceButtonSelected,
                      game.gameState.isAnswerChecked && choice === game.getCorrectAnswer() && styles.choiceButtonCorrect,
                      game.gameState.isAnswerChecked && game.gameState.selectedChoice === choice && choice !== game.getCorrectAnswer() && styles.choiceButtonIncorrect,
                    ]}
                    onPress={() => game.handleChoiceClick(choice)}
                    disabled={game.gameState.isAnswerChecked}
                  >
                    <Text style={[
                      styles.choiceButtonText,
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
                        game.gameState.selectedChoice === num && styles.sequenceButtonSelected,
                        game.gameState.isAnswerChecked && num === game.getCorrectAnswer() && styles.sequenceButtonCorrect,
                        game.gameState.isAnswerChecked && game.gameState.selectedChoice === num && num !== game.getCorrectAnswer() && styles.sequenceButtonIncorrect,
                      ]}
                      onPress={() => game.handleChoiceClick(num)}
                      disabled={game.gameState.isAnswerChecked}
                    >
                      <Text style={[
                        styles.sequenceButtonText,
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.great}</Text>
            <Text style={[styles.modalText, { color: colors.text }]}>
              {t.youSolved} {game.gameState.score} {t.of} {game.gameState.totalTasks} {t.tasksCorrectly}.
            </Text>
            <TouchableOpacity style={styles.restartButton} onPress={game.restartGame}>
              <Text style={styles.restartButtonText}>{t.playAgain}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Motivation Modal */}
      <Modal visible={showMotivation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.settingsMenu }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.motivationTitle}</Text>
            <Text style={[styles.modalText, { color: colors.text }]}>
              {t.motivationMessage}
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
            <Text style={[styles.modalText, { color: colors.text }]}>
              {t.version} {APP_VERSION}
            </Text>
            <Text style={[styles.aboutModalInfoText, { color: colors.textSecondary }]}>
              {t.license}
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
  isAnswerChecked
}: {
  onNumberClick: (num: number) => void;
  onCheck: () => void;
  userAnswer: string;
  isAnswerChecked: boolean;
}) {
  return (
    <View style={styles.numpad}>
      <View style={styles.numpadRow}>
        <NumpadButton text="1" onPress={() => onNumberClick(1)} />
        <NumpadButton text="2" onPress={() => onNumberClick(2)} />
        <NumpadButton text="3" onPress={() => onNumberClick(3)} />
      </View>
      <View style={styles.numpadRow}>
        <NumpadButton text="4" onPress={() => onNumberClick(4)} />
        <NumpadButton text="5" onPress={() => onNumberClick(5)} />
        <NumpadButton text="6" onPress={() => onNumberClick(6)} />
      </View>
      <View style={styles.numpadRow}>
        <NumpadButton text="7" onPress={() => onNumberClick(7)} />
        <NumpadButton text="8" onPress={() => onNumberClick(8)} />
        <NumpadButton text="9" onPress={() => onNumberClick(9)} />
      </View>
      <View style={styles.numpadRow}>
        <NumpadButton text="←" onPress={() => onNumberClick(-1)} isSpecial />
        <NumpadButton text="0" onPress={() => onNumberClick(0)} />
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
}: {
  text: string;
  onPress: () => void;
  isSpecial?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.numpadButton, isSpecial && styles.numpadButtonSpecial]}
      onPress={onPress}
    >
      <Text style={styles.numpadButtonText}>{text}</Text>
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
    color: '#6200EE',
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
    borderRadius: 16,
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
    paddingVertical: 12,
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
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  settingsMenuLinkFlex: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  settingsMenuLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginTop: 6,
    fontStyle: 'italic',
  },
  themeToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  themeButtonActive: {
    backgroundColor: '#6200EE',
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  themeButtonTextActive: {
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  gameModeSettingsButtonActive: {
    backgroundColor: '#6200EE',
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
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
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
    marginBottom: 24,
  },
  questionText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  answerBox: {
    width: 120,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
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
    flex: 1,
    justifyContent: 'flex-end',
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
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  numpadButtonSpecial: {
    backgroundColor: '#F5F5F5',
  },
  numpadButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  numpadButtonCheck: {
    flex: 1,
    height: 60,
    backgroundColor: '#03DAC6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00BFA5',
  },
  numpadButtonCheckDisabled: {
    backgroundColor: '#B0BEC5',
    borderColor: '#90A4AE',
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
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BDBDBD',
  },
  choiceButtonSelected: {
    backgroundColor: '#BBDEFB',
    borderColor: '#2196F3',
  },
  choiceButtonCorrect: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
  },
  choiceButtonIncorrect: {
    backgroundColor: '#FFCDD2',
    borderColor: '#F44336',
  },
  choiceButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  choiceButtonTextSelected: {
    color: '#1976D2',
  },
  checkButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#03DAC6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    flexShrink: 0,
  },
  checkButtonDisabled: {
    backgroundColor: '#B0BEC5',
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
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#BDBDBD',
  },
  sequenceButtonSelected: {
    backgroundColor: '#BBDEFB',
    borderColor: '#2196F3',
  },
  sequenceButtonCorrect: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
  },
  sequenceButtonIncorrect: {
    backgroundColor: '#FFCDD2',
    borderColor: '#F44336',
  },
  sequenceButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  sequenceButtonTextSelected: {
    color: '#1976D2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  restartButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  restartButtonText: {
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  aboutModalInfoText: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 1.5,
  },
});
