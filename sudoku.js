
var validate = false;

$(document).ready(function() {

	// <INIT TABLE>

	var mainContainer = $('.main-container');
	for (var x = 0; x < 9; x++) {
		for (var y = 0; y < 9; y++) {
			var cell = "<input type='text' class='cell row" + x + " col" + y + "'></input>";
			mainContainer.append(cell);
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
	return $('.row' + rowNumber + '.col' + colNumber).eq(0);
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
		var sudokuRegions = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
		var row = getCellRow($cell);
		var col = getCellColumn($cell);

		var regionRows;
		var regionColumns;

		$(sudokuRegions).each(function (index, elem) {
			if ($.inArray(row, elem) !== -1) {
				regionRows = elem;
			}
			if ($.inArray(col, elem) !== -1) {
				regionColumns = elem;
			}
		});

		var cellsInRegion = [];
		$(regionRows).each(function (index, rowNumber) {
			$(regionColumns).each(function (indexx, colNumber) {
				cellsInRegion.push(getCellInPosition(rowNumber, colNumber));
			});
		});

		return $(cellsInRegion);
	}
	var getAllCellsInRow = function (rowNumber) {
		return $('.row' + rowNumber);
	}
	var getAllCellsInColumn = function (colNumber) {
		return $('.col' + colNumber);
	}

	var getNextCell = function ($cell) {
		var row = getCellRow($cell);
		var col = getCellColumn($cell);
		if (col !== 8) {
			return getCellInPosition(row, col + 1);
		} else {
			return getCellInPosition(row + 1, 0);
		}
	}
	var getPreviousCell = function ($cell) {
		var row = getCellRow($cell);
		var col = getCellColumn($cell);
		if (col !== 0) {
			return getCellInPosition(row, col - 1);
		} else {
			return getCellInPosition(row - 1, 8);
		}
	}

	var validateRows = function (value, $cell) {
		var validation = true;
		getAllCellsInRow(getCellRow($cell)).each(function (index, elem) {
			validation = validation && $(elem).val() != value;
		});
		return validation;
	}
	var validateColumns = function (value, $cell) {
		var validation = true;
		getAllCellsInColumn(getCellColumn($cell)).each(function (index, elem) {
			validation = validation && $(elem).val() != value;
		});
		return validation;
	}
	var validateRegion = function (value, $cell) {
		var validation = true;
		getAllCellsInSameRegion($cell).each(function (index, elem) {
			validation = validation && $(elem).val() != value;
		});
		return validation;
	}
	var validate = function (value, $cell) {
		return validateColumns(value, $cell)
			&& validateRows(value, $cell)
			&& validateRegion(value, $cell);
	}

	var tryValueOnCell = function (value, $cell, back) {
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