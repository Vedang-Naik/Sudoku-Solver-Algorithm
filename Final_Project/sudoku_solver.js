var board = [];

// ========================= This code describes the behaviour of the 'Solve' and 'Clear' buttons =============================== //
// ============================================================================================================================== //



$(document).ready(function() { //-------------------------------------------> Runs upon loading the whole page.
    
    $("#solve").on("click", function() { //---------------------------------> Programs the behaviour of the 'Solve' button.
    
        board = [];
        $("#notifications").html("");
        $("#notifications").css("color", "");
        
        var proper_input = inputBoard();
        if (!proper_input) {return false;}
        
        for (var index = 0; index <= 80; index++) {
            var valid = ValidityChecker(index);
            if (!valid) {
                $("#notifications").css("color", "red");
                $("#notifications").html("There are duplicates somewhere.");
                return false;
            }
        }
        
        var iterations = 0;
        
        t1 = performance.now();
        if (SolveBoard()) {
            DrawBoard();
            $("#notifications").html("");
            $("#notifications").css("color", "");
            $("#notifications").css("color", "green");
            $("#notifications").html("Solved using elimination!");
        }
        else {
            iterations = BackTrack();
            DrawBoard();
            $("#notifications").html("");
            $("#notifications").css("color", "");
            $("#notifications").css("color", "green");
            $("#notifications").html("Solved using brute-force method. Thanks for waiting!");
        }
        t2 = performance.now();
        
        if ((t2-t1) > 60000) {
            var time = ((t2-t1) / 1000 / 60).toFixed(2);
            $("#iterations").html("This sudoku took <strong> " + iterations + "</strong> iterations and <strong>" + time + "</strong> minutes to complete.");
        }
        else {
            time = ((t2-t1) / 1000).toFixed(2);
            $("#iterations").html("This sudoku took <strong> " + iterations + "</strong> iterations and <strong>" + time + "</strong> seconds to complete.");
        }
        
    });
    
    $("#clear").on("click", function() { //---------------------------------> Programs the behaviour of the 'Clear' button.
        clearBoard();
    });
    
});



// ============================================================================================================================== //
// ============================================================================================================================== //




// ================================= These functions allow the solver to run behind the browser ================================= //
//=============================================================================================================================== //



// ________________________________________________ CLEARBOARD: Clears the board ________________________________________________ //

function clearBoard() {
    $("#notifications").html("");
    $("#iterations").html("");
    $("input").each( function() {$(this).val('');} );
    board = [];
}



// ________________________________ INPUTBOARD: Inputs all values from the table into board _____________________________________ //

function inputBoard() {
    
    var proper_input = true;
    
    $("input").each(function(index) {
        if ($(this).val() == "") {
            board[index] = "-";
        }
        else if ($(this).val() > 9 || $(this).val() < 1) {
            $("#notifications").css("color", "red");
            $("#notifications").html("Number must be between 1 and 9.")
            board = [];
            proper_input = false;
            return false;
        }
        else {
            board[index] = $(this).val();
        }
    });
    
    if(proper_input) {return true;}
    else {return false;}
}



// ________________________ ROWCOLBOXMAKER: Generates all the rows, columnss and boxes from the board ___________________________ //

function RowColBoxMaker(index) {
    
    for (var i = 0; i <= 8; i++) {
        if (0 <= (index - (9 * i)) && (index - (9 * i)) <= 8) {            
            var rowstart = 9 * i;
            var rowend = rowstart + 8;
            break;
        }
    }
    
    var row = [];
    for (var i = rowstart; i <= rowend; i++) {
        row.push(board[i]);
    }
    
    for (var i = 0; i <= 8; i++) {
        if (0 <= (index - (9 * i)) && (index - (9 * i)) <= 8) {
            var colstart = index - (9 * i);
            var colend = colstart + 72;
            break;
        }
    }
    
    var col = [];
    for (var i = colstart; i <= colend; i += 9) {
        col.push(board[i]);
    }
    
    var boxstartvalues = [0, 3, 6, 27, 30, 33, 54, 57, 60];
    var boxstart;
    
    for (var value in boxstartvalues) {
        if (index == boxstartvalues[value] || index - 1 == boxstartvalues[value] || index - 2 == boxstartvalues[value]) {boxstart = boxstartvalues[value];}
        if (index - 9 == boxstartvalues[value] || index - 10 == boxstartvalues[value] || index - 11 == boxstartvalues[value]) {boxstart = boxstartvalues[value];}
        if (index - 18 == boxstartvalues[value] || index - 19 == boxstartvalues[value] || index - 20 == boxstartvalues[value]) {boxstart = boxstartvalues[value];}
    }
    
    box = [];
    
    box.push(board[boxstart]);
    box.push(board[boxstart + 1]);
    box.push(board[boxstart + 2]);
    box.push(board[boxstart + 9]);
    box.push(board[boxstart + 10]);
    box.push(board[boxstart + 11]);
    box.push(board[boxstart + 18]);
    box.push(board[boxstart + 19]);
    box.push(board[boxstart + 20]);
    
    
    return [row, col, box];
}



