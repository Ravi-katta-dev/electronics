// Enhanced Exam Engine for Exam Simulator
// Builds upon the existing ExamEngine class with UI integration

class ExamSimulator {
  constructor() {
    this.questionBank = null;
    this.currentExam = null;
    this.examState = {
      currentQuestion: 0,
      answers: new Map(),
      timeRemaining: 0,
      startTime: null,
      endTime: null,
      examType: null,
      selectedModules: []
    };
    this.examSettings = {
      timeLimit: 90, // minutes
      negativeMarking: true,
      negativeMarkingRatio: 0.25,
      questionsPerExam: 100,
      passingPercentage: 60
    };
    this.timerInterval = null;
    this.isExamActive = false;
    
    this.init();
  }
  
  async init() {
    console.log('Exam Simulator initializing...');
    await this.loadQuestionBank();
    this.setupEventListeners();
    this.showStartScreen();
  }
  
  async loadQuestionBank() {
    try {
      // Use proper path resolution for GitHub Pages compatibility
      const basePath = window.githubPagesRouter ? window.githubPagesRouter.basePath : '';
      const questionsPath = window.location.pathname.includes('/tools/exam-simulator/') 
        ? './data/questions.json' 
        : (basePath ? `${basePath}/tools/exam-simulator/data/questions.json` : './tools/exam-simulator/data/questions.json');
      
      console.log('Loading questions from:', questionsPath);
      const response = await fetch(questionsPath);
      if (!response.ok) {
        throw new Error(`Failed to load questions: ${response.status}`);
      }
      this.questionBank = await response.json();
      console.log(`Loaded ${this.getTotalQuestions()} questions from ${Object.keys(this.questionBank.modules).length} modules`);
    } catch (error) {
      console.error('Error loading question bank:', error);
      this.showError('Failed to load question bank. Please refresh and try again.');
    }
  }
  
  getTotalQuestions() {
    if (!this.questionBank) return 0;
    return Object.values(this.questionBank.modules).reduce((total, module) => {
      return total + module.questions.length;
    }, 0);
  }
  
