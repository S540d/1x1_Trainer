import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors, Operation, AnswerMode, GameState } from '../types/game';
import { DESIGN_TOKENS } from '../utils/constants';
import { Numpad } from './Numpad';
import { ProgressDots } from './ProgressDots';

interface GameCardProps {
  gameState: GameState;
  colors: ThemeColors;
  cardAnimatedStyle: {
    transform: ({ scale: Animated.Value } | { translateX: Animated.Value })[];
  };
  operatorSymbol: string;
  multipleChoices: number[];
  numberSequence: number[];
  reduceMotion: React.MutableRefObject<boolean>;
  getCorrectAnswer: () => number;
  onNumberClick: (num: number) => void;
  onChoiceClick: (choice: number) => void;
  onCheck: () => void;
  onNext: () => void;
  t: {
    nextQuestion: string;
    check: string;
  };
}

export function GameCard({
  gameState,
  colors,
  cardAnimatedStyle,
  operatorSymbol,
  multipleChoices,
  numberSequence,
  reduceMotion,
  getCorrectAnswer,
  onNumberClick,
  onChoiceClick,
  onCheck,
  onNext,
  t,
}: GameCardProps) {
  const getGradientColors = (): readonly [string, string] => {
    if (gameState.lastAnswerCorrect === true) return DESIGN_TOKENS.GRADIENT_CORRECT;
    if (gameState.lastAnswerCorrect === false) return DESIGN_TOKENS.GRADIENT_INCORRECT;
    return DESIGN_TOKENS.GRADIENT_PRIMARY;
  };

  const getResult = () => {
    if (gameState.operation === Operation.ADDITION) return gameState.num1 + gameState.num2;
    if (gameState.operation === Operation.SUBTRACTION) return gameState.num1 - gameState.num2;
    if (gameState.operation === Operation.DIVISION) return gameState.num1 / gameState.num2;
    return gameState.num1 * gameState.num2;
  };

  const renderAnswerBox = () => (
    <View style={styles.answerBox}>
      <Text style={[styles.answerText, gameState.userAnswer === '' && styles.answerPlaceholder]}>
        {gameState.userAnswer || '?'}
      </Text>
    </View>
  );

  const renderNumber = (value: number) => (
    <Text style={styles.questionText}>{value}</Text>
  );

  const renderQuestionMark = () => (
    <Text style={styles.questionText}>?</Text>
  );

  return (
    <View style={styles.contentArea}>
      <Animated.View style={[styles.cardWrapper, cardAnimatedStyle]}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.questionCard}
        >
          <View style={styles.questionRow}>
            {gameState.questionPart === 0 ? (
              gameState.answerMode === AnswerMode.INPUT ? renderAnswerBox() : renderQuestionMark()
            ) : (
              renderNumber(gameState.num1)
            )}

            <Text style={styles.questionText}> {operatorSymbol} </Text>

            {gameState.questionPart === 1 ? (
              gameState.answerMode === AnswerMode.INPUT ? renderAnswerBox() : renderQuestionMark()
            ) : (
              renderNumber(gameState.num2)
            )}

            <Text style={styles.questionText}> = </Text>

            {gameState.questionPart === 2 ? (
              gameState.answerMode === AnswerMode.INPUT ? renderAnswerBox() : renderQuestionMark()
            ) : (
              <Text style={styles.questionText}>{getResult()}</Text>
            )}
          </View>

          <View style={styles.answerArea}>
            {gameState.answerMode === AnswerMode.INPUT && (
              <Numpad
                onNumberClick={onNumberClick}
                onCheck={gameState.isAnswerChecked ? onNext : onCheck}
                userAnswer={gameState.userAnswer}
                isAnswerChecked={gameState.isAnswerChecked}
                reduceMotion={reduceMotion}
              />
            )}

            {gameState.answerMode === AnswerMode.MULTIPLE_CHOICE && (
              <View style={styles.choicesContainer}>
                <ScrollView style={styles.choicesScroll}>
                  {multipleChoices.map((choice, index) => (
                    <TouchableOpacity
                      key={`${index}-${choice}`}
                      style={[
                        styles.choiceButton,
                        gameState.selectedChoice === choice && styles.choiceButtonSelected,
                        gameState.isAnswerChecked && choice === getCorrectAnswer() && styles.choiceButtonCorrect,
                        gameState.isAnswerChecked && gameState.selectedChoice === choice && choice !== getCorrectAnswer() && styles.choiceButtonIncorrect,
                      ]}
                      onPress={() => onChoiceClick(choice)}
                      disabled={gameState.isAnswerChecked}
                    >
                      <Text style={[
                        styles.choiceButtonText,
                        gameState.selectedChoice === choice && styles.choiceButtonTextSelected,
                      ]}>
                        {choice}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <GradientCheckButton
                  label={gameState.isAnswerChecked ? t.nextQuestion : t.check}
                  onPress={gameState.isAnswerChecked ? onNext : onCheck}
                  disabled={gameState.selectedChoice === null && !gameState.isAnswerChecked}
                />
              </View>
            )}

            {gameState.answerMode === AnswerMode.NUMBER_SEQUENCE && (
              <View style={styles.sequenceContainer}>
                <ScrollView style={styles.sequenceScroll}>
                  <View style={styles.sequenceGrid}>
                    {numberSequence.map((num, index) => (
                      <TouchableOpacity
                        key={`${index}-${num}`}
                        style={[
                          styles.sequenceButton,
                          gameState.selectedChoice === num && styles.sequenceButtonSelected,
                          gameState.isAnswerChecked && num === getCorrectAnswer() && styles.sequenceButtonCorrect,
                          gameState.isAnswerChecked && gameState.selectedChoice === num && num !== getCorrectAnswer() && styles.sequenceButtonIncorrect,
                        ]}
                        onPress={() => onChoiceClick(num)}
                        disabled={gameState.isAnswerChecked}
                      >
                        <Text style={[
                          styles.sequenceButtonText,
                          gameState.selectedChoice === num && styles.sequenceButtonTextSelected,
                        ]}>
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <GradientCheckButton
                  label={gameState.isAnswerChecked ? t.nextQuestion : t.check}
                  onPress={gameState.isAnswerChecked ? onNext : onCheck}
                  disabled={gameState.selectedChoice === null && !gameState.isAnswerChecked}
                />
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>

      <ProgressDots current={gameState.currentTask - 1} total={gameState.totalTasks} />
    </View>
  );
}

function GradientCheckButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <View style={[styles.checkButton, styles.checkButtonDisabled]}>
        <Text style={styles.checkButtonText}>{label}</Text>
      </View>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={DESIGN_TOKENS.GRADIENT_PRIMARY}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.checkButton}
      >
        <Text style={styles.checkButtonText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contentArea: {
    flex: 1,
    padding: 16,
    gap: 4,
  },
  cardWrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  questionCard: {
    flex: 1,
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Baloo2_700Bold',
  },
  answerBox: {
    width: 120,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Baloo2_700Bold',
  },
  answerPlaceholder: {
    color: 'rgba(255,255,255,0.6)',
  },
  answerArea: {
    width: '100%',
    flex: 1,
    minHeight: 0,
  },
  choicesContainer: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
  },
  choicesScroll: {
    flex: 1,
    marginBottom: 12,
  },
  choiceButton: {
    width: '100%',
    height: 60,
    backgroundColor: DESIGN_TOKENS.CHOICE_BUTTON_BG,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  choiceButtonSelected: {
    backgroundColor: DESIGN_TOKENS.CHOICE_SELECTED_BG,
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.CHOICE_SELECTED_BORDER,
  },
  choiceButtonCorrect: {
    backgroundColor: DESIGN_TOKENS.CHOICE_CORRECT_BG,
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.CHOICE_CORRECT_BORDER,
  },
  choiceButtonIncorrect: {
    backgroundColor: DESIGN_TOKENS.CHOICE_INCORRECT_BG,
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.CHOICE_INCORRECT_BORDER,
  },
  choiceButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Baloo2_700Bold',
  },
  choiceButtonTextSelected: {
    color: '#667eea',
  },
  checkButton: {
    width: '100%',
    height: 56,
    borderRadius: DESIGN_TOKENS.NUMPAD_BORDER_RADIUS,
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
    color: '#fff',
  },
  sequenceContainer: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
  },
  sequenceScroll: {
    flex: 1,
    marginBottom: 12,
  },
  sequenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sequenceButton: {
    width: '48%',
    height: 48,
    backgroundColor: DESIGN_TOKENS.CHOICE_BUTTON_BG,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sequenceButtonSelected: {
    backgroundColor: DESIGN_TOKENS.CHOICE_SELECTED_BG,
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.CHOICE_SELECTED_BORDER,
  },
  sequenceButtonCorrect: {
    backgroundColor: DESIGN_TOKENS.CHOICE_CORRECT_BG,
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.CHOICE_CORRECT_BORDER,
  },
  sequenceButtonIncorrect: {
    backgroundColor: DESIGN_TOKENS.CHOICE_INCORRECT_BG,
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.CHOICE_INCORRECT_BORDER,
  },
  sequenceButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Baloo2_700Bold',
  },
  sequenceButtonTextSelected: {
    color: '#667eea',
  },
});
