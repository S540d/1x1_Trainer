package com.example.a1x1trainer

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.a1x1trainer.ui.theme._1x1TrainerTheme
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    private val viewModel: TrainerViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            _1x1TrainerTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    TrainerScreen(
                        modifier = Modifier.padding(innerPadding),
                        viewModel = viewModel
                    )
                }
            }
        }
    }
}

enum class GameMode {
    NORMAL, FIRST_MISSING, SECOND_MISSING, MIXED
}

@Composable
fun TrainerScreen(modifier: Modifier = Modifier, viewModel: TrainerViewModel) {
    val state = viewModel.uiState

    // Effekt für visuelles Feedback
    LaunchedEffect(state.lastAnswerCorrect) {
        if (state.lastAnswerCorrect != null) {
            delay(500) // Warte 0.5 Sekunden
            viewModel.nextQuestion() // Lade die nächste Frage
        }
    }

    Box(modifier = modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("1x1 Trainer", fontSize = 32.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(24.dp))

            ScoreDisplay(currentTask = state.currentTask, totalTasks = state.totalTasks, score = state.score)

            Spacer(Modifier.height(16.dp))

            GameModeSelection(
                selectedMode = state.gameMode,
                onModeSelected = { viewModel.changeGameMode(it) }
            )

            Spacer(Modifier.height(32.dp))

            QuestionCard(
                state = state,
                onNumberClick = { number ->
                    var currentAnswer = state.userAnswer
                    when (number) {
                        -1 -> currentAnswer = currentAnswer.dropLast(1)
                        -2 -> currentAnswer = ""
                        else -> currentAnswer += number.toString()
                    }
                    viewModel.onUserInput(currentAnswer)
                },
                onCheckAnswer = { viewModel.checkAnswer() }
            )
        }

        if (state.showResult) {
            ResultDialog(score = state.score, totalTasks = state.totalTasks, onRestart = { viewModel.restartGame() })
        }
    }
}

// --- Aufgeteilte, kleinere UI-Komponenten ---

@Composable
fun ScoreDisplay(currentTask: Int, totalTasks: Int, score: Int) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = "Aufgabe: $currentTask / $totalTasks", fontSize = 16.sp)
        Text(text = "Punkte: $score", fontSize = 16.sp, color = Color(0xFF6200EE), fontWeight = FontWeight.Bold)
    }
}

@Composable
fun GameModeSelection(selectedMode: GameMode, onModeSelected: (GameMode) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            GameModeButton("Normale Aufgaben", selectedMode == GameMode.NORMAL, Modifier.weight(1f)) { onModeSelected(GameMode.NORMAL) }
            GameModeButton("Erste Zahl fehlt", selectedMode == GameMode.FIRST_MISSING, Modifier.weight(1f)) { onModeSelected(GameMode.FIRST_MISSING) }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            GameModeButton("Zweite Zahl fehlt", selectedMode == GameMode.SECOND_MISSING, Modifier.weight(1f)) { onModeSelected(GameMode.SECOND_MISSING) }
            GameModeButton("Gemischt", selectedMode == GameMode.MIXED, Modifier.weight(1f)) { onModeSelected(GameMode.MIXED) }
        }
    }
}

@Composable
fun QuestionCard(state: TrainerUiState, onNumberClick: (Int) -> Unit, onCheckAnswer: () -> Unit) {
    val cardColor by animateColorAsState(
        targetValue = when (state.lastAnswerCorrect) {
            true -> Color(0xFFC8E6C9) // Grün für richtig
            false -> Color(0xFFFFCDD2) // Rot für falsch
            null -> Color(0xFFF0F0FF) // Standardfarbe
        }, label = "CardColorAnimation"
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = cardColor)
    ) {
        Column(
            modifier = Modifier.padding(vertical = 32.dp, horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            val firstNumText = if (state.questionPart == 0) "?" else state.num1.toString()
            val secondNumText = if (state.questionPart == 1) "?" else state.num2.toString()
            val resultText = if (state.questionPart == 2) "?" else (state.num1 * state.num2).toString()

            Text(
                text = if (state.questionPart == 2) "$firstNumText × $secondNumText = ?" else "$firstNumText × $secondNumText = $resultText",
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(Modifier.height(16.dp))

            Box(
                modifier = Modifier
                    .size(width = 120.dp, height = 60.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.White)
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(text = state.userAnswer.ifEmpty { "?" }, fontSize = 24.sp, color = if (state.userAnswer.isEmpty()) Color.Gray else Color.Black)
            }

            Spacer(Modifier.height(24.dp))

            Numpad(onNumberClick = onNumberClick)

            Spacer(Modifier.height(24.dp))

            Button(
                onClick = onCheckAnswer,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFB39DDB)),
                enabled = state.lastAnswerCorrect == null // Button deaktivieren, während Feedback gezeigt wird
            ) {
                Text("Prüfen", fontSize = 18.sp, color = Color.White)
            }
        }
    }
}

@Composable
fun ResultDialog(score: Int, totalTasks: Int, onRestart: () -> Unit) {
    Dialog(onDismissRequest = {}) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Super!", fontSize = 24.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(16.dp))
                Text("Du hast $score von $totalTasks Aufgaben richtig gelöst.", fontSize = 18.sp)
                Spacer(Modifier.height(24.dp))
                Button(onClick = onRestart) {
                    Text("Nochmal spielen")
                }
            }
        }
    }
}


@Composable
fun GameModeButton(text: String, isSelected: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = modifier.height(60.dp),
        shape = RoundedCornerShape(8.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (isSelected) Color(0xFF6200EE) else Color(0xFFF0F0F0),
            contentColor = if (isSelected) Color.White else Color.Black
        )
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text, fontWeight = FontWeight.Bold, fontSize = 12.sp)
        }
    }
}

@Composable
fun Numpad(onNumberClick: (Int) -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            NumpadButton("1") { onNumberClick(1) }
            NumpadButton("2") { onNumberClick(2) }
            NumpadButton("3") { onNumberClick(3) }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            NumpadButton("4") { onNumberClick(4) }
            NumpadButton("5") { onNumberClick(5) }
            NumpadButton("6") { onNumberClick(6) }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            NumpadButton("7") { onNumberClick(7) }
            NumpadButton("8") { onNumberClick(8) }
            NumpadButton("9") { onNumberClick(9) }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            NumpadButton("←", color = Color(0xFFFFE0B2)) { onNumberClick(-1) }
            NumpadButton("0") { onNumberClick(0) }
            NumpadButton("C", color = Color(0xFFFFE0B2)) { onNumberClick(-2) }
        }
    }
}

@Composable
fun NumpadButton(text: String, color: Color = Color.White, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(width = 70.dp, height = 50.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(color)
            .clickable(onClick = onClick)
            .border(1.dp, Color.LightGray, RoundedCornerShape(8.dp)),
        contentAlignment = Alignment.Center
    ) {
        Text(text, fontSize = 20.sp, fontWeight = FontWeight.Bold)
    }
}


@Preview(showBackground = true, widthDp = 380)
@Composable
fun TrainerScreenPreview() {
    _1x1TrainerTheme {
        // Preview mit einem Dummy-ViewModel
        TrainerScreen(viewModel = TrainerViewModel())
    }
}