  setupEventListeners() {
    // Navigation buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action]')) {
        const action = e.target.dataset.action;
        this.handleAction(action, e.target);
      }
    });
    
    // Option selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.option-item')) {
        const optionItem = e.target.closest('.option-item');
        const optionIndex = parseInt(optionItem.dataset.option);
        this.selectOption(optionIndex);
      }
    });
    
    // Question navigation
    document.addEventListener('click', (e) => {
      if (e.target.matches('.question-dot')) {
        const questionIndex = parseInt(e.target.dataset.question);
        this.navigateToQuestion(questionIndex);
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.isExamActive) {
        this.handleKeyboardShortcuts(e);
      }
    });
    
    // Prevent page unload during exam
    window.addEventListener('beforeunload', (e) => {
      if (this.isExamActive) {
        e.preventDefault();
        e.returnValue = 'You have an active exam. Are you sure you want to leave?';
      }
    });
  }
  
  handleAction(action, element) {
    switch (action) {
      case 'start-full-exam':
        this.startExam('full');
        break;
      case 'start-module-exam':
        this.showModuleSelection();
        break;
      case 'start-practice-exam':
        this.startExam('practice');
        break;
      case 'next-question':
        this.nextQuestion();
        break;
      case 'prev-question':
        this.prevQuestion();
        break;
      case 'mark-for-review':
        this.markForReview();
        break;
      case 'submit-exam':
        this.confirmSubmitExam();
        break;
      case 'end-exam':
        this.confirmEndExam();
        break;
      case 'start-new-exam':
        this.showStartScreen();
        break;
      case 'view-solutions':
        this.showSolutions();
        break;
      default:
        console.log('Unknown action:', action);
    }
  }
  
  handleKeyboardShortcuts(e) {
    // Prevent default for our shortcuts
    if (['ArrowLeft', 'ArrowRight', 'KeyM', 'KeyS', 'Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
      e.preventDefault();
    }
    
    switch (e.code) {
      case 'ArrowLeft':
        this.prevQuestion();
        break;
      case 'ArrowRight':
        this.nextQuestion();
        break;
      case 'KeyM':
        this.markForReview();
        break;
      case 'KeyS':
        this.confirmSubmitExam();
        break;
      case 'Digit1':
        this.selectOption(0);
        break;
      case 'Digit2':
        this.selectOption(1);
        break;
      case 'Digit3':
        this.selectOption(2);
        break;
      case 'Digit4':
        this.selectOption(3);
        break;
    }
  }
  
  showStartScreen() {
    this.isExamActive = false;
    const container = document.getElementById('exam-container');
    container.innerHTML = `
      <div class="exam-start">
        <div class="exam-start-icon">📋</div>
        <h1 class="exam-start-title">RRB Electronics Exam Simulator</h1>
        <p class="exam-start-description">
          Choose your exam type to begin. The simulator provides a CBT interface identical to the actual RRB exam with comprehensive question bank and performance analytics.
        </p>
        
        <div class="exam-options">
          <div class="exam-option" data-action="start-full-exam">
            <div class="option-icon">🎯</div>
            <div class="option-title">Full Mock Test</div>
            <div class="option-description">100 questions, 90 minutes, negative marking</div>
          </div>
          
          <div class="exam-option" data-action="start-module-exam">
            <div class="option-icon">📚</div>
            <div class="option-title">Module Test</div>
            <div class="option-description">Choose specific modules, 30 questions, 45 minutes</div>
          </div>
          
          <div class="exam-option" data-action="start-practice-exam">
            <div class="option-icon">🔧</div>
            <div class="option-title">Practice Mode</div>
            <div class="option-description">50 questions, 60 minutes, no negative marking</div>
          </div>
        </div>
        
        <div class="nav-buttons">
          <a href="../../index.html" class="nav-button secondary">← Back to Home</a>
        </div>
      </div>
    `;
  }
  
  showModuleSelection() {
    if (!this.questionBank) return;
    
    const container = document.getElementById('exam-container');
    const modules = Object.entries(this.questionBank.modules);
    
    container.innerHTML = `
      <div class="exam-start">
        <div class="exam-start-icon">📚</div>
        <h1 class="exam-start-title">Select Modules</h1>
        <p class="exam-start-description">
          Choose one or more modules for your practice test. Questions will be selected randomly from the chosen modules.
        </p>
        
        <div class="exam-options">
          ${modules.map(([key, module]) => `
            <div class="exam-option module-option" data-module="${key}">
              <div class="option-icon">📖</div>
              <div class="option-title">${module.name}</div>
              <div class="option-description">${module.questions.length} questions available</div>
            </div>
          `).join('')}
        </div>
        
        <div class="nav-buttons">
          <button class="nav-button primary" onclick="examSimulator.startModuleExam()">Start Module Test</button>
          <button class="nav-button secondary" data-action="start-new-exam">← Back</button>
        </div>
      </div>
    `;
    
    // Handle module selection
    document.querySelectorAll('.module-option').forEach(option => {
      option.addEventListener('click', () => {
        option.classList.toggle('selected');
      });
    });
  }
  
  startModuleExam() {
    const selectedModules = Array.from(document.querySelectorAll('.module-option.selected'))
      .map(el => el.dataset.module);
    
    if (selectedModules.length === 0) {
      this.showNotification('Please select at least one module', 'warning');
      return;
    }
    
    this.examState.selectedModules = selectedModules;
    this.startExam('module');
  }
  
  startExam(examType) {
    if (!this.questionBank) {
      this.showError('Question bank not loaded');
      return;
    }
    
    this.examState.examType = examType;
    this.examState.startTime = Date.now();
    this.examState.currentQuestion = 0;
    this.examState.answers.clear();
    
    // Set exam parameters based on type
    const examPattern = this.questionBank.exam_patterns[examType === 'module' ? 'module_exam' : examType === 'practice' ? 'practice_exam' : 'full_exam'];
    this.examSettings.timeLimit = examPattern.time_limit;
    this.examSettings.questionsPerExam = examPattern.questions;
    this.examSettings.negativeMarking = examPattern.negative_marking;
    this.examSettings.negativeMarkingRatio = examPattern.negative_ratio;
    
    this.examState.timeRemaining = this.examSettings.timeLimit * 60; // Convert to seconds
    
    // Generate questions
    this.currentExam = this.generateExamQuestions(examType);
    
    if (this.currentExam.length === 0) {
      this.showError('No questions available for the selected criteria');
      return;
    }
    
    this.isExamActive = true;
    this.startTimer();
    this.renderExamInterface();
    this.showQuestion(0);
    
    console.log(`Started ${examType} exam with ${this.currentExam.length} questions`);
  }
  
  generateExamQuestions(examType) {
    const questions = [];
    
    if (examType === 'full') {
      const distribution = this.questionBank.exam_patterns.full_exam.distribution;
      Object.entries(distribution).forEach(([moduleKey, count]) => {
        const moduleQuestions = this.questionBank.modules[moduleKey]?.questions || [];
        const selectedQuestions = this.selectRandomQuestions(moduleQuestions, count);
        questions.push(...selectedQuestions.map(q => ({ ...q, module: moduleKey })));
      });
    } else if (examType === 'module') {
      this.examState.selectedModules.forEach(moduleKey => {
        const moduleQuestions = this.questionBank.modules[moduleKey]?.questions || [];
        questions.push(...moduleQuestions.map(q => ({ ...q, module: moduleKey })));
      });
      
      // Limit to exam settings
      const shuffled = this.shuffleArray(questions);
      return shuffled.slice(0, this.examSettings.questionsPerExam);
    } else if (examType === 'practice') {
      Object.entries(this.questionBank.modules).forEach(([moduleKey, module]) => {
        const selectedQuestions = this.selectRandomQuestions(module.questions, 7);
        questions.push(...selectedQuestions.map(q => ({ ...q, module: moduleKey })));
      });
    }
    
    return this.shuffleArray(questions);
  }
  
  selectRandomQuestions(questions, count) {
    const shuffled = this.shuffleArray([...questions]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
  
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  renderExamInterface() {
    const container = document.getElementById('exam-container');
    container.innerHTML = `
      <div class="exam-header">
        <div class="exam-header-content">
          <div>
            <h1 class="exam-title">RRB Electronics ${this.examState.examType.charAt(0).toUpperCase() + this.examState.examType.slice(1)} Exam</h1>
            <p class="exam-subtitle">${this.currentExam.length} Questions • ${this.examSettings.timeLimit} Minutes</p>
          </div>
          <div class="exam-timer">
            <div class="timer-display" id="exam-timer">--:--</div>
            <div class="timer-label">Time Remaining</div>
          </div>
        </div>
      </div>
      
      <div class="progress-container">
        <div class="progress-header">
          <h3 class="progress-title">Progress</h3>
          <div class="progress-stats">
            <span id="answered-count">0</span>/${this.currentExam.length} Answered
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
        </div>
        <div class="progress-legend">
          <div class="legend-item">
            <div class="legend-dot" style="background: var(--success-color)"></div>
            <span>Answered</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background: var(--warning-color)"></div>
            <span>Marked</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background: var(--primary-color)"></div>
            <span>Current</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background: var(--border-color)"></div>
            <span>Not Visited</span>
          </div>
        </div>
      </div>
      
      <div class="question-panel" id="question-panel">
        <!-- Question content will be inserted here -->
      </div>
      
      <div class="navigation-panel">
        <div class="nav-buttons">
          <button class="nav-button secondary" data-action="prev-question" id="prev-btn">← Previous</button>
          <button class="nav-button secondary" data-action="mark-for-review" id="mark-btn">🔖 Mark for Review</button>
          <button class="nav-button primary" data-action="next-question" id="next-btn">Next →</button>
          <button class="nav-button danger" data-action="submit-exam" id="submit-btn">Submit Exam</button>
        </div>
      </div>
      
      <div class="question-map">
        <h3 class="map-title">Question Navigator</h3>
        <div class="question-grid" id="question-grid">
          ${this.renderQuestionGrid()}
        </div>
      </div>
    `;
  }
  
  renderQuestionGrid() {
    return this.currentExam.map((_, index) => `
      <div class="question-dot" data-question="${index}">
        ${index + 1}
      </div>
    `).join('');
  }
  
  showQuestion(questionIndex) {
    if (questionIndex < 0 || questionIndex >= this.currentExam.length) return;
    
    this.examState.currentQuestion = questionIndex;
    const question = this.currentExam[questionIndex];
    const userAnswer = this.examState.answers.get(questionIndex);
    
    const questionPanel = document.getElementById('question-panel');
    questionPanel.innerHTML = `
      <div class="question-header">
        <div class="question-info">
          <div class="question-number">Question ${questionIndex + 1}</div>
          <div class="question-difficulty difficulty-${question.difficulty}">${question.difficulty}</div>
        </div>
        <p class="question-text">${question.question}</p>
      </div>
      
      <div class="options-container">
        ${question.options.map((option, index) => `
          <div class="option-item ${userAnswer?.answer === index ? 'selected' : ''}" data-option="${index}">
            <div class="option-content">
              <div class="option-label">${String.fromCharCode(65 + index)}</div>
              <div class="option-text">${option}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    this.updateQuestionGrid();
    this.updateProgress();
    this.updateNavigationButtons();
  }
  
  selectOption(optionIndex) {
    const questionIndex = this.examState.currentQuestion;
    
    // Clear previous selection
    document.querySelectorAll('.option-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Mark new selection
    const selectedOption = document.querySelector(`[data-option="${optionIndex}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }
    
    // Save answer
    this.examState.answers.set(questionIndex, {
      answer: optionIndex,
      timestamp: Date.now(),
      timeSpent: Date.now() - this.examState.startTime
    });
    
    this.updateQuestionGrid();
    this.updateProgress();
    
    console.log(`Answer selected for question ${questionIndex + 1}: ${String.fromCharCode(65 + optionIndex)}`);
  }
  
  updateQuestionGrid() {
    const questionDots = document.querySelectorAll('.question-dot');
    questionDots.forEach((dot, index) => {
      dot.className = 'question-dot';
      
      if (index === this.examState.currentQuestion) {
        dot.classList.add('current');
      } else if (this.examState.answers.has(index)) {
        const answer = this.examState.answers.get(index);
        if (answer.marked) {
          dot.classList.add('marked');
        } else {
          dot.classList.add('answered');
        }
      }
    });
  }
  
  updateProgress() {
    const answeredCount = this.examState.answers.size;
    const progressPercentage = (answeredCount / this.currentExam.length) * 100;
    
    document.getElementById('answered-count').textContent = answeredCount;
    document.getElementById('progress-fill').style.width = `${progressPercentage}%`;
  }
  
  updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = this.examState.currentQuestion === 0;
    nextBtn.disabled = this.examState.currentQuestion === this.currentExam.length - 1;
  }
  
  nextQuestion() {
    if (this.examState.currentQuestion < this.currentExam.length - 1) {
      this.showQuestion(this.examState.currentQuestion + 1);
    }
  }
  
  prevQuestion() {
    if (this.examState.currentQuestion > 0) {
      this.showQuestion(this.examState.currentQuestion - 1);
    }
  }
  
  navigateToQuestion(questionIndex) {
    if (questionIndex >= 0 && questionIndex < this.currentExam.length) {
      this.showQuestion(questionIndex);
    }
  }
  
  markForReview() {
    const questionIndex = this.examState.currentQuestion;
    const existingAnswer = this.examState.answers.get(questionIndex) || {};
    
    this.examState.answers.set(questionIndex, {
      ...existingAnswer,
      marked: true,
      timestamp: Date.now()
    });
    
    this.updateQuestionGrid();
    this.showNotification('Question marked for review', 'info');
  }
  
  startTimer() {
    this.updateTimerDisplay();
    
    this.timerInterval = setInterval(() => {
      this.examState.timeRemaining--;
      this.updateTimerDisplay();
      
      if (this.examState.timeRemaining <= 0) {
        this.endExam('timeout');
      }
    }, 1000);
  }
  
  updateTimerDisplay() {
    const minutes = Math.floor(this.examState.timeRemaining / 60);
    const seconds = this.examState.timeRemaining % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerElement = document.getElementById('exam-timer');
    if (timerElement) {
      timerElement.textContent = timeString;
      
      // Warning colors
      if (this.examState.timeRemaining < 300) { // Last 5 minutes
        timerElement.style.color = 'var(--danger-color)';
      } else if (this.examState.timeRemaining < 900) { // Last 15 minutes
        timerElement.style.color = 'var(--warning-color)';
      }
    }
  }
  
  confirmSubmitExam() {
    const unanswered = this.currentExam.length - this.examState.answers.size;
    const message = unanswered > 0 
      ? `You have ${unanswered} unanswered questions. Are you sure you want to submit?`
      : 'Are you sure you want to submit your exam?';
    
    if (confirm(message)) {
      this.endExam('submitted');
    }
  }
  
  confirmEndExam() {
    if (confirm('Are you sure you want to end the exam? This action cannot be undone.')) {
      this.endExam('ended');
    }
  }
  
  endExam(reason = 'submitted') {
    this.examState.endTime = Date.now();
    this.isExamActive = false;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    const results = this.calculateResults();
    this.saveResults(results);
    this.showResults(results, reason);
    
    console.log(`Exam ended (${reason}):`, results);
  }
  
  calculateResults() {
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unattempted = 0;
    let totalMarks = 0;
    const moduleStats = new Map();
    
    this.currentExam.forEach((question, index) => {
      const userAnswer = this.examState.answers.get(index);
      const module = question.module;
      
      // Initialize module stats
      if (!moduleStats.has(module)) {
        moduleStats.set(module, { total: 0, correct: 0, incorrect: 0, unattempted: 0 });
      }
      const modStats = moduleStats.get(module);
      modStats.total++;
      
      if (userAnswer === undefined) {
        unattempted++;
        modStats.unattempted++;
      } else if (userAnswer.answer === question.correct) {
        correctAnswers++;
        modStats.correct++;
        totalMarks += 1;
      } else {
        incorrectAnswers++;
        modStats.incorrect++;
        if (this.examSettings.negativeMarking) {
          totalMarks -= this.examSettings.negativeMarkingRatio;
        }
      }
    });
    
    const totalQuestions = this.currentExam.length;
    const percentage = Math.max(0, (totalMarks / totalQuestions) * 100);
    const isPassed = percentage >= this.examSettings.passingPercentage;
    const timeTaken = Math.floor((this.examState.endTime - this.examState.startTime) / 1000);
    
    // Convert module stats to percentage
    const moduleAnalysis = {};
    moduleStats.forEach((stats, module) => {
      moduleAnalysis[module] = {
        ...stats,
        percentage: ((stats.correct / stats.total) * 100).toFixed(1)
      };
    });
    
    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unattempted,
      totalMarks: Math.max(0, totalMarks).toFixed(2),
      percentage: percentage.toFixed(2),
      isPassed,
      timeTaken,
      moduleAnalysis,
      examType: this.examState.examType,
      date: new Date().toISOString()
    };
  }
  
  saveResults(results) {
    try {
      const savedResults = JSON.parse(localStorage.getItem('examResults') || '[]');
      savedResults.push({
        ...results,
        examId: Date.now()
      });
      
      // Keep only last 50 results
      if (savedResults.length > 50) {
        savedResults.splice(0, savedResults.length - 50);
      }
      
      localStorage.setItem('examResults', JSON.stringify(savedResults));
    } catch (error) {
      console.error('Error saving results:', error);
    }
  }
  
  showResults(results, reason) {
    const container = document.getElementById('exam-container');
    const reasonText = {
      'submitted': 'Exam Submitted',
      'timeout': 'Time Up!',
      'ended': 'Exam Ended'
    };
    
    container.innerHTML = `
      <div class="exam-results">
        <div class="results-header">
          <div class="results-icon">${results.isPassed ? '🎉' : '📊'}</div>
          <h1 class="results-title">${reasonText[reason] || 'Exam Complete'}</h1>
          <p class="results-score">${results.percentage}% (${results.totalMarks}/${results.totalQuestions} marks)</p>
        </div>
        
        <div class="results-body">
          <div class="results-grid">
            <div class="result-card">
              <div class="result-value">${results.correctAnswers}</div>
              <div class="result-label">Correct</div>
            </div>
            <div class="result-card">
              <div class="result-value">${results.incorrectAnswers}</div>
              <div class="result-label">Incorrect</div>
            </div>
            <div class="result-card">
              <div class="result-value">${results.unattempted}</div>
              <div class="result-label">Unattempted</div>
            </div>
            <div class="result-card">
              <div class="result-value">${Math.floor(results.timeTaken / 60)}m</div>
              <div class="result-label">Time Taken</div>
            </div>
          </div>
          
          <div class="module-analysis">
            <h3 class="analysis-title">Module-wise Performance</h3>
            ${Object.entries(results.moduleAnalysis).map(([module, stats]) => `
              <div class="module-item">
                <span class="module-name">${this.questionBank.modules[module]?.name || module}</span>
                <span class="module-score">${stats.percentage}%</span>
              </div>
            `).join('')}
          </div>
          
          <div class="nav-buttons">
            <button class="nav-button primary" data-action="start-new-exam">Take Another Test</button>
            <button class="nav-button secondary" data-action="view-solutions">View Solutions</button>
            <a href="../../index.html" class="nav-button secondary">← Back to Home</a>
          </div>
        </div>
      </div>
    `;
  }
  
  showSolutions() {
    // Implementation for showing detailed solutions
    this.showNotification('Solutions feature coming soon!', 'info');
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '600',
      zIndex: '10000',
      opacity: '0',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease-in-out'
    });
    
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  showError(message) {
    const container = document.getElementById('exam-container');
    container.innerHTML = `
      <div class="exam-start">
        <div class="exam-start-icon">❌</div>
        <h1 class="exam-start-title">Error</h1>
        <p class="exam-start-description">${message}</p>
        <div class="nav-buttons">
          <button class="nav-button primary" onclick="location.reload()">Retry</button>
          <a href="../../index.html" class="nav-button secondary">← Back to Home</a>
        </div>
      </div>
    `;
  }
}

// Initialize exam simulator when DOM is ready
let examSimulator;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    examSimulator = new ExamSimulator();
  });
} else {
  examSimulator = new ExamSimulator();
}

// Make it globally available
window.examSimulator = examSimulator;