// _________________ VALIDITYCHECKER: Uses the data of all rows, columns and boxes to weed out invalid inputs. __________________ //

function ValidityChecker(index) {
    
    function findDuplicates(array) { //-------------------------------------> Finds duplicates. (http://stackoverflow.com/a/842326)
        var len = array.length;
        out = [];
        counts = {};

        for (var i = 0; i < len; i++) {
            var item = array[i];
            if (item == "-") {continue;}
            counts[item] = counts[item] >= 1 ? counts[item] + 1 : 1;
            if (counts[item] === 2) {return false;}
        }
        return true;
    }
        
    var row_col_box = RowColBoxMaker(index);
    var row = row_col_box[0];
    var col = row_col_box[1];
    var box = row_col_box[2];
    
    if (!findDuplicates(row) || !findDuplicates(col) || !findDuplicates(box)) {return false;}
    
    return true;
}


// ______ ALLPOSSIBILITIES: Uses VALIDITYCHECKER to deduce the possibilities for all cells, and fills those with only one. ______ //

function AllPossibilities(index) {
    
    var index_possibilities = [];
    
    for (var number = 1; number <= 9; number++) {
        if (board[index] == "-") {
            board[index] = number;
            
            if (!ValidityChecker(index)) {
                board[index] = "-";
                continue;
            }
            else {
                index_possibilities.push(number);
                board[index] = "-";
            }
            
        }
        else {
            index_possibilities.push("-");
            break;
        }
    }
    
    return index_possibilities;
}



// ________________________ DRAWBOARD: Fills all the input boxes with the contents of the board array ___________________________ //

function DrawBoard() {
   $("input").each(function(index) {
       if (board[index] !== "-") {$(this).val(board[index]);} 
   });
}



// ___________________________ SOLVED: Check if the board is solved by checking for empty spaces ________________________________ //

function Solved() {
    for (var i = 0; i <= 80; i++) {
        if (board[i] == "-") {return false;}
    }
    
    return true;
}



// ______________________________ SOLVEBOARD: Uses all the previous function to solve the board _________________________________ //

function SolveBoard() {
    
    var old_numberofints = 0;
    
    while (true) {
        var numberofints = 0;
        
        for (var index = 0; index <= 80; index ++) {
            if (AllPossibilities(index).length == 1 && AllPossibilities(index)[0] !== "-") {
                board[index] = AllPossibilities(index)[0];
            }
        }
        
        for (var index = 0; index <= 80; index++) {
            if (typeof(board[index]) == "number") {numberofints++;}
        }
        
        if (old_numberofints == numberofints) {
            return false;
        }
        
        if (Solved()) {return true;}
        
        old_numberofints = numberofints;
    }
}



// ______________________________ BACKTRACK: Uses brute-force to solve the board, if all else fails. ____________________________ //

function BackTrack() {
    board_filler = {};
    
    var old_index;
    var iterations = 0;
    
    for (var index = 0; index <= 80; index++) {
        iterations++;
        
        $("#terminate").on("click", function() {
            $("#notifications").html("");
            $("#notifications").css("color", "");
            $("#notifications").css("color", "red");
            $("#notifications").html("Algorithm stopped by user.");
            return false;
        });
        
        if (board[index] == "-") {
            if (AllPossibilities(index).length == 0) {
                old_index = Object.keys(board_filler)[Object.keys(board_filler).length - 1];
                for (var i = index; i >= old_index; i--) {
                    if (typeof(board[i]) != "string") {board[i] = "-";}
                    else {continue;}
                }
                
                index = old_index;
                
            }
            else {
                board_filler[index] = AllPossibilities(index);
            }
            
            board[index] = board_filler[index][0];
            board_filler[index].shift();
            
            if (board_filler[index].length == 0) {
                delete board_filler[index];
            }
        }
        else {continue;}
    }
    
    return iterations;
}


// ============================================================================================================================== //
// ============================================================================================================================== //


/**1. Make a dictionary to hold the locations of all open slots and their possibilities at the time they were filled.
 * 2. Go to the first empty slot and store the location of the slot and the possibilities [as an array] there in the dictionary. 
 * 3. Take the first possibility from the array and put it in the slot. Remove that number from the list of possibilities in the
 *    array holding all the possibilities.
 * 4. Continue in this fashion, storing the locations and possibilities at that location in the dictionary. Stop when you reach a
 *    a slot with no possibilities.
 * 5. When a slot with no possibilties is reached, go back down the dictionary to the nearest slot which has possibilities left,
 *    deleting from the board array as you go backward to that location.
 * 6. Start again from step 3. As soon as the length of possibilities reaches zero, which means that all have been tried, delete 
 *    the location entry from the dictionary. **/