const intro = document.querySelector('.intro');
const playBtn = document.querySelector('#play');

const type = document.querySelector('.type');
const chooseType = document.querySelector('.choose-type');

const level = document.querySelector('.level');
const chooseLevel = document.querySelector('.choose-level');

const loader = document.querySelector('.loader');

const game = document.querySelector('.game');
const scoreDisplay = document.querySelector('.display__score');
const qNumberDisplay = document.querySelector('.display__question-num');
const questionDisplay = document.querySelector('#question');
const booleanType = document.querySelector('.choose-boolean');
const trueBtn = document.querySelector('#true');
const falseBtn = document.querySelector('#false');
const multipleType = document.querySelector('.choose-multiple');
const a1 = document.querySelector('#a1');
const a2 = document.querySelector('#a2');
const a3 = document.querySelector('#a3');
const a4 = document.querySelector('#a4');

const gameover = document.querySelector('.gameover');
const finalScoreDisplay = document.querySelector('#final-score-display');
const form = document.querySelector('.gameover__submit');
const usernameInput = document.querySelector('.gameover__submit__name');
const submitBtn = document.querySelector('.gameover__submit__btn');
const userPlaceDisplay = document.querySelector('.highscore');
const userPlace = document.querySelector('#user-place');
const playAgainBtn = document.querySelector('#play-again');

const DELAY = 600;

let chosenType;
let chosenLevel;
let questions = [];
let currQuestionIndex = 0;
let score = 0;
let isClicked = false;

const show = (element) => element.classList.remove('hidden');
const hide = (element) => element.classList.add('hidden');
const disable = (e) => (e.disabled = true);
const enable = (e) => (e.disabled = false);

// START
playBtn.addEventListener('click', () => {
	hide(intro);
	show(type);
});

chooseType.addEventListener('click', (e) => {
	chosenType = e.target.id;
	if (chosenType === 'boolean') {
		hide(multipleType);
		show(booleanType);
	} else {
		show(multipleType);
		hide(booleanType);
	}
	hide(type);
	show(level);
});

chooseLevel.addEventListener('click', (e) => {
	chosenLevel = e.target.id;
	hide(level);
	show(loader);
	fetchQuestions();
});

// GAME
async function fetchQuestions() {
	try {
		const response = await fetch(
			`https://opentdb.com/api.php?amount=10&difficulty=${chosenLevel}&type=${chosenType}`
		);
		const result = await response.json();
		hide(loader);
		show(game);
		chosenType === 'boolean'
			? startGame(formatBooleanQuestions(result.results))
			: startGame(formatMultipleQuestions(result.results));
	} catch (err) {
		console.log(err);
	}
}

const formatBooleanQuestions = (result) => {
	formattedQuestions = result.map((question) => {
		return { question: question.question, isTrue: question.correct_answer === 'True' };
	});
	return formattedQuestions;
};

const formatMultipleQuestions = (result) => {
	formattedQuestions = result.map((question) => {
		randomIndex = Math.floor(Math.random() * 4);
		return {
			question: question.question,
			answer: question.correct_answer,
			answerIndex: randomIndex,
			choices: question.incorrect_answers
		};
	});
	formattedQuestions.forEach((element) => {
		element.choices.splice(element.answerIndex, 0, element.answer);
	});
	return formattedQuestions;
};

const startGame = (formattedQuestions) => {
	questions = [ ...formattedQuestions ];
	questionDisplay.innerHTML = questions[currQuestionIndex].question;
	chosenType === 'boolean' || displayMultipleAnswers(questions);
};

const displayMultipleAnswers = (questions) => {
	a1.innerHTML = questions[currQuestionIndex].choices[0];
	a2.innerHTML = questions[currQuestionIndex].choices[1];
	a3.innerHTML = questions[currQuestionIndex].choices[2];
	a4.innerHTML = questions[currQuestionIndex].choices[3];
};

// ANSWER HANDLING

// BOOLEAN ANSWER HANDLING
const handleBooleanAnswer = (isCorrect) => {
	if (!isClicked) {
		if (isCorrect) {
			score++;
			scoreDisplay.classList.add('correct');
		} else {
			game.classList.add('wrong');
		}
		isClicked = true;
		scoreDisplay.innerText = `Score: ${score}`;
		currQuestionIndex++;
		if (currQuestionIndex === questions.length) {
			setTimeout(() => {
				scoreDisplay.classList.remove('correct');
				game.classList.remove('wrong');
				isClicked = false;
				handleGameover();
			}, DELAY);
			return;
		}
		setTimeout(() => {
			scoreDisplay.classList.remove('correct');
			game.classList.remove('wrong');
			questionDisplay.innerHTML = questions[currQuestionIndex].question;
			qNumberDisplay.innerText = `${currQuestionIndex + 1}/10`;
			isClicked = false;
		}, DELAY);
	} else {
		return;
	}
};

trueBtn.addEventListener('click', () => {
	handleBooleanAnswer(questions[currQuestionIndex].isTrue);
});

falseBtn.addEventListener('click', () => {
	handleBooleanAnswer(!questions[currQuestionIndex].isTrue);
});

// MULTIPLE ANSWER HANDLING
const handleMultipleAnswer = (answerID, answerIndex) => {
	if (!isClicked) {
		if (answerID === `a${answerIndex + 1}`) {
			score++;
			scoreDisplay.classList.add('correct');
		} else {
			game.classList.add('wrong');
		}
		isClicked = true;
		scoreDisplay.innerText = `Score: ${score}`;
		currQuestionIndex++;
		if (currQuestionIndex === questions.length) {
			setTimeout(() => {
				scoreDisplay.classList.remove('correct');
				game.classList.remove('wrong');
				isClicked = false;
				handleGameover();
			}, DELAY);
			return;
		}
		setTimeout(() => {
			scoreDisplay.classList.remove('correct');
			game.classList.remove('wrong');
			questionDisplay.innerHTML = questions[currQuestionIndex].question;
			displayMultipleAnswers(questions);
			qNumberDisplay.innerText = `${currQuestionIndex + 1}/10`;
			isClicked = false;
		}, DELAY);
	} else {
		return;
	}
};

multipleType.addEventListener('click', (e) => {
	e.target.id === '' || handleMultipleAnswer(e.target.id, questions[currQuestionIndex].answerIndex);
});

// GAME OVER
const handleGameover = () => {
	hide(game);
	show(gameover);
	finalScoreDisplay.innerText = `${score}`;
};

const findPlace = (highscores, user) => {
	const sortedHighscores = highscores.sort((a, b) => {
		return b.score - a.score;
	});
	console.log(`Highscores:`);
	console.log(sortedHighscores);
	const userPlaceValue = sortedHighscores.indexOf(user) + 1;
	userPlace.innerText = userPlaceValue;
};

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const currentHighscores = JSON.parse(localStorage.getItem('highscores')) || [];
	const result = {
		name: usernameInput.value,
		score
	};
	const newHighscores = [ ...currentHighscores, result ];
	localStorage.setItem('highscores', JSON.stringify(newHighscores));
	hide(form);
	show(userPlaceDisplay);
	findPlace(newHighscores, result);
});

playAgainBtn.addEventListener('click', () => {
	hide(gameover);
	show(type);
	score = 0;
	scoreDisplay.innerText = `Score: ${score}`;
	currQuestionIndex = 0;
	qNumberDisplay.innerText = `${currQuestionIndex + 1}/10`;
	show(form);
	hide(userPlaceDisplay);
	usernameInput.value = '';
	userPlace.innerText = '';
});
