const buttonColors = ["red", "blue", "green", "yellow"];
let correctAnswersCount = 0;
let level = 1;
let gameStarted = false;
let gameDifficulty = 0;

let gamePattern = {
  Normal: [],
  Hard: [],
  VeryHard: [],
}

let userClickedPattern = {
  Normal: [],
  Hard: [],
  VeryHard: [],
}


/////////////////////////////////// Effects ///////////////////////////////////

//Most colors contain the button's ID (e.g., blueHard, greenNormal), therefore this function is
//used when only the color is needed.
function extractColor(color) {
  color = color.replace("VeryHard", "");
  color = color.replace("Hard", "");
  color = color.replace("Normal", "");
  return color;
}

function playSound(name) {
  name = extractColor(name);
  let audio = new Audio('sounds/' + name + '.mp3');
  audio.play();
}

function animatePress(currentColor) {
  let button = $("#" + currentColor);
  button.addClass("pressed");
  setTimeout(function () {
    button.removeClass('pressed');
  }, 100);
}

/////////////////////////////////// Click Handlers ///////////////////////////////////

//For use when game is running. Plays effects on the clicked button and checks if it was 
//the correct button.
function clickHandler(event) {
  let userChosenColorID = event.target.id;
  let userChosenColor = extractColor(userChosenColorID);
  let userChosenColorDifficulty = userChosenColorID.replace(userChosenColor, "");

  playSound(userChosenColorID);
  animatePress(userChosenColorID);
  
  userClickedPattern[userChosenColorDifficulty].push(userChosenColor);
  checkAnswer(userClickedPattern[userChosenColorDifficulty].lastIndexOf(userChosenColor), userChosenColorDifficulty);
}

//For use when game is over (to keep buttons' effects).
function gameOverClickHandler(event) {
  let userChosenColorID = event.target.id;
  playSound(userChosenColorID);
  animatePress(userChosenColorID);
}

function setDifficulty(difficulty) {
  if (difficulty === "normal") {
    $("#hardBlock").attr("style", "display: none");
    $("#veryHardBlock").attr("style", "display: none");
    gameDifficulty = 0;
  } else if (difficulty === "hard") {
    $("#hardBlock").attr("style", "display: inline-block");
    $("#veryHardBlock").attr("style", "display: none");
    gameDifficulty = 1;
  } else if (difficulty === "veryHard") {
    $("#hardBlock").attr("style", "display: inline-block");
    $("#veryHardBlock").attr("style", "display: inline-block");
    gameDifficulty = 2;
  }
}

function enableDisableDifficulties() {
  if (!gameStarted) {
    $("#normalDifficulty").on("click", () => setDifficulty("normal"));
    $("#hardDifficulty").on("click", () => setDifficulty("hard"));
    $("#veryHardDifficulty").on("click", () => setDifficulty("veryHard"));
    $(".btn").on("click", gameOverClickHandler);
  } else {
    $("#normalDifficulty").off("click");
    $("#hardDifficulty").off("click");
    $("#veryHardDifficulty").off("click");
    $(".btn").off("click", gameOverClickHandler);
  }
}

/////////////////////////////////// Game Logic ///////////////////////////////////

function resetPatterns() {
  return {
    Normal: [],
    Hard: [],
    VeryHard: [],
  };
}

function startOver() {
  level = 1;
  gamePattern = resetPatterns();
  gameStarted = false;
}

function gameOverTransition() {
  $(".btn").off("click", clickHandler);

  playSound("wrong");

  $("body").addClass("game-over");
  setTimeout(function () {
    $("body").removeClass('game-over');
  }, 200);

  $("#levelTitle").text("Game Over, Press Any Key to Restart");
  startOver();
  enableDisableDifficulties();
}

function pushToGamePattern(difficulty, color) {
  gamePattern[difficulty].push(color);
  $("#" + color + difficulty).fadeOut(100).fadeIn(100);
  playSound(color);
}

//Sets random colors to be pushed to the game's corresponding difficulty patterns.
function setRandomColors() {
  let randomNumber = []; 
  let randomChosenColor = [];

  for (var i=0; i<=gameDifficulty; i++){
    randomNumber.push(Math.floor(Math.random() * 4));
    randomChosenColor.push(buttonColors[randomNumber[i]]);
  }

  pushToGamePattern("Normal", randomChosenColor[0]);
  if (gameDifficulty >= 1) {setTimeout(() => pushToGamePattern("Hard", randomChosenColor[1]), 500);}
  if (gameDifficulty === 2) {setTimeout(() => pushToGamePattern("VeryHard", randomChosenColor[2]), 1000);}
}

//Resets user's answers; Inputs a new color to the game's pattern; Updates heading to current level
//and toggles on the buttons' event listener.
function nextSequence() { 
  correctAnswersCount = 0
  userClickedPattern = resetPatterns();

  setRandomColors();

  let levelTitle = $("#levelTitle");
  levelTitle.text("Level " + level);
  level++;

  $(".btn").on("click", clickHandler);
}

//Transitions to the game over screen if the user fails to replicate the color sequence.
//Creates a new sequence when replicated correctly.
function checkAnswer(currentLevel, difficulty) { 
  
  if (userClickedPattern[difficulty][currentLevel] !== gamePattern[difficulty][currentLevel]) {
    gameOverTransition();
    return 0;
  }

  correctAnswersCount++;
  if (correctAnswersCount === (gamePattern.Normal.length + gamePattern.Hard.length + gamePattern.VeryHard.length)) {
    $(".btn").off("click", clickHandler);
    setTimeout(nextSequence, 1000);
  }
}

/////////////////////////////////// Setup ///////////////////////////////////

//Enables difficulty buttons functionality.
$(document).ready(function () {
  enableDisableDifficulties();
});

$(document).keypress(function () {
  if (!gameStarted) {
    gameStarted = true;
    enableDisableDifficulties();
    nextSequence();
  }
});
