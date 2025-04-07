// Semantic Hunter Game Frontend

/**
 * UI类 - 负责DOM操作和UI渲染
 */
class SemanticHunterUI {
    constructor() {
        // DOM元素
        this.guessInput = document.getElementById('guess-input');
        this.guessBtn = document.getElementById('guess-btn');
        this.messageArea = document.getElementById('message-area');
        this.guessesList = document.getElementById('guesses-list');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.itemsPerPage = 7;
    }

    // 清空输入框并聚焦
    clearAndFocusInput() {
        this.guessInput.value = '';
        this.guessInput.focus();
    }

    // 获取输入值
    getInputValue() {
        return this.guessInput.value.trim();
    }

    // 显示消息
    showMessage(msg) {
        this.messageArea.innerHTML = `<p class="message">${msg}</p>`;
    }

    // 显示错误消息
    showError(msg) {
        this.messageArea.innerHTML = `<p class="message error">${msg}</p>`;
    }

    // 显示成功消息
    showSuccess(msg) {
        this.messageArea.innerHTML = `<p class="message success">${msg}</p>`;
    }

    // 重置猜测列表
    resetGuessList() {
        this.guessesList.innerHTML = '';
        this.messageArea.innerHTML = '';
    }

    // 获取相似度样式类
    getSimilarityClass(similarity) {
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

    // 渲染猜测列表，包括最新猜测和历史猜测
    renderGuessList(guesses, latestGuess, currentPage) {
        this.guessesList.innerHTML = '';
        
        // 渲染最新猜测（如果有）
        if (latestGuess) {
            this.renderLatestGuess(latestGuess, guesses);
        }
        
        // 渲染历史猜测列表
        this.renderHistoryGuesses(guesses, latestGuess, currentPage);
        
        return guesses;
    }
    
    // 渲染最新猜测（置顶显示）
    renderLatestGuess(latestGuess, guesses) {
        // 寻找最新猜测的详细信息
        const latestGuessData = guesses.find(g => g.word === latestGuess.word);
        if (!latestGuessData) return;
        
        // 创建最新猜测的容器
        const latestGuessContainer = document.createElement('div');
        latestGuessContainer.className = 'latest-guess-container';
        
        // 添加最新猜测并使用不同样式
        const latestGuessElement = document.createElement('div');
        latestGuessElement.className = 'latest-guess';
        
        // 如果100%匹配，添加perfect-match类
        if (latestGuessData.similarity === 100) {
            latestGuessElement.classList.add('perfect-match');
        }
        
        // 确定相似度颜色类
        const similarityClass = this.getSimilarityClass(latestGuessData.similarity);
        
        latestGuessElement.innerHTML = `
            <span class="guess-word">${latestGuessData.word}</span>
            <span class="guess-similarity ${similarityClass}">${latestGuessData.similarity}%</span>
        `;
        
        latestGuessContainer.appendChild(latestGuessElement);
        
        // 添加分隔线
        const separator = document.createElement('div');
        separator.className = 'guess-separator';
        latestGuessContainer.appendChild(separator);
        
        this.guessesList.appendChild(latestGuessContainer);
    }
    
    // 渲染历史猜测列表
    renderHistoryGuesses(guesses, latestGuess, currentPage) {
        // 创建历史猜测的容器
        const historyContainer = document.createElement('div');
        historyContainer.className = 'history-guesses-container';
        
        // 获取当前页的项目
        const startIndex = (currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, guesses.length);
        const currentPageItems = guesses.slice(startIndex, endIndex);
        
        // 添加当前页的猜测
        currentPageItems.forEach(guess => {
            // 如果有最新猜测且与当前历史猜测相同，则跳过（避免重复显示）
            if (latestGuess && guess.word === latestGuess.word) {
                return;
            }
            
            const guessItem = document.createElement('div');
            guessItem.className = 'guess-item';
            
            // 如果100%匹配，添加perfect-match类
            if (guess.similarity === 100) {
                guessItem.classList.add('perfect-match');
            }
            
            // 确定相似度颜色类
            const similarityClass = this.getSimilarityClass(guess.similarity);
            
            guessItem.innerHTML = `
                <span class="guess-word">${guess.word}</span>
                <span class="guess-similarity ${similarityClass}">${guess.similarity}%</span>
            `;
            
            historyContainer.appendChild(guessItem);
        });
        
        this.guessesList.appendChild(historyContainer);
    }

    // 添加分页控件
    addPagination(allGuesses, currentPage, onPageChange) {
        const totalPages = Math.ceil(allGuesses.length / this.itemsPerPage);
        if (totalPages <= 1) return; // 如果只有一页，不显示分页控件
        
        // 创建分页容器
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        
        // 上一页按钮
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn prev-btn';
        prevBtn.innerHTML = `<i class="fas fa-chevron-left"></i>`;
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                onPageChange(currentPage - 1);
            }
        });
        
        // 页面指示器
        const pageIndicator = document.createElement('div');
        pageIndicator.className = 'page-indicator';
        pageIndicator.textContent = `${currentPage} / ${totalPages}`;
        
        // 下一页按钮
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn next-btn';
        nextBtn.innerHTML = `<i class="fas fa-chevron-right"></i>`;
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
            }
        });
        
        // 将按钮添加到容器
        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageIndicator);
        paginationContainer.appendChild(nextBtn);
        
        // 添加到DOM
        this.guessesList.appendChild(paginationContainer);
    }
}

/**
 * API类 - 负责与后端通信
 */
