// Microcontroller Module JavaScript
// Interactive functionality for the microcontroller programming module

class MicrocontrollerModule {
    constructor() {
        this.progress = 0;
        this.currentQuizQuestion = 0;
        this.quizScore = 0;
        this.ledBlinking = false;
        this.ledInterval = null;
        
        this.quizQuestions = [
            {
                question: "What is the main difference between a microcontroller and a microprocessor?",
                options: [
                    "Microcontrollers have built-in memory and I/O",
                    "Microprocessors are faster",
                    "Microcontrollers are more expensive",
                    "There is no difference"
                ],
                correct: 0
            },
            {
                question: "How many I/O ports does the 8051 microcontroller have?",
                options: ["2", "3", "4", "5"],
                correct: 2
            },
            {
                question: "Which instruction is used to set a bit in 8051 assembly?",
                options: ["MOV", "SETB", "CLR", "ADD"],
                correct: 1
            },
            {
                question: "What is the program memory size of the basic 8051?",
                options: ["2KB", "4KB", "8KB", "16KB"],
                correct: 1
            },
            {
                question: "In railway signaling, what happens when a track is occupied?",
                options: [
                    "Green signal is shown",
                    "Red signal is shown",
                    "Yellow signal is shown",
                    "No signal is shown"
                ],
                correct: 1
            }
        ];
        
        this.init();
    }
    
    init() {
        this.updateProgress();
        this.setupNavigation();
        this.setupEventListeners();
        this.initializeQuiz();
        console.log('Microcontroller Module initialized');
    }
    
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Scroll to section
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
                
