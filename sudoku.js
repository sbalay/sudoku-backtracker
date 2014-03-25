
var CacheItem = function (cell, row, column, index) {
	return {'cell': cell, 'row':row, 'column':column, 'index':index};
}

var cache = [];

$(document).ready(function() {

	// <INIT TABLE>
	var mainContainer = $('.main-container');
	var ind = 0;
	for (var x = 0; x < 9; x++) {
		for (var y = 0; y < 9; y++) {
			var $cell = $("<input type='text' id='ind" + ind + "'class='cell row" + x + " col" + y + "'></input>");
			mainContainer.append($cell);
			cache.push(new CacheItem($cell, x, y, ind));
			ind += 1;
		}
	}
	$('.stopButton').hide();
	// </ INIT TABLE>

	// <CELL KEYDOWN EVENT
	var validateKey = function (e) {
		// Allow: backspace, delete, tab, escape
		if ($.inArray(e.keyCode, [46, 8, 9, 27]) !== -1 ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return false;
        }
        //If it was enter, go to next cell.
        if (e.keyCode === 13) {
        	e.preventDefault();
        	$(e.currentTarget).next().focus();
        	return false;
        }
        // stop the keypress if it is not a number
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
            return false;
        }
        // do not allow 0 (zero)
        if (e.keyCode === 48 || e.keyCode === 96) {
        	e.preventDefault();
            return false;	
        }
        return true;
	}

	$('.cell').on('keydown', function(e) {
		if (!validateKey(e)) {
			return;			
		}
		// Replace the cell content with the new value
		$(e.currentTarget).val("");
	});
	// </ CELL KEYDOWN EVENT>

});

var getCellInPosition = function (rowNumber, colNumber) {
	for (var i = 0; i < cache.length; i++) {
		if (cache[i].row === rowNumber) {
			if (cache[i].column === colNumber) {
				return cache[i].cell;
			}
		} else {
			i += 8;		
		}
	}
}

