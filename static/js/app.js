// Semantic Hunter Game Frontend

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const guessInput = document.getElementById('guess-input');
    const guessBtn = document.getElementById('guess-btn');
    const messageArea = document.getElementById('message-area');
    const guessesList = document.getElementById('guesses-list');
    const newGameBtn = document.getElementById('new-game-btn');
    const giveUpBtn = document.getElementById('give-up-btn');

    // Game state
    let gameActive = false;
    let latestGuessId = null;
    let allGuesses = [];
    let currentPage = 1;
    const itemsPerPage = 7;

    // Initialize game
    initGame();

    // Event listeners
    guessBtn.addEventListener('click', submitGuess);
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitGuess();
    });
    newGameBtn.addEventListener('click', initGame);
    giveUpBtn.addEventListener('click', giveUp);

    // Functions
    function initGame() {
        fetch('/new-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                gameActive = true;
                guessesList.innerHTML = '';
                messageArea.innerHTML = '';
                guessInput.value = '';
                guessInput.focus();
                allGuesses = [];
                currentPage = 1;
                latestGuessId = null;
                messageArea.innerHTML = `<p class="message">游戏开始! 尝试猜测秘密词语!</p>`;
            } else {
                showError(data.message || '初始化游戏时出错');
            }
        })
        .catch(err => {
            showError('无法连接到服务器');
            console.error(err);
        });
    }

    function submitGuess() {
        const guess = guessInput.value.trim();
        if (!guess) return;
        if (!gameActive) {
            showError('游戏未开始，请点击新游戏');
            return;
        }

        // Check if this word has already been guessed, but just proceed silently
        const alreadyGuessed = allGuesses.some(g => g.word === guess) || 
                              (latestGuessId && latestGuessId === guess);

        // Always send the request to get similarity, but we'll handle duplicates when updating the UI
        fetch('/guess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ guess })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // If the word was already guessed, just update the latest guess display
                // without adding a duplicate to the history
                if (alreadyGuessed) {
                    // Find this guess in our existing data to get its similarity
                    const existingGuess = allGuesses.find(g => g.word === guess);
                    if (existingGuess) {
                        // Show just the latest guess with this word
                        updateLatestGuess({
                            word: guess,
                            similarity: existingGuess.similarity,
                            is_correct: existingGuess.is_correct
                        });
                        
                        // Show similarity message
                        showMessage(`相似度: ${existingGuess.similarity}%`);
                    }
                } else {
                    // Normal flow for new guesses
                    updateGuessList(data.guesses, guess);
                    
                    if (data.is_correct) {
                        gameActive = false;
                        showSuccess(`恭喜你猜对了! 秘密词语是: ${guess}`);
                    } else {
                        showMessage(`相似度: ${data.similarity}%`);
                    }
                }
                
                // Always update latest guess ID and clear input
                latestGuessId = guess;
                guessInput.value = '';
                guessInput.focus();
            } else {
                showError(data.message || '提交猜测时出错');
            }
        })
        .catch(err => {
            showError('无法连接到服务器');
            console.error(err);
        });
    }

    function giveUp() {
        if (!gameActive) {
            showError('游戏未开始，请点击新游戏');
            return;
        }

        fetch('/give-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                gameActive = false;
                showError(`你放弃了! 秘密词语是: ${data.secret_word}`);
            } else {
                showError(data.message || '放弃游戏时出错');
            }
        })
        .catch(err => {
            showError('无法连接到服务器');
            console.error(err);
        });
    }

    function updateGuessList(guesses, latestGuess) {
        guessesList.innerHTML = '';
        
        // Create a copy of the guesses array to avoid modifying the original
        const sortedGuesses = [...guesses];
        
        // Find the latest guess and remove it from the sorted array
        const latestGuessIndex = sortedGuesses.findIndex(g => g.word === latestGuess);
        let latestGuessItem = null;
        if (latestGuessIndex !== -1) {
            latestGuessItem = sortedGuesses.splice(latestGuessIndex, 1)[0];
        }
        
        // Sort the remaining guesses by similarity (descending)
        sortedGuesses.sort((a, b) => b.similarity - a.similarity);
        
        // Update our allGuesses array for pagination
        allGuesses = sortedGuesses;
        
        // If we have a latest guess, add it to the top of the list
        if (latestGuessItem) {
            // Create a container for the latest guess
            const latestGuessContainer = document.createElement('div');
            latestGuessContainer.className = 'latest-guess-container';
            
            // Add the latest guess with a different style
            const latestGuessElement = document.createElement('div');
            latestGuessElement.className = 'latest-guess';
            
            // Add perfect-match class if 100% similarity
            if (latestGuessItem.similarity === 100) {
                latestGuessElement.classList.add('perfect-match');
            }
            
            // Determine similarity color class
            let similarityClass = getSimilarityClass(latestGuessItem.similarity);
            
            latestGuessElement.innerHTML = `
                <span class="guess-word">${latestGuessItem.word}</span>
                <span class="guess-similarity ${similarityClass}">${latestGuessItem.similarity}%</span>
            `;
            
            latestGuessContainer.appendChild(latestGuessElement);
            
            // Add separator line
            const separator = document.createElement('div');
            separator.className = 'guess-separator';
            latestGuessContainer.appendChild(separator);
            
            guessesList.appendChild(latestGuessContainer);
        }
        
        // Create a container for history guesses
        const historyContainer = document.createElement('div');
        historyContainer.className = 'history-guesses-container';
        
        // Get current page of items
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, allGuesses.length);
        const currentPageItems = allGuesses.slice(startIndex, endIndex);
        
        // Add the current page of guesses
        currentPageItems.forEach(guess => {
            const guessItem = document.createElement('div');
            guessItem.className = 'guess-item';
            
            // Add perfect-match class if 100% similarity
            if (guess.similarity === 100) {
                guessItem.classList.add('perfect-match');
            }
            
            // Determine similarity color class
            let similarityClass = getSimilarityClass(guess.similarity);
            
            guessItem.innerHTML = `
                <span class="guess-word">${guess.word}</span>
                <span class="guess-similarity ${similarityClass}">${guess.similarity}%</span>
            `;
            
            historyContainer.appendChild(guessItem);
        });
        
        guessesList.appendChild(historyContainer);
        
        // Add pagination if we have more than one page
        if (allGuesses.length > itemsPerPage) {
            addPagination();
        }
    }
    
    function addPagination() {
        const totalPages = Math.ceil(allGuesses.length / itemsPerPage);
        
        // Create pagination container
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn prev-btn';
        prevBtn.innerHTML = `<i class="fas fa-chevron-left"></i>`;
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateGuessList(allGuesses.concat([]), ''); // Pass empty string for latestGuess to avoid highlighting
            }
        });
        
        // Page indicator
        const pageIndicator = document.createElement('div');
        pageIndicator.className = 'page-indicator';
        pageIndicator.textContent = `${currentPage} / ${totalPages}`;
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn next-btn';
        nextBtn.innerHTML = `<i class="fas fa-chevron-right"></i>`;
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateGuessList(allGuesses.concat([]), ''); // Pass empty string for latestGuess to avoid highlighting
            }
        });
        
        // Append buttons to container
        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageIndicator);
        paginationContainer.appendChild(nextBtn);
        
        // Add to the DOM
        guessesList.appendChild(paginationContainer);
    }

    function showMessage(msg) {
        messageArea.innerHTML = `<p class="message">${msg}</p>`;
    }

    function showError(msg) {
        messageArea.innerHTML = `<p class="message error">${msg}</p>`;
    }

    function showSuccess(msg) {
        messageArea.innerHTML = `<p class="message success">${msg}</p>`;
    }

    // Function to determine similarity class based on percentage
    function getSimilarityClass(similarity) {
        if (similarity === 100) {
            return 'similarity-perfect';
        } else if (similarity >= 90) {
            return 'similarity-super-high';
        } else if (similarity >= 80) {
            return 'similarity-very-high';
        } else if (similarity >= 70) {
            return 'similarity-high';
        } else if (similarity >= 50) {
            return 'similarity-medium';
        } else {
            return 'similarity-low';
        }
    }

    // Function to just update the latest guess display without changing history
    function updateLatestGuess(guessItem) {
        // Remove existing latest guess container if it exists
        const existingContainer = document.querySelector('.latest-guess-container');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        // Create a new container for the latest guess
        const latestGuessContainer = document.createElement('div');
        latestGuessContainer.className = 'latest-guess-container';
        
        // Add the latest guess with its style
        const latestGuessElement = document.createElement('div');
        latestGuessElement.className = 'latest-guess';
        
        // Add perfect-match class if 100% similarity
        if (guessItem.similarity === 100) {
            latestGuessElement.classList.add('perfect-match');
        }
        
        // Determine similarity color class
        let similarityClass = getSimilarityClass(guessItem.similarity);
        
        latestGuessElement.innerHTML = `
            <span class="guess-word">${guessItem.word}</span>
            <span class="guess-similarity ${similarityClass}">${guessItem.similarity}%</span>
        `;
        
        latestGuessContainer.appendChild(latestGuessElement);
        
        // Add separator line
        const separator = document.createElement('div');
        separator.className = 'guess-separator';
        latestGuessContainer.appendChild(separator);
        
        // Add to DOM before the history container
        const historyContainer = document.querySelector('.history-guesses-container');
        if (historyContainer) {
            guessesList.insertBefore(latestGuessContainer, historyContainer);
        } else {
            guessesList.appendChild(latestGuessContainer);
        }
    }
}); 