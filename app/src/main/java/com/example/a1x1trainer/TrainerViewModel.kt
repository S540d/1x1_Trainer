
package com.example.a1x1trainer

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import kotlin.random.Random

// Datenklasse, die den gesamten Zustand der UI enthält
data class TrainerUiState(
    val num1: Int = 1,
    val num2: Int = 1,
    val userAnswer: String = "",
    val score: Int = 0,
    val currentTask: Int = 1,
    val totalTasks: Int = 10,
    val gameMode: GameMode = GameMode.NORMAL,
    val questionPart: Int = 2, // 0: num1, 1: num2, 2: result
    val showResult: Boolean = false,
    val lastAnswerCorrect: Boolean? = null // null: no answer yet, true: correct, false: wrong
)

class TrainerViewModel : ViewModel() {

    var uiState by mutableStateOf(TrainerUiState())
        private set

    init {
        generateQuestion()
    }

    fun onUserInput(input: String) {
        uiState = uiState.copy(userAnswer = input, lastAnswerCorrect = null)
    }

    fun changeGameMode(newMode: GameMode) {
        uiState = uiState.copy(gameMode = newMode)
        generateQuestion(newMode)
    }

    fun checkAnswer() {
        val state = uiState
        val correctAnswer = when (state.questionPart) {
            0 -> state.num1
            1 -> state.num2
            else -> state.num1 * state.num2
        }

        val isCorrect = state.userAnswer.toIntOrNull() == correctAnswer
        val newScore = if (isCorrect) state.score + 1 else state.score

        uiState = uiState.copy(lastAnswerCorrect = isCorrect, score = newScore)
    }

    fun nextQuestion() {
        if (uiState.currentTask < uiState.totalTasks) {
            uiState = uiState.copy(currentTask = uiState.currentTask + 1)
            generateQuestion(uiState.gameMode)
        } else {
            // Spiel ist vorbei
            uiState = uiState.copy(showResult = true)
        }
    }

    fun restartGame() {
        uiState = TrainerUiState() // Setzt auf den Anfangszustand zurück
        generateQuestion(uiState.gameMode)
    }

    private fun generateQuestion(mode: GameMode = uiState.gameMode) {
        val newNum1 = Random.nextInt(1, 11)
        val newNum2 = Random.nextInt(1, 11)
        val newQuestionPart = when (mode) {
            GameMode.NORMAL -> 2
            GameMode.FIRST_MISSING -> 0
            GameMode.SECOND_MISSING -> 1
            GameMode.MIXED -> Random.nextInt(0, 3)
        }
        uiState = uiState.copy(
            num1 = newNum1,
            num2 = newNum2,
            userAnswer = "",
            questionPart = newQuestionPart,
            lastAnswerCorrect = null
        )
    }
}