class SemanticHunterAPI {
    // 获取当前游戏状态
    async getGameStatus() {
        try {
            const response = await fetch('/game-status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('获取游戏状态时出错:', error);
            throw new Error('无法连接到服务器');
        }
    }

    // 初始化新游戏
    async initGame() {
        try {
            const response = await fetch('/new-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('初始化游戏时出错:', error);
            throw new Error('无法连接到服务器');
        }
    }

    // 提交猜测
    async submitGuess(guess) {
        try {
            const response = await fetch('/guess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ guess })
            });
            return await response.json();
        } catch (error) {
            console.error('提交猜测时出错:', error);
            throw new Error('无法连接到服务器');
        }
    }
}

/**
 * 游戏控制器 - 处理游戏逻辑
 */
class SemanticHunterGame {
    constructor() {
        this.ui = new SemanticHunterUI();
        this.api = new SemanticHunterAPI();
        
        // 游戏状态
        this.gameActive = true; // 默认假设游戏是活跃的
        this.latestGuess = null; // 只在前端存储最新猜测
        this.allGuesses = [];    // 所有猜测历史
        this.currentPage = 1;    // 当前分页
        
        // 初始设置新游戏按钮为禁用状态
        this.ui.newGameBtn.disabled = true;
        
        // 初始化事件监听器
        this.initEventListeners();
        
        // 加载游戏状态
        this.loadGameStatus();
    }

    // 初始化事件监听器
    initEventListeners() {
        this.ui.guessBtn.addEventListener('click', () => this.submitGuess());
        this.ui.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitGuess();
        });
        this.ui.newGameBtn.addEventListener('click', () => this.initGame());
    }

    // 加载游戏状态 - 从后端获取当前状态
    async loadGameStatus() {
        try {
            const data = await this.api.getGameStatus();
            if (data.status === 'success') {
                // 更新游戏状态
                this.allGuesses = data.guesses;
                this.gameActive = !data.has_correct_guess;
                
                // 如果有猜测历史，渲染它们
                if (this.allGuesses.length > 0) {
                    // 不指定最新猜测，所有猜测都在历史列表中显示
                    this.updateGuessList(this.allGuesses, null);
                    
                    // 如果已经猜对了
                    if (!this.gameActive) {
                        const correctGuess = this.allGuesses.find(g => g.is_correct);
                        if (correctGuess) {
                            this.ui.showSuccess(`有人已经猜对了! 秘密词语是: ${correctGuess.word}`);
                        }
                    } else {
                        this.ui.showMessage('游戏进行中! 尝试猜测秘密词语!');
                    }
                } else {
                    this.ui.showMessage('游戏开始! 尝试猜测秘密词语!');
                }
                
                // 更新新游戏按钮状态
                this.updateNewGameButton();
                
                // 清空输入框并聚焦
                this.ui.clearAndFocusInput();
            } else {
                this.ui.showError('获取游戏状态失败');
            }
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    // 初始化游戏 - 创建新游戏
    async initGame() {
        try {
            const data = await this.api.initGame();
            if (data.status === 'success') {
                this.gameActive = true;
                this.ui.resetGuessList();
                this.ui.clearAndFocusInput();
                this.allGuesses = [];
                this.latestGuess = null;
                this.currentPage = 1;
                this.ui.showMessage('新游戏开始! 尝试猜测秘密词语!');
                
                // 更新新游戏按钮状态
                this.updateNewGameButton();
            } else {
                this.ui.showError(data.message || '初始化游戏时出错');
            }
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    // 提交猜测
    async submitGuess() {
        const guessWord = this.ui.getInputValue();
        if (!guessWord) return;
        if (!this.gameActive) {
            this.ui.showError('游戏已结束，请点击新游戏');
            return;
        }

        try {
            const data = await this.api.submitGuess(guessWord);
            if (data.status === 'success') {
                // 更新猜测历史
                this.allGuesses = data.guesses;
                
                // 在前端存储最新的猜测
                this.latestGuess = {
                    word: guessWord,
                    similarity: data.similarity,
                    is_correct: data.is_correct
                };
                
                // 渲染猜测列表，将最新猜测置顶
                this.updateGuessList(this.allGuesses, this.latestGuess);
                
                // 根据猜测结果更新游戏状态和显示消息
                if (data.is_correct) {
                    this.gameActive = false;
                    this.ui.showSuccess(`恭喜你猜对了! 秘密词语是: ${guessWord}`);
                } else {
                    this.ui.showMessage(`相似度: ${data.similarity}%`);
                }
                
                // 更新新游戏按钮状态
                this.updateNewGameButton();
                
                // 清空输入框并聚焦
                this.ui.clearAndFocusInput();
            } else {
                this.ui.showError(data.message || '提交猜测时出错');
            }
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    // 更新猜测列表 - 同时处理最新猜测和历史猜测
    updateGuessList(guesses, latestGuess) {
        // 渲染猜测列表
        this.ui.renderGuessList(guesses, latestGuess, this.currentPage);
        
        // 如果有多页，添加分页控件
        if (guesses.length > this.ui.itemsPerPage) {
            this.ui.addPagination(guesses, this.currentPage, (newPage) => {
                this.currentPage = newPage;
                this.updateGuessList(guesses, latestGuess);
            });
        }
    }
    
    // 更新新游戏按钮状态
    updateNewGameButton() {
        // 检查是否有正确的猜测
        const hasCorrectGuess = this.allGuesses.some(guess => guess.is_correct);
        
        // 只有在游戏已结束（有正确猜测）时，新游戏按钮才可用
        this.ui.newGameBtn.disabled = !hasCorrectGuess;
    }
}

// 当DOM内容加载完成时初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SemanticHunterGame();
}); 