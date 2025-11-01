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

enum GameMode {
  NORMAL = 'NORMAL',
  FIRST_MISSING = 'FIRST_MISSING',
  SECOND_MISSING = 'SECOND_MISSING',
  MIXED = 'MIXED',
}

interface GameState {
  num1: number;
  num2: number;
  userAnswer: string;
  score: number;
  currentTask: number;
  totalTasks: number;
  gameMode: GameMode;
  questionPart: number; // 0: num1, 1: num2, 2: result
  showResult: boolean;
  lastAnswerCorrect: boolean | null;
  isAnswerChecked: boolean;
}

const TOTAL_TASKS = 10;

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    num1: 1,
    num2: 1,
    userAnswer: '',
    score: 0,
    currentTask: 1,
    totalTasks: TOTAL_TASKS,
    gameMode: GameMode.NORMAL,
    questionPart: 2,
    showResult: false,
    lastAnswerCorrect: null,
    isAnswerChecked: false,
  });
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = (mode: GameMode = gameState.gameMode) => {
    const newNum1 = Math.floor(Math.random() * 10) + 1;
    const newNum2 = Math.floor(Math.random() * 10) + 1;
    let newQuestionPart = 2;

    switch (mode) {
      case GameMode.NORMAL:
        newQuestionPart = 2;
        break;
      case GameMode.FIRST_MISSING:
        newQuestionPart = 0;
        break;
      case GameMode.SECOND_MISSING:
        newQuestionPart = 1;
        break;
      case GameMode.MIXED:
        newQuestionPart = Math.floor(Math.random() * 3);
        break;
    }

    setGameState((prev) => ({
      ...prev,
      num1: newNum1,
      num2: newNum2,
      userAnswer: '',
      questionPart: newQuestionPart,
      lastAnswerCorrect: null,
      isAnswerChecked: false,
    }));
  };

  const onUserInput = (input: string) => {
    if (!gameState.isAnswerChecked) {
      setGameState((prev) => ({
        ...prev,
        userAnswer: input,
        lastAnswerCorrect: null,
      }));
    }
  };

  const changeGameMode = (newMode: GameMode) => {
    setGameState((prev) => ({
      ...prev,
      gameMode: newMode,
      currentTask: 1,
      score: 0,
      showResult: false,
    }));
    setTimeout(() => generateQuestion(newMode), 0);
  };

  const checkAnswer = () => {
    if (gameState.userAnswer === '') return;

    let correctAnswer = 0;
    switch (gameState.questionPart) {
      case 0:
        correctAnswer = gameState.num1;
        break;
      case 1:
        correctAnswer = gameState.num2;
        break;
      default:
        correctAnswer = gameState.num1 * gameState.num2;
    }

    const isCorrect = parseInt(gameState.userAnswer) === correctAnswer;
    const newScore = isCorrect ? gameState.score + 1 : gameState.score;

    setGameState((prev) => ({
      ...prev,
      lastAnswerCorrect: isCorrect,
      score: newScore,
      isAnswerChecked: true,
    }));
  };

  const nextQuestion = () => {
    if (gameState.currentTask < gameState.totalTasks) {
      setGameState((prev) => ({
        ...prev,
        currentTask: prev.currentTask + 1,
      }));
      setTimeout(() => generateQuestion(), 0);
    } else {
      setGameState((prev) => ({ ...prev, showResult: true }));
    }
  };

  const restartGame = () => {
    setGameState((prev) => ({
      ...prev,
      score: 0,
      currentTask: 1,
      showResult: false,
    }));
    setTimeout(() => generateQuestion(), 0);
  };

  const handleNumberClick = (num: number) => {
    let currentAnswer = gameState.userAnswer;
    if (num === -1) {
      currentAnswer = currentAnswer.slice(0, -1);
    } else if (num === -2) {
      currentAnswer = '';
    } else {
      currentAnswer += num.toString();
    }
    onUserInput(currentAnswer);
  };

  const getCardColor = () => {
    if (gameState.lastAnswerCorrect === true) return '#C8E6C9';
    if (gameState.lastAnswerCorrect === false) return '#FFCDD2';
    return '#f5f5f5';
  };

  const firstNumText = gameState.questionPart === 0 ? '?' : gameState.num1.toString();
  const secondNumText = gameState.questionPart === 1 ? '?' : gameState.num2.toString();
  const resultText =
    gameState.questionPart === 2 ? '?' : (gameState.num1 * gameState.num2).toString();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>1x1 Trainer</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.settingsButton}
          aria-label="Settings"
        >
          <Text style={styles.settingsButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Menu */}
      {menuVisible && (
        <>
          <TouchableOpacity
            style={styles.settingsOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />
          <View style={styles.settingsMenu}>
            <TouchableOpacity
              style={styles.settingsMenuCloseButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.settingsMenuCloseButtonText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsMenuLink}
              onPress={() => {
                Linking.openURL('https://buymeacoffee.com/sven4321');
                setMenuVisible(false);
              }}
            >
              <Text style={styles.settingsMenuLinkText}>Buy Me a Coffee</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            Aufgabe: {gameState.currentTask} / {gameState.totalTasks}
          </Text>
          <Text style={[styles.scoreText, styles.scoreValue]}>Punkte: {gameState.score}</Text>
        </View>

        <View style={styles.gameModeContainer}>
          <View style={styles.gameModeRow}>
            <GameModeButton
              text="Normale Aufgaben"
              isSelected={gameState.gameMode === GameMode.NORMAL}
              onPress={() => changeGameMode(GameMode.NORMAL)}
            />
            <GameModeButton
              text="Erste Zahl fehlt"
              isSelected={gameState.gameMode === GameMode.FIRST_MISSING}
              onPress={() => changeGameMode(GameMode.FIRST_MISSING)}
            />
          </View>
          <View style={styles.gameModeRow}>
            <GameModeButton
              text="Zweite Zahl fehlt"
              isSelected={gameState.gameMode === GameMode.SECOND_MISSING}
              onPress={() => changeGameMode(GameMode.SECOND_MISSING)}
            />
            <GameModeButton
              text="Gemischt"
              isSelected={gameState.gameMode === GameMode.MIXED}
              onPress={() => changeGameMode(GameMode.MIXED)}
            />
          </View>
        </View>

        <View style={[styles.questionCard, { backgroundColor: getCardColor() }]}>
          <Text style={styles.questionText}>
            {gameState.questionPart === 2
              ? `${firstNumText} × ${secondNumText} = ?`
              : `${firstNumText} × ${secondNumText} = ${resultText}`}
          </Text>

          <View style={styles.answerBox}>
            <Text style={[styles.answerText, gameState.userAnswer === '' && styles.answerPlaceholder]}>
              {gameState.userAnswer || '?'}
            </Text>
          </View>

          <Numpad onNumberClick={handleNumberClick} />

          <TouchableOpacity
            style={[
              styles.checkButton,
              gameState.userAnswer === '' && styles.checkButtonDisabled,
            ]}
            onPress={gameState.isAnswerChecked ? nextQuestion : checkAnswer}
            disabled={gameState.userAnswer === ''}
          >
            <Text style={styles.checkButtonText}>
              {gameState.isAnswerChecked ? 'Nächste Frage' : 'Prüfen'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={gameState.showResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Super!</Text>
            <Text style={styles.modalText}>
              Du hast {gameState.score} von {gameState.totalTasks} Aufgaben richtig gelöst.
            </Text>
            <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
              <Text style={styles.restartButtonText}>Nochmal spielen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function GameModeButton({
  text,
  isSelected,
  onPress,
}: {
  text: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.gameModeButton, isSelected && styles.gameModeButtonSelected]}
      onPress={onPress}
    >
      <Text
        style={[styles.gameModeButtonText, isSelected && styles.gameModeButtonTextSelected]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

function Numpad({ onNumberClick }: { onNumberClick: (num: number) => void }) {
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
        <NumpadButton text="C" onPress={() => onNumberClick(-2)} isSpecial />
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
    backgroundColor: '#fff',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
    overflow: 'hidden',
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
  settingsMenuLink: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  settingsMenuLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 16,
  },
  scoreValue: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  gameModeContainer: {
    width: '100%',
    marginBottom: 32,
  },
  gameModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  gameModeButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  gameModeButtonSelected: {
    backgroundColor: '#6200EE',
  },
  gameModeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  gameModeButtonTextSelected: {
    color: '#fff',
  },
  questionCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  questionText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  answerBox: {
    width: 120,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  answerText: {
    fontSize: 24,
  },
  answerPlaceholder: {
    color: '#999',
  },
  numpad: {
    width: '100%',
    marginBottom: 24,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  numpadButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  numpadButtonSpecial: {
    backgroundColor: '#F5F5F5',
  },
  numpadButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#03DAC6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  checkButtonText: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
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
    borderRadius: 8,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
