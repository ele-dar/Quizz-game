const intro = document.querySelector('.intro');
const playBtn = document.querySelector('#play');

const level = document.querySelector('.level');
const chooseLevel = document.querySelector('.choose-level');

const loader = document.querySelector('.loader');

const game = document.querySelector('.game');
const scoreDisplay = document.querySelector('.display__score');
const qNumberDisplay = document.querySelector('.display__question-num');
const questionDisplay = document.querySelector('#question');
const trueBtn = document.querySelector('#true');
const falseBtn = document.querySelector('#false');

const gameover = document.querySelector('.gameover');
const finalScoreDisplay = document.querySelector('#final-score-display');
const form = document.querySelector('.gameover__submit');
const usernameInput = document.querySelector('.gameover__submit__name');
const submitBtn = document.querySelector('.gameover__submit__btn');
const currentHighscores = JSON.parse(localStorage.getItem('highscores')) || [];
const userPlaceDisplay = document.querySelector('.highscore');
const userPlace = document.querySelector('#user-place');
const playAgainBtn = document.querySelector('#play-again');

const DELAY = 600;

let currQuestionIndex = 0;
let score = 0;
let questions = [];

// INTRO
playBtn.addEventListener('click', () => {
	intro.classList.add('hidden');
	level.classList.remove('hidden');
});

// CHOOSE LEVEL AND GAME
async function fetchQuestions(level) {
	try {
		loader.classList.remove('hidden');
		const response = await fetch(`https://opentdb.com/api.php?amount=10&difficulty=${level}&type=boolean`);
		const result = await response.json();
		loader.classList.add('hidden');
		game.classList.remove('hidden');
		const formattedQuestions = formatQuestions(result.results);
		startGame(formattedQuestions);
	} catch (err) {
		console.log(err);
	}
}

function formatQuestions(result) {
	return result.map((question) => {
		return { question: question.question, isTrue: question.correct_answer === 'True' };
	});
}

function startGame(formattedQuestions) {
	questions = [ ...formattedQuestions ];
	questionDisplay.innerHTML = questions[currQuestionIndex].question;
}

chooseLevel.addEventListener('click', (e) => {
	const chosenLevel = e.target.id;
	level.classList.add('hidden');
	fetchQuestions(chosenLevel);
});

// ANSWER HANDLING
function handleAnswer(isCorrect) {
	if (isCorrect) {
		score++;
		scoreDisplay.classList.add('correct');
	} else {
		game.classList.add('wrong');
	}
	scoreDisplay.innerText = `Score: ${score}`;
	currQuestionIndex++;
	if (currQuestionIndex === questions.length) {
		setTimeout(() => {
			scoreDisplay.classList.remove('correct');
			game.classList.remove('wrong');
			handleGameover();
		}, DELAY);
		return;
	}
	setTimeout(() => {
		scoreDisplay.classList.remove('correct');
		game.classList.remove('wrong');
		questionDisplay.innerHTML = questions[currQuestionIndex].question;
		qNumberDisplay.innerText = `${currQuestionIndex + 1}/10`;
	}, DELAY);
}

trueBtn.addEventListener('click', () => {
	handleAnswer(questions[currQuestionIndex].isTrue);
});

falseBtn.addEventListener('click', () => {
	handleAnswer(!questions[currQuestionIndex].isTrue);
});

// GAME OVER
function handleGameover() {
	game.classList.add('hidden');
	gameover.classList.remove('hidden');
	finalScoreDisplay.innerText = `${score}`;
}

function findPlace(highscores, user) {
	const sortedHighscores = highscores.sort((a, b) => {
		return b.score - a.score;
	});
	console.log(sortedHighscores);
	const userPlaceValue = sortedHighscores.indexOf(user) + 1;
	userPlace.innerText = userPlaceValue;
}

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const result = {
		name: usernameInput.value,
		score
	};
	const newHighscores = [ ...currentHighscores, result ];
	localStorage.setItem('highscores', JSON.stringify(newHighscores));
	form.classList.add('hidden');
	userPlaceDisplay.classList.remove('hidden');
	findPlace(newHighscores, result);
});

playAgainBtn.addEventListener('click', () => {
	gameover.classList.add('hidden');
	level.classList.remove('hidden');
	score = 0;
	scoreDisplay.innerText = `Score: ${score}`;
	currQuestionIndex = 0;
	qNumberDisplay.innerText = `${currQuestionIndex + 1}/10`;
	form.classList.remove('hidden');
	userPlaceDisplay.classList.add('hidden');
	usernameInput.value = '';
	userPlace.innerText = '';
});