var startResolver = function () {

	var timeToStop = parseInt($('.timer').val());
	if (!timeToStop) {
		alert("Inserte un tiempo valido");
		return;
	} 

	$('.stopButton').show();
	$('.startButton').hide();
	$('.cleanButton').hide();
	$('.timer').hide();
	$('.timer-label').hide();
	
	STOP = false;

	var buildSudoku = function () {
		for (var x = 0; x < 9; x++) {
			for (var y = 0; y < 9; y++) {
				var cell = getCellInPosition(x, y);
				if (cell.val()) {
					cell.addClass('written');
				}
			}
		}
	}

	var getCellRow = function ($cell) {
		var cellClasses = $cell.attr('class');
		return parseInt(cellClasses[cellClasses.indexOf("row") + 3]);
	}
	var getCellColumn = function ($cell) {
		var cellClasses = $cell.attr('class');
		return parseInt(cellClasses[cellClasses.indexOf("col") + 3]);
	}

	var getAllCellsInSameRegion = function ($cell) {
		var row = getCellRow($cell);
		var col = getCellColumn($cell);

		var regionRows;
		if (row >= 0 && row <= 2) {
			regionRows = [0, 1, 2];
		} else if (row >= 3 && row <= 5) {
			regionRows = [3, 4, 5];
		} else if (row >= 6 && row <= 8) {
			regionRows = [6, 7, 8];
		}

		var regionColumns;
		if (col >= 0 && col <= 2) {
			regionColumns = [0, 1, 2];
		} else if (col >= 3 && col <= 5) {
			regionColumns = [3, 4, 5];
		} else if (col >= 6 && col <= 8) {
			regionColumns = [6, 7, 8];
		}

		var cellsInRegion = [];
		for (var r = regionRows[0]; r < regionRows[2] + 1; r++ ) {
			for (var c = regionColumns[0]; c < regionColumns[2] + 1; c++ ) {
		 		cellsInRegion.push(getCellInPosition(r, c));
		 	}
		}
		return cellsInRegion;
	}
	var getAllCellsInRow = function (rowNumber) {
		var retList = [];
		for (var i = 0; i < cache.length; i++) {
			if (cache[i].row === rowNumber) {
				retList.push(cache[i].cell);
			} else {
				i += 8;		
			}
		}
		return retList;
	}
	var getAllCellsInColumn = function (colNumber) {
		var retList = [];
		for (var i = 0; i < cache.length; i++) {
			if (cache[i].column === colNumber) {
				retList.push(cache[i].cell);
				i += 8;
			}
		}
		return retList;
	}

	var getNextCell = function ($cell) {
		var ind = parseInt($cell.attr("id").substring(3));
		var cachedItem = cache[ind + 1];
		if (cachedItem) {
			return cachedItem.cell;
		}
	}
	var getPreviousCell = function ($cell) {
		var ind = parseInt($cell.attr("id").substring(3));
		var cachedItem = cache[ind - 1];
		if (cachedItem) {
			return cachedItem.cell;
		}
	}

	var validateRows = function (value, $cell) {
		var validation = true;
		var cellsToValidate = getAllCellsInRow(getCellRow($cell));

		for (var i = 0; i < cellsToValidate.length; i++) {
			validation = validation && cellsToValidate[i].val() != value;
			if (!validation) {
				break;
			}
		}
		return validation;
	}
	var validateColumns = function (value, $cell) {
		var validation = true;
		var cellsToValidate = getAllCellsInColumn(getCellColumn($cell));

		for (var i = 0; i < cellsToValidate.length; i++) {
			validation = validation && cellsToValidate[i].val() != value;
			if (!validation) {
				break;
			}
		}
		return validation;
	}
	var validateRegion = function (value, $cell) {
		var validation = true;
		var cellsToValidate = getAllCellsInSameRegion($cell);

		for (var i = 0; i < cellsToValidate.length; i++) {
			validation = validation && cellsToValidate[i].val() != value;
			if (!validation) {
				break;
			}
		}
		return validation;
	}
	var validate = function (value, $cell) {
		return validateColumns(value, $cell)
			&& validateRows(value, $cell)
			&& validateRegion(value, $cell);
	}

	var tryValueOnCell = function (value, $cell, back) {
		if (!$cell) {
			console.timeEnd('sudoku');
			alert("Listo!");
			return;
		}
		if (STOP) {
			return;
		}
		if ($cell.hasClass('written')) {
			if (back) {
				var prevCell = getPreviousCell($cell);
				tryValueOnCell(parseInt(prevCell.val()) + 1, prevCell, true);
			} else {
				tryValueOnCell(value, getNextCell($cell));
			}
			return;
		}
		if (value > 9) {
			$cell.val(null);
			var prevCell = getPreviousCell($cell);
			tryValueOnCell(parseInt(prevCell.val()) + 1, prevCell, true);
			return;
		}
		if (validate(value, $cell)) {
			$cell.val(value);
			setTimeout(function(){
				tryValueOnCell(1, getNextCell($cell));
    		}, timeToStop);
		} else if (value !== 9) {
			tryValueOnCell(value + 1, $cell);
		} else {
			$cell.val(null);
			var prevCell = getPreviousCell($cell);
			tryValueOnCell(parseInt(prevCell.val()) + 1, prevCell, true);
		}
	}

	buildSudoku();
	console.time('sudoku');
	tryValueOnCell(1, getCellInPosition(0, 0));
}

var STOP;

var stopResolver = function () {
	STOP = true;
	setTimeout(function () {
		for (var x = 0; x < 9; x++) {
			for (var y = 0; y < 9; y++) {
				var cell = getCellInPosition(x, y);
				if (!cell.hasClass('written')) {
					cell.val(null);
				}
			}
		}
	}, 250);

	$('.timer').show();
	$('.timer-label').show();
	$('.stopButton').hide();
	$('.startButton').show();
	$('.cleanButton').show();
}

var clean = function () {
	for (var x = 0; x < 9; x++) {
		for (var y = 0; y < 9; y++) {
			var cell = getCellInPosition(x, y);
			cell.val(null);
			while (cell.hasClass('written')) {
				cell.removeClass('written');
			}
		}
	}	
}