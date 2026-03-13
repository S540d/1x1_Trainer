import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { ThemeColors, Operation, AnswerMode, GameState } from '../types/game';
import { Numpad } from './Numpad';

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
  const getCardColor = () => {
    if (gameState.lastAnswerCorrect === true) return colors.cardCorrect;
    if (gameState.lastAnswerCorrect === false) return colors.cardIncorrect;
    return colors.card;
  };

  const getResult = () => {
    if (gameState.operation === Operation.ADDITION) return gameState.num1 + gameState.num2;
    if (gameState.operation === Operation.SUBTRACTION) return gameState.num1 - gameState.num2;
    if (gameState.operation === Operation.DIVISION) return gameState.num1 / gameState.num2;
    return gameState.num1 * gameState.num2;
  };

  const renderAnswerBox = () => (
    <View style={[styles.answerBox, { backgroundColor: colors.background }]}>
      <Text style={[styles.answerText, { color: colors.text }, gameState.userAnswer === '' && styles.answerPlaceholder]}>
        {gameState.userAnswer || '?'}
      </Text>
    </View>
  );

  const renderNumber = (value: number) => (
    <Text style={[styles.questionText, { color: colors.text }]}>{value}</Text>
  );

  const renderQuestionMark = () => (
    <Text style={[styles.questionText, { color: colors.text }]}>?</Text>
  );

  return (
    <View style={styles.contentArea}>
      <Animated.View style={[styles.questionCard, { backgroundColor: getCardColor() }, cardAnimatedStyle]}>
        <View style={styles.questionRow}>
          {/* First number or answer box */}
          {gameState.questionPart === 0 ? (
            gameState.answerMode === AnswerMode.INPUT ? renderAnswerBox() : renderQuestionMark()
          ) : (
            renderNumber(gameState.num1)
          )}

          {/* Operator */}
          <Text style={[styles.questionText, { color: colors.text }]}> {operatorSymbol} </Text>

          {/* Second number or answer box */}
          {gameState.questionPart === 1 ? (
            gameState.answerMode === AnswerMode.INPUT ? renderAnswerBox() : renderQuestionMark()
          ) : (
            renderNumber(gameState.num2)
          )}

          {/* Equals sign */}
          <Text style={[styles.questionText, { color: colors.text }]}> = </Text>

          {/* Result or answer box */}
          {gameState.questionPart === 2 ? (
            gameState.answerMode === AnswerMode.INPUT ? renderAnswerBox() : renderQuestionMark()
          ) : (
            <Text style={[styles.questionText, { color: colors.text }]}>{getResult()}</Text>
          )}
        </View>

        {/* Answer Input Area */}
        <View style={styles.answerArea}>
          {gameState.answerMode === AnswerMode.INPUT && (
            <Numpad
              onNumberClick={onNumberClick}
              onCheck={gameState.isAnswerChecked ? onNext : onCheck}
              userAnswer={gameState.userAnswer}
              isAnswerChecked={gameState.isAnswerChecked}
              colors={colors}
              reduceMotion={reduceMotion}
            />
          )}

          {gameState.answerMode === AnswerMode.MULTIPLE_CHOICE && (
            <View style={styles.choicesContainer}>
              {multipleChoices.map((choice, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.choiceButton,
                    { borderColor: colors.border },
                    gameState.selectedChoice === choice && styles.choiceButtonSelected,
                    gameState.isAnswerChecked && choice === getCorrectAnswer() && styles.choiceButtonCorrect,
                    gameState.isAnswerChecked && gameState.selectedChoice === choice && choice !== getCorrectAnswer() && styles.choiceButtonIncorrect,
                  ]}
                  onPress={() => onChoiceClick(choice)}
                  disabled={gameState.isAnswerChecked}
                >
                  <Text style={[
                    styles.choiceButtonText,
                    { color: colors.text },
                    gameState.selectedChoice === choice && styles.choiceButtonTextSelected,
                  ]}>
                    {choice}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.checkButton,
                  (gameState.selectedChoice === null && !gameState.isAnswerChecked) && styles.checkButtonDisabled,
                ]}
                onPress={gameState.isAnswerChecked ? onNext : onCheck}
                disabled={gameState.selectedChoice === null && !gameState.isAnswerChecked}
              >
                <Text style={styles.checkButtonText}>
                  {gameState.isAnswerChecked ? t.nextQuestion : t.check}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState.answerMode === AnswerMode.NUMBER_SEQUENCE && (
            <View style={styles.sequenceContainer}>
              <ScrollView style={styles.sequenceScroll}>
                {numberSequence.map((num, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.sequenceButton,
                      { borderColor: colors.border },
                      gameState.selectedChoice === num && styles.sequenceButtonSelected,
                      gameState.isAnswerChecked && num === getCorrectAnswer() && styles.sequenceButtonCorrect,
                      gameState.isAnswerChecked && gameState.selectedChoice === num && num !== getCorrectAnswer() && styles.sequenceButtonIncorrect,
                    ]}
                    onPress={() => onChoiceClick(num)}
                    disabled={gameState.isAnswerChecked}
                  >
                    <Text style={[
                      styles.sequenceButtonText,
                      { color: colors.text },
                      gameState.selectedChoice === num && styles.sequenceButtonTextSelected,
                    ]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[
                  styles.checkButton,
                  (gameState.selectedChoice === null && !gameState.isAnswerChecked) && styles.checkButtonDisabled,
                ]}
                onPress={gameState.isAnswerChecked ? onNext : onCheck}
                disabled={gameState.selectedChoice === null && !gameState.isAnswerChecked}
              >
                <Text style={styles.checkButtonText}>
                  {gameState.isAnswerChecked ? t.nextQuestion : t.check}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentArea: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    flex: 1,
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  sequenceButtonTextSelected: {
    color: '#4338CA',
  },
});
