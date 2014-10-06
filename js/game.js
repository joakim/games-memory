(function($, window, undefined) {

// Settings.
var config = {
	rounds: 3,
	timeout: 60,
		scoring: function () {
		return (config.timeout - state.time) * 10;
	},
	cards: [
		'blueDino', 'blueDino',
		'brownDino', 'brownDino',
		'redDino', 'redDino',
		'greenDino', 'greenDino',
		'purpDino', 'purpDino',
		'burgDino', 'burgDino',
		'orangeDino', 'orangeDino',
		'purp2Dino', 'purp2Dino',
		'pinkDino', 'pinkDino',
	],
	cardWidth: 109,
	cardHeight: 145,
};

// Game state.
var state = {
	playing: false,
	deck: null,
	round: 0,
	matched: 0,
	time: 0,
	score: 0,
	best: {
		time: 0,
		score: 0,
	},
};

// Buttons' action handlers.
var actions = {
	play: function() {
		elements.$intro.fadeOut();
		elements.$header.show();
		startRound();
	},
	retry: function() {
		elements.$roundResult.fadeOut();
		elements.$header.fadeIn();
		startRound();
	},
};

// DOM elements.
var elements;

// The timer's reference.
var timerInterval;

// Initialize game on document ready.
$(function init() {
	elements = {
		$header: $('#header'),
		$intro: $('#intro'),
		$deck: $('#deck'),
		$roundResult: $('#round-result'),
		$finalResult: $('#final-result'),
		$time: $('.time'),
		$round: $('.round'),
		$score: $('.score'),
	};

	// Attach actions to buttons' click events.
	$('button').on('click', function(e) {
		var action = $(this).data('action');
		actions[action]();
		e.preventDefault();
	});

	// Fade in the intro screen.
	elements.$intro.fadeIn();
});

/**
 * Start a new round.
 */
function startRound() {
	// Reset the game's state for a new round.
	state.round++;
	state.time = 0;
	state.score = 0;
	state.matched = 0;

	updateHeader();

	// Create a new deck of shuffled cards.
	state.deck = config.cards.slice(0).sort(function() {
		return 0.5 - Math.random();
	});

	// Add DOM elements for the cards.
	for (var i = 0; i < 18; ++i) {
		var pattern = state.deck.pop();

		var $card = $('<div class="card"><div class="face front"></div><div class="face back"></div></div>');
		$card.data('pattern', pattern)
			.addClass(pattern)
			.css({
				'left': (config.cardWidth + 20) * (i % 6),
				'top': (config.cardHeight + 20) * Math.floor(i / 6)
			})
			.on('click', selectCard)
			.appendTo(elements.$deck);
	}

	// Show the deck.
	elements.$deck.fadeIn();

	// Start a timer.
	timerInterval = window.setInterval(function() {
		// Update the time and score.
		state.time++;
		state.score = config.scoring(state.time);
		updateHeader();

		if (state.time > (config.timeout - 10)) {
			elements.$time.addClass('runningout');
		}

		// End the game if it reaches the timeout.
		if (state.time >= config.timeout) {
			endRound();
		}
	}, 1000);

	state.playing = true;
}

/**
 * End a game round.
 */
function endRound() {
	state.playing = false;

	window.clearInterval(timerInterval);

	if (state.score > state.best.score) {
		state.best.score = state.score;
		state.best.time = state.time;
	}

	elements.$time.removeClass('runningout');

	elements.$deck.fadeOut(function() {
		$(this).empty();

		if (state.round === config.rounds) {
			// End of final round, show best time and score.
			elements.$header.fadeOut();
			elements.$time.html(state.best.time);
			elements.$score.html(state.best.score);
			elements.$finalResult.fadeIn();
		}
		else {
			elements.$score.html(state.score);
			elements.$roundResult.fadeIn();
		}
	});
}

/**
 * Click handler; flips the card and checks for a match.
 */
function selectCard() {
	// Do nothing if there are already two cards flipped.
	if ($('.card-flipped').size() > 1) {
		return;
	}

	$(this).addClass('card-flipped');

	// Check the pattern of both flipped cards after 0.7s.
	if ($('.card-flipped').size() === 2) {
		window.setTimeout(checkPattern, 700);
	}
}

/**
 * Checks the pattern of flipped cards.
 *
 * If the two cards are the same, remove them, otherwise flip them back. If all
 * cards have been matched, end the round.
 */
function checkPattern() {
	var cards = $('.card-flipped');
	var pattern1 = $(cards[0]).data('pattern');
	var pattern2 = $(cards[1]).data('pattern');

	if (pattern1 === pattern2) {
		$('.card-flipped').remove();

		state.matched++;

		if (state.matched === 9) {
			endRound();
		}
	}
	else {
		$('.card-flipped').removeClass('card-flipped');
	}
}

/**
 * Updates the header's texts.
 */
function updateHeader() {
	elements.$time.html(state.time);
	elements.$round.html(state.round + '/' + config.rounds);
}

}(jQuery, this));