                // Update progress when section is visited
                this.updateProgress();
            });
        });
    }
    
    setupEventListeners() {
        // Track scroll to update active navigation
        window.addEventListener('scroll', () => {
            this.updateActiveNavigation();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    updateActiveNavigation() {
        const sections = document.querySelectorAll('.module-section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = section.id;
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    updateProgress() {
        const sections = document.querySelectorAll('.module-section');
        const visitedSections = new Set();
        
        // Check which sections have been scrolled to
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                visitedSections.add(section.id);
            }
        });
        
        const progressPercentage = Math.round((visitedSections.size / sections.length) * 100);
        
        const progressFill = document.getElementById('module-progress');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${progressPercentage}%`;
            progressText.textContent = `${progressPercentage}%`;
        }
        
        this.progress = progressPercentage;
    }
    
    handleResize() {
        // Responsive adjustments if needed
        console.log('Window resized, adjusting layout');
    }
    
    // LED Simulation Functions
    simulateLED() {
        const ledDisplay = document.getElementById('led-display');
        const simulateBtn = document.querySelector('.simulate-btn');
        
        if (!ledDisplay || !simulateBtn) return;
        
        if (this.ledBlinking) {
            // Stop simulation
            this.stopLEDSimulation();
            simulateBtn.textContent = 'Simulate LED';
        } else {
            // Start simulation
            this.startLEDSimulation();
            simulateBtn.textContent = 'Stop Simulation';
        }
    }
    
    startLEDSimulation() {
        const ledDisplay = document.getElementById('led-display');
        if (!ledDisplay) return;
        
        this.ledBlinking = true;
        let isOn = false;
        
        this.ledInterval = setInterval(() => {
            if (isOn) {
                ledDisplay.classList.remove('on');
                ledDisplay.classList.add('off');
                ledDisplay.textContent = '💡';
            } else {
                ledDisplay.classList.remove('off');
                ledDisplay.classList.add('on');
                ledDisplay.textContent = '💡';
            }
            isOn = !isOn;
        }, 500);
    }
    
    stopLEDSimulation() {
        if (this.ledInterval) {
            clearInterval(this.ledInterval);
            this.ledInterval = null;
        }
        
        this.ledBlinking = false;
        const ledDisplay = document.getElementById('led-display');
        if (ledDisplay) {
            ledDisplay.classList.remove('on', 'off');
            ledDisplay.textContent = '💡';
        }
    }
    
    // Code Checking Functions
    checkCode() {
        const codeInput = document.getElementById('code-input');
        const feedback = document.getElementById('code-feedback');
        
        if (!codeInput || !feedback) return;
        
        const code = codeInput.value.trim().toLowerCase();
        
        // Simple code validation
        const requiredElements = [
            'org 0000h',
            'p2.0',  // Track input
            'p1.0',  // Red signal
            'p1.1',  // Green signal
            'sjmp'   // Main loop
        ];
        
        const hasAllElements = requiredElements.every(element => 
            code.includes(element)
        );
        
        if (hasAllElements) {
            feedback.className = 'feedback success';
            feedback.textContent = '✓ Great! Your code includes all required elements for a basic signal control system.';
        } else {
            feedback.className = 'feedback error';
            const missing = requiredElements.filter(element => !code.includes(element));
            feedback.textContent = `✗ Missing elements: ${missing.join(', ')}. Make sure to include track input reading and signal output control.`;
        }
        
        feedback.style.display = 'block';
    }
    
    // Quiz Functions
    initializeQuiz() {
        this.currentQuizQuestion = 0;
        this.quizScore = 0;
        this.loadQuizQuestion();
    }
    
    loadQuizQuestion() {
        const questionEl = document.getElementById('current-question');
        const optionsEl = document.getElementById('quiz-options');
        const btnEl = document.getElementById('quiz-btn');
        const scoreEl = document.getElementById('quiz-score');
        
        if (!questionEl || !optionsEl || !btnEl) return;
        
        if (this.currentQuizQuestion >= this.quizQuestions.length) {
            // Quiz completed
            this.showQuizResults();
            return;
        }
        
        const question = this.quizQuestions[this.currentQuizQuestion];
        questionEl.textContent = question.question;
        
        optionsEl.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionEl = document.createElement('div');
            optionEl.className = 'option';
            optionEl.textContent = option;
            optionEl.onclick = () => this.selectOption(index);
            optionsEl.appendChild(optionEl);
        });
        
        btnEl.textContent = 'Next Question';
        btnEl.onclick = () => this.nextQuestion();
        
        if (scoreEl) {
            scoreEl.textContent = `Question ${this.currentQuizQuestion + 1} of ${this.quizQuestions.length}`;
        }
    }
    
    selectOption(selectedIndex) {
        const options = document.querySelectorAll('.option');
        
        // Remove previous selections
        options.forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // Mark selected option
        options[selectedIndex].classList.add('selected');
        
        // Store the selected answer
        this.selectedAnswer = selectedIndex;
    }
    
    nextQuestion() {
        if (this.selectedAnswer === undefined) {
            alert('Please select an answer before proceeding.');
            return;
        }
        
        const question = this.quizQuestions[this.currentQuizQuestion];
        const options = document.querySelectorAll('.option');
        
        // Show correct/incorrect
        options.forEach((option, index) => {
            if (index === question.correct) {
                option.classList.add('correct');
            } else if (index === this.selectedAnswer && index !== question.correct) {
                option.classList.add('incorrect');
            }
        });
        
        // Update score
        if (this.selectedAnswer === question.correct) {
            this.quizScore++;
        }
        
        // Move to next question after a delay
        setTimeout(() => {
            this.currentQuizQuestion++;
            this.selectedAnswer = undefined;
            this.loadQuizQuestion();
        }, 2000);
    }
    
    showQuizResults() {
        const questionEl = document.getElementById('current-question');
        const optionsEl = document.getElementById('quiz-options');
        const btnEl = document.getElementById('quiz-btn');
        const scoreEl = document.getElementById('quiz-score');
        
        if (!questionEl || !optionsEl || !btnEl || !scoreEl) return;
        
        const percentage = Math.round((this.quizScore / this.quizQuestions.length) * 100);
        
        questionEl.textContent = 'Quiz Completed!';
        optionsEl.innerHTML = '';
        
        let message = '';
        if (percentage >= 80) {
            message = 'Excellent! You have a strong understanding of microcontroller concepts.';
        } else if (percentage >= 60) {
            message = 'Good job! Review the topics you missed and try again.';
        } else {
            message = 'Keep studying! Review the module content and retake the quiz.';
        }
        
        scoreEl.innerHTML = `
            <h4>Your Score: ${this.quizScore}/${this.quizQuestions.length} (${percentage}%)</h4>
            <p>${message}</p>
        `;
        
        btnEl.textContent = 'Restart Quiz';
        btnEl.onclick = () => this.initializeQuiz();
    }
    
    // Module Action Functions
    toggleBookmark() {
        const bookmarkBtn = document.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            const isBookmarked = bookmarkBtn.textContent.includes('📖');
            if (isBookmarked) {
                bookmarkBtn.innerHTML = '📋 Bookmark';
                this.showToast('Bookmark removed');
            } else {
                bookmarkBtn.innerHTML = '📖 Bookmarked';
                this.showToast('Module bookmarked');
            }
        }
    }
    
    openNotes() {
        // Simulate opening notes
        this.showToast('Notes feature coming soon!');
    }
    
    shareModule() {
        if (navigator.share) {
            navigator.share({
                title: 'Microcontroller Programming - RRB Electronics',
                text: 'Learn microcontroller programming for railway signal systems',
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showToast('Link copied to clipboard');
            });
        }
    }
    
    showToast(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
}

// Global functions for HTML onclick events
function simulateLED() {
    if (window.microcontrollerModule) {
        window.microcontrollerModule.simulateLED();
    }
}

function checkCode() {
    if (window.microcontrollerModule) {
        window.microcontrollerModule.checkCode();
    }
}

function nextQuestion() {
    if (window.microcontrollerModule) {
        window.microcontrollerModule.nextQuestion();
    }
}

function toggleBookmark() {
    if (window.microcontrollerModule) {
        window.microcontrollerModule.toggleBookmark();
    }
}

function openNotes() {
    if (window.microcontrollerModule) {
        window.microcontrollerModule.openNotes();
    }
}

function shareModule() {
    if (window.microcontrollerModule) {
        window.microcontrollerModule.shareModule();
    }
}

// Add slide animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.microcontrollerModule = new MicrocontrollerModule();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MicrocontrollerModule;
}