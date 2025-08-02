// Measurement Module JavaScript
class MeasurementModule {
    constructor() {
        this.concepts = [];
        this.exercises = [];
        this.currentTab = 'concepts';
        this.userProgress = this.loadProgress();
        this.quizState = {
            currentQuestion: 0,
            selectedQuestions: [],
            answers: [],
            score: 0
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadModuleData();
            this.setupEventListeners();
            this.renderInitialContent();
        } catch (error) {
            this.showError('Failed to initialize module');
            console.error('Initialization error:', error);
        }
    }

    async loadModuleData() {
        try {
            const [conceptsResponse, exercisesResponse] = await Promise.all([
                fetch('./data/concepts.json'),
                fetch('./data/exercises.json')
            ]);

            if (!conceptsResponse.ok || !exercisesResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            this.concepts = await conceptsResponse.json();
            this.exercises = await exercisesResponse.json();

            this.hideLoading();
            this.showMainContent();
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to load module data');
            throw error;
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('onclick').match(/'(\w+)'/)[1];
                this.showTab(tabName);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('concept-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterConcepts());
        }

        // Difficulty filter
        const difficultyFilter = document.getElementById('difficulty-filter');
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => this.filterExercises());
        }

        // Quiz modal close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeQuiz();
            }
        });
    }

    renderInitialContent() {
        this.renderConcepts();
        this.renderExercises();
        this.updateProgress();
    }

    renderConcepts() {
        const container = document.getElementById('concepts-container');
        if (!container) return;

        container.innerHTML = this.concepts.map(concept => `
            <div class="concept-card" onclick="measurementModule.markConceptAsStudied('${concept.id}')">
                <div class="concept-title">${concept.title}</div>
                <div class="concept-description">${concept.description}</div>
                <div class="concept-topics">
                    ${concept.subtopics.map(topic => `
                        <span class="topic-tag">${topic}</span>
                    `).join('')}
                </div>
                ${this.userProgress.studiedConcepts.includes(concept.id) ? 
                    '<div class="concept-status">✓ Studied</div>' : ''}
            </div>
        `).join('');
    }

    renderExercises() {
        const container = document.getElementById('exercises-container');
        if (!container) return;

        container.innerHTML = this.exercises.map(exercise => `
            <div class="exercise-card">
                <div class="exercise-question">${exercise.question}</div>
                <div class="exercise-options">
                    ${exercise.options.map((option, index) => `
                        <div class="option" onclick="measurementModule.selectOption(this, '${exercise.id}', ${index})">
                            ${String.fromCharCode(65 + index)}. ${option}
                        </div>
                    `).join('')}
                </div>
                <div class="exercise-meta">
                    <span class="exercise-difficulty difficulty-${exercise.difficulty}">
                        ${exercise.difficulty}
                    </span>
                    <span class="exercise-topic">${exercise.topic}</span>
                </div>
            </div>
        `).join('');
    }

    filterConcepts() {
        const searchTerm = document.getElementById('concept-search').value.toLowerCase();
        const cards = document.querySelectorAll('.concept-card');

        cards.forEach(card => {
            const title = card.querySelector('.concept-title').textContent.toLowerCase();
            const description = card.querySelector('.concept-description').textContent.toLowerCase();
            const topics = Array.from(card.querySelectorAll('.topic-tag'))
                .map(tag => tag.textContent.toLowerCase()).join(' ');

            const matches = title.includes(searchTerm) || 
                          description.includes(searchTerm) || 
                          topics.includes(searchTerm);

            card.style.display = matches ? 'block' : 'none';
        });
    }

    filterExercises() {
        const difficulty = document.getElementById('difficulty-filter').value;
        const cards = document.querySelectorAll('.exercise-card');

        cards.forEach(card => {
            const cardDifficulty = card.querySelector('.exercise-difficulty').textContent.trim();
            const matches = difficulty === 'all' || cardDifficulty === difficulty;
            card.style.display = matches ? 'block' : 'none';
        });
    }

    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        if (tabName === 'progress') {
            this.updateProgress();
        }
    }

    selectOption(element, exerciseId, optionIndex) {
        // Remove previous selection
        element.parentNode.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Add selection to clicked option
        element.classList.add('selected');

        // Store answer
        const exercise = this.exercises.find(ex => ex.id === exerciseId);
        const isCorrect = optionIndex === exercise.correctAnswer;

        // Update progress
        if (!this.userProgress.attemptedQuestions.includes(exerciseId)) {
            this.userProgress.attemptedQuestions.push(exerciseId);
            if (isCorrect) {
                this.userProgress.correctAnswers.push(exerciseId);
            }
            this.saveProgress();
        }

        // Visual feedback
        setTimeout(() => {
            element.style.backgroundColor = isCorrect ? '#4CAF50' : '#f44336';
            element.style.color = 'white';
            
            if (!isCorrect) {
                const correctOption = element.parentNode.children[exercise.correctAnswer];
                correctOption.style.backgroundColor = '#4CAF50';
                correctOption.style.color = 'white';
            }
        }, 500);
    }

    markConceptAsStudied(conceptId) {
        if (!this.userProgress.studiedConcepts.includes(conceptId)) {
            this.userProgress.studiedConcepts.push(conceptId);
            this.saveProgress();
            this.renderConcepts();
        }
    }

    startQuiz() {
        // Select random questions
        const shuffled = [...this.exercises].sort(() => 0.5 - Math.random());
        this.quizState.selectedQuestions = shuffled.slice(0, 10);
        this.quizState.currentQuestion = 0;
        this.quizState.answers = [];
        this.quizState.score = 0;

        document.getElementById('quiz-modal').style.display = 'flex';
        this.renderQuizQuestion();
    }

    renderQuizQuestion() {
        const question = this.quizState.selectedQuestions[this.quizState.currentQuestion];
        
        document.getElementById('quiz-question').innerHTML = question.question;
        document.getElementById('quiz-options').innerHTML = question.options.map((option, index) => `
            <div class="quiz-option" onclick="measurementModule.selectQuizOption(this, ${index})">
                ${String.fromCharCode(65 + index)}. ${option}
            </div>
        `).join('');

        document.getElementById('quiz-current').textContent = this.quizState.currentQuestion + 1;
        document.getElementById('quiz-total').textContent = this.quizState.selectedQuestions.length;

        // Reset buttons
        document.getElementById('submit-answer').style.display = 'block';
        document.getElementById('next-question').style.display = 'none';
    }

    selectQuizOption(element, optionIndex) {
        // Remove previous selection
        element.parentNode.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Add selection
        element.classList.add('selected');
        this.quizState.selectedAnswer = optionIndex;
    }

    submitAnswer() {
        if (this.quizState.selectedAnswer === undefined) {
            alert('Please select an answer');
            return;
        }

        const question = this.quizState.selectedQuestions[this.quizState.currentQuestion];
        const isCorrect = this.quizState.selectedAnswer === question.correctAnswer;

        if (isCorrect) {
            this.quizState.score++;
        }

        this.quizState.answers.push({
            questionId: question.id,
            selectedAnswer: this.quizState.selectedAnswer,
            correct: isCorrect
        });

        // Show correct answer
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((option, index) => {
            if (index === question.correctAnswer) {
                option.style.backgroundColor = '#4CAF50';
                option.style.color = 'white';
            } else if (index === this.quizState.selectedAnswer && !isCorrect) {
                option.style.backgroundColor = '#f44336';
                option.style.color = 'white';
            }
        });

        document.getElementById('submit-answer').style.display = 'none';
        document.getElementById('next-question').style.display = 'block';
    }

    nextQuestion() {
        this.quizState.currentQuestion++;
        this.quizState.selectedAnswer = undefined;

        if (this.quizState.currentQuestion < this.quizState.selectedQuestions.length) {
            this.renderQuizQuestion();
        } else {
            this.showQuizResults();
        }
    }

    showQuizResults() {
        const percentage = Math.round((this.quizState.score / this.quizState.selectedQuestions.length) * 100);
        
        document.querySelector('.modal-body').innerHTML = `
            <div class="quiz-results">
                <h3>Quiz Complete!</h3>
                <div class="result-stats">
                    <div class="stat">Score: ${this.quizState.score}/${this.quizState.selectedQuestions.length}</div>
                    <div class="stat">Percentage: ${percentage}%</div>
                </div>
                <button onclick="measurementModule.closeQuiz()" class="close-quiz-btn">Close</button>
            </div>
        `;

        // Update progress
        this.userProgress.quizzesTaken++;
        this.userProgress.totalScore += this.quizState.score;
        this.saveProgress();
    }

    closeQuiz() {
        document.getElementById('quiz-modal').style.display = 'none';
        this.updateProgress();
    }

    updateProgress() {
        document.getElementById('concepts-progress').textContent = 
            `${this.userProgress.studiedConcepts.length}/${this.concepts.length}`;
        
        document.getElementById('questions-attempted').textContent = 
            this.userProgress.attemptedQuestions.length;

        const accuracy = this.userProgress.attemptedQuestions.length > 0 
            ? Math.round((this.userProgress.correctAnswers.length / this.userProgress.attemptedQuestions.length) * 100)
            : 0;
        
        document.getElementById('accuracy-rate').textContent = `${accuracy}%`;
    }

    loadProgress() {
        const saved = localStorage.getItem('measurement-progress');
        return saved ? JSON.parse(saved) : {
            studiedConcepts: [],
            attemptedQuestions: [],
            correctAnswers: [],
            quizzesTaken: 0,
            totalScore: 0
        };
    }

    saveProgress() {
        localStorage.setItem('measurement-progress', JSON.stringify(this.userProgress));
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError(message) {
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').querySelector('p').textContent = message;
    }

    showMainContent() {
        document.getElementById('main-content').style.display = 'block';
    }
}

// Global functions for HTML onclick handlers
function showTab(tabName) {
    measurementModule.showTab(tabName);
}

function filterConcepts() {
    measurementModule.filterConcepts();
}

function filterExercises() {
    measurementModule.filterExercises();
}

function startQuiz() {
    measurementModule.startQuiz();
}

function closeQuiz() {
    measurementModule.closeQuiz();
}

function loadModuleData() {
    location.reload();
}

// Initialize module when DOM is loaded
let measurementModule;
document.addEventListener('DOMContentLoaded', () => {
    measurementModule = new MeasurementModule();
});
