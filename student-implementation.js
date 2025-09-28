/**
 * WORDLE CLONE - STUDENT IMPLEMENTATION
 * 
 * Complete the functions below to create a working Wordle game.
 * Each function has specific requirements and point values.
 * 
 * GRADING BREAKDOWN:
 * - Core Game Functions (60 points): initializeGame, handleKeyPress, submitGuess, checkLetter, updateGameState
 * - Advanced Features (30 points): updateKeyboardColors, processRowReveal, showEndGameModal, validateInput
 */

// ========================================
// CORE GAME FUNCTIONS (60 POINTS TOTAL)
// ========================================

/**
 * Initialize a new game
 * POINTS: 10
 * 
 * TODO: Complete this function to:
 * - Reset all game state variables
 * - Get a random word from the word list
 * - Clear the game board
 * - Hide any messages or modals
 */
function initializeGame() { 
        // Reset game state variables
        currentWord = WordleWords.getRandomWord();
        currentGuess = '';
        currentRow = 0;
        gameOver = false;
        gameWon = false;
        
        // Reset the game board
        resetBoard();
        
        // Hide any messages
        hideModal();
        messageElement.classList.add('hidden');
    }
    
    /**
     * Handle keyboard input
     * POINTS: 15
     * 
     * TODO: Complete this function to:
     * - Process letter keys (A-Z)
     * - Handle ENTER key for word submission
     * - Handle BACKSPACE for letter deletion
     * - Update the display when letters are added/removed
     */
    function handleKeyPress(key) {
        // Check if game is over - if so, return early
        if (gameOver) return;
        
        // Handle letter keys (A-Z)
        if (/^[A-Z]$/.test(key)) {
            if (currentGuess.length < WORD_LENGTH) {
                currentGuess += key;
                const tile = getTile(currentRow, currentGuess.length - 1);
                updateTileDisplay(tile, key);
            }
        }
        // Handle ENTER key
        else if (key === 'ENTER') {
            if (isGuessComplete()) {
                submitGuess();
            } else {
                showMessage('Not enough letters', 'error');
            }
        }
        // Handle BACKSPACE key
        else if (key === 'BACKSPACE') {
            if (currentGuess.length > 0) {
                const tile = getTile(currentRow, currentGuess.length - 1);
                updateTileDisplay(tile, '');
                currentGuess = currentGuess.slice(0, -1);
            }
        }
    }
    
    /**
     * Submit and process a complete guess
     * POINTS: 20
     * 
     * TODO: Complete this function to:
     * - Validate the guess is a real word
     * - Check each letter against the target word
     * - Update tile colors and keyboard
     * - Handle win/lose conditions
     */
    function submitGuess() {
        // Validate guess is complete
        if (!isGuessComplete()) return;
        
        // Validate guess is a real word
        if (!WordleWords.isValidWord(currentGuess)) {
            showMessage('Not a valid word', 'error');
            shakeRow(currentRow);
            return;
        }
        
        // Check each letter and get results
        const results = [];
        for (let i = 0; i < WORD_LENGTH; i++) {
            results.push(checkLetter(currentGuess[i], i, currentWord));
        }
        
        // Update tile colors immediately
        for (let i = 0; i < WORD_LENGTH; i++) {
            const tile = getTile(currentRow, i);
            setTileState(tile, results[i]);
        }
        
        // Update keyboard colors
        updateKeyboardColors(currentGuess, results);
        
        // Check if guess was correct
        const isCorrect = currentGuess === currentWord;
        
        // Update game state
        updateGameState(isCorrect);
        
        // Move to next row if game continues
        if (!gameOver) {
            currentRow++;
            currentGuess = '';
        }
    }
    
    /**
     * Check a single letter against the target word
     * POINTS: 10
     * 
     * TODO: Complete this function to:
     * - Return 'correct' if letter matches position exactly
     * - Return 'present' if letter exists but wrong position
     * - Return 'absent' if letter doesn't exist in target
     * - Handle duplicate letters correctly (this is the tricky part!)
     */
    function checkLetter(guessLetter, position, targetWord) {
        // Convert inputs to uppercase for comparison
        const letter = guessLetter.toUpperCase();
        const target = targetWord.toUpperCase();
        
        // Check if letter is in correct position
        if (target[position] === letter) {
            return 'correct';
        }
        
        // Check if letter exists elsewhere in target
        if (target.includes(letter)) {
            // Handle duplicate letters correctly
            // Count how many times this letter appears in the target word
            const targetCount = WordleWords.countLetter(letter, target);
            
            // Count how many times this letter appears in the guess up to this position
            let guessCount = 0;
            for (let i = 0; i <= position; i++) {
                if (currentGuess[i].toUpperCase() === letter) {
                    guessCount++;
                }
            }
            
            // Count how many correct positions this letter has in the guess
            let correctCount = 0;
            for (let i = 0; i < WORD_LENGTH; i++) {
                if (currentGuess[i].toUpperCase() === letter && target[i] === letter) {
                    correctCount++;
                }
            }
            
            // Only mark as present if we haven't exceeded the target count
            if (guessCount <= targetCount) {
                return 'present';
            }
        }
        
        return 'absent';
    }
    
    /**
     * Update game state after a guess
     * POINTS: 5
     * 
     * TODO: Complete this function to:
     * - Check if player won (guess matches target)
     * - Check if player lost (used all attempts)
     * - Show appropriate end game modal
     */
    function updateGameState(isCorrect) {
        // Handle win condition
        if (isCorrect) {
            gameWon = true;
            gameOver = true;
            showEndGameModal(true, currentWord);
        }
        // Handle lose condition
        else if (currentRow >= MAX_GUESSES - 1) {
            gameOver = true;
            showEndGameModal(false, currentWord);
        }
    }
    
    // ========================================
    // ADVANCED FEATURES (30 POINTS TOTAL)
    // ========================================
    
    /**
     * Update keyboard key colors based on guessed letters
     * POINTS: 10
     * 
     * TODO: Complete this function to:
     * - Update each key with appropriate color
     * - Maintain color priority (green > yellow > gray)
     * - Don't downgrade key colors
     */
    function updateKeyboardColors(guess, results) {
        // Loop through each letter in the guess
        for (let i = 0; i < guess.length; i++) {
            const letter = guess[i].toUpperCase();
            const result = results[i];
            
            // Get the keyboard key element
            const keyElement = document.querySelector(`[data-key="${letter}"]`);
            if (!keyElement) continue;
            
            // Apply color with priority system
            // Don't change green keys to yellow or gray
            // Don't change yellow keys to gray
            if (result === 'correct') {
                keyElement.classList.remove('present', 'absent');
                keyElement.classList.add('correct');
            } else if (result === 'present' && !keyElement.classList.contains('correct')) {
                keyElement.classList.remove('absent');
                keyElement.classList.add('present');
            } else if (result === 'absent' && !keyElement.classList.contains('correct') && !keyElement.classList.contains('present')) {
                keyElement.classList.add('absent');
            }
        }
    }
    
    /**
     * Process row reveal (simplified - no animations needed)
     * POINTS: 5 (reduced from 15 since animations removed)
     * 
     * TODO: Complete this function to:
     * - Check if all letters were correct
     * - Trigger celebration if player won this round
     */
    function processRowReveal(rowIndex, results) {
        // Check if all results are 'correct'
        if (results.every(result => result === 'correct')) {
            // If all correct, trigger celebration
            celebrateRow(rowIndex);
        }
    }
    
    /**
     * Show end game modal with results
     * POINTS: 10
     * 
     * TODO: Complete this function to:
     * - Display appropriate win/lose message
     * - Show the target word
     * - Update game statistics
     */
    function showEndGameModal(won, targetWord) {
        // Create appropriate message based on won parameter
        if (won) {
            const guessesUsed = currentRow + 1;
            const guessText = guessesUsed === 1 ? 'guess' : 'guesses';
            showModal(true, targetWord, guessesUsed);
        } else {
            showModal(false, targetWord);
        }
        
        // Update statistics
        updateStats(won);
    }
    
    /**
     * Validate user input before processing
     * POINTS: 5
     * 
     * TODO: Complete this function to:
     * - Check if game is over
     * - Validate letter keys (only if guess not full)
     * - Validate ENTER key (only if guess complete)
     * - Validate BACKSPACE key (only if letters to remove)
     */
    function validateInput(key, currentGuess) {
        // Return false if game is over
        if (gameOver) return false;
        
        // Handle letter keys
        if (/^[A-Z]$/.test(key)) {
            return currentGuess.length < WORD_LENGTH;
        }
        
        // Handle ENTER key
        if (key === 'ENTER') {
            return currentGuess.length === WORD_LENGTH;
        }
        
        // Handle BACKSPACE key
        if (key === 'BACKSPACE') {
            return currentGuess.length > 0;
        }
        
        return false;
    }
    


// Uncomment these lines for debugging help:
// console.log('Current word:', currentWord);
// console.log('Current guess:', currentGuess);
// console.log('Current row:', currentRow);

console.log('Student implementation template loaded. Start implementing the functions above!'); 