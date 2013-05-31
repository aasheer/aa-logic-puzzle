$(document).ready(function() {
	var board = new Puzzler.Board();
	board.getNewPuzzle();
	board.activateTiles();

	// 'Check Solution' button
	$('#buttons ul li:first-child').click(function (e) {
		board.sendSolution();
	})

	// 'New Puzzle' button
	$('#buttons ul li:last-child').click(function (e) {
		board.clearBoard();
		board = new Puzzler.Board();
		board.getNewPuzzle();
		board.activateTiles();
	})
})

// New namespace called Puzzler.
var Puzzler = {};

// Board class 
Puzzler.Board = function() {
	this.url = "http://logic-puzzle-server.herokuapp.com/puzzle.json";
	this.id = 0;
	this.board_size = [3,4];
	this.solution_array = [0,0,0,0,0,0,0,0,0,0,0,0];
}

Puzzler.Board.prototype.getNewPuzzle = function() {
	var obj = this;
	$.getJSON(obj.url, {}, function(board_data) {
		obj.id = board_data['id'];
		obj.newPuzzle(obj.id, board_data['hints']['row_hints'], board_data['hints']['col_hints']);
	})	
}

Puzzler.Board.prototype.newPuzzle = function(id, r_hints, c_hints) {
	var row_hints = r_hints;
	var col_hints = c_hints;
    var tiles = [];
    var obj = this;

    // Add css class to each 'hint' li, corresponding to row/col hints from JSON data. 
    //The classes adjust CSS sprite position accordingly, to reveal the correct hint images.
	$("#rowHints ul li").each(function(i) {
		$(this).addClass("hint" + row_hints[i]);
	})

	$("#columnHints ul li").each(function(i) {
		$(this).addClass("hint" + col_hints[i]);
	})

	/* This section creates an inline list of 12 puzzle tiles, effectively completing the setup for the puzzle. */
	// Using a custom data attribute: 'data-position', to give each puzzle tile its position on the board.
	for (var i = 0; i < this.solution_array.length; i += 1) {
		var li = '<li data-position="' + i + '" ></li>';
		tiles.push(li);
	}

	// More efficient to append puzzle tile li items at one time to the DOM.
	$('#puzzleTiles').append(tiles.join(''));
}

Puzzler.Board.prototype.activateTiles = function() {
    var obj = this;
    var tileOn = 0;

    // Delegate click event for each puzzle tile, represented by li items in the #puzzleTiles list.
	$('#puzzleTiles').on("click", "li", function (e) {
		tileOn = parseInt($(this).attr('data-position'));	

		if ( $(this).hasClass('tile') ) {
	    	$(this).removeClass('tile');
	    	obj.solution_array[tileOn] = 0;
	    }
	    else {
	    	$(this).addClass('tile');
	    	obj.solution_array[tileOn] = 1;
	    }
	})
}

Puzzler.Board.prototype.alertUser = function(b) {
	var is_solved_text = (b == true) ? 'You won!': 'Please try again';
	alert(is_solved_text);
}

Puzzler.Board.prototype.makeSolutionString = function() {
	var solution = this.board_size.toString() + ',' + this.solution_array.toString();
	return solution;
}

Puzzler.Board.prototype.sendSolution = function() {
	var obj = this;
	var solution = obj.makeSolutionString();
	var is_solved = '';

	// Had to specify datatype = 'json' in call to $.post, for it to work in Chrome and Safari.
	$.post(obj.url, {board_id: obj.id, solution: solution}, function(result) {
		is_solved = result['solved'];
		obj.alertUser(is_solved);
	}, 'json');						
}

Puzzler.Board.prototype.clearBoard = function() {
	// Reset all row and column hints to zero.
	$('#rowHints ul li').each(function() {
		$(this).removeClass();
	})

	$('#columnHints ul li').each(function() {	
		$(this).removeClass();
	})

	// Remove delegated click event on all tiles and then remove all li items from #puzzleItems list.
	$('#puzzleTiles').off('click', 'li');
	$('#puzzleTiles').empty();
}

